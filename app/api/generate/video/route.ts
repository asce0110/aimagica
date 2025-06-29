import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ApiManager } from "@/lib/services/api-manager"
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, styleId, duration, fps, aspect_ratio, camera_motion } = body

    if (!prompt) {
      return NextResponse.json({ 
        error: 'Missing required field: prompt' 
      }, { status: 400 })
    }

    // 处理风格提示词模板
    let finalPrompt = prompt
    let usedStyleName = null

    if (styleId) {
      try {
        const { data: styleData, error: styleError } = await supabase
          .from('styles')
          .select('name, prompt_template, default_prompt, type, is_active')
          .eq('id', styleId)
          .eq('is_active', true)
          .single()
        
        if (styleData && (styleData.type === 'video' || styleData.type === 'both')) {
          // 如果用户没有输入提示词且有默认提示词，使用默认提示词
          let userPrompt = prompt.trim()
          if (!userPrompt && styleData.default_prompt) {
            userPrompt = styleData.default_prompt.trim()
            console.log(`🔄 Using default prompt for video: ${userPrompt}`)
          }
          
          // 应用风格的提示词模板
          if (styleData.prompt_template.includes('{prompt}')) {
            finalPrompt = styleData.prompt_template.replace('{prompt}', userPrompt)
          } else {
            finalPrompt = userPrompt ? `${userPrompt}, ${styleData.prompt_template}` : styleData.prompt_template
          }
          
          usedStyleName = styleData.name
          console.log(`🎭 Applied video style "${styleData.name}":`, finalPrompt)
        } else {
          console.warn(`⚠️ Video style ${styleId} not found, inactive, or not for video, using original prompt`)
        }
      } catch (error) {
        console.error('❌ Error fetching video style:', error)
        console.log('🔄 Continuing with original prompt...')
      }
    }

    // 构建生成选项
    const options: any = {}
    if (duration) options.duration = duration
    if (fps) options.fps = fps
    if (aspect_ratio) options.aspect_ratio = aspect_ratio
    if (camera_motion) options.camera_motion = camera_motion

    console.log(`🎬 Generating video for user ${session.user.email}:`, finalPrompt)

    // 使用API管理器生成视频，自动处理故障转移
    const apiManager = ApiManager.getInstance()
    const result = await apiManager.generateVideo(
      prompt,
      options,
      session.user.id || session.user.email
    )

    if (!result.success) {
      console.error('❌ Video generation failed:', result.error)
      return NextResponse.json({ 
        error: result.error || 'Video generation failed',
        details: 'All configured video generation APIs failed to respond'
      }, { status: 500 })
    }

    console.log(`✅ Video generated successfully in ${result.response_time_ms}ms using API ${result.api_config_id}`)

    return NextResponse.json({ 
      success: true,
      data: result.data,
      response_time_ms: result.response_time_ms,
      api_used: result.api_config_id,
      message: 'Video generated successfully'
    })

  } catch (error) {
    console.error('❌ Video generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 