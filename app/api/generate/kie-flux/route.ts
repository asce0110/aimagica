import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { KieFluxService } from '@/lib/services/kie-flux-service'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      prompt, 
      aspectRatio = '1:1', 
      inputImage, // 用于图像编辑
      mode = 'text_to_image' // 'text_to_image' 或 'image_edit'
    } = body

    // 验证必需参数
    if (!prompt) {
      return NextResponse.json({ 
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    if (mode === 'image_edit' && !inputImage) {
      return NextResponse.json({ 
        error: 'Input image is required for image editing' 
      }, { status: 400 })
    }

    // 从数据库获取Kie.ai API配置
    const supabase = await createServiceRoleClient()
    const { data: configs, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('provider', 'Kie.ai')
      .eq('type', 'image_generation')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (configError || !configs || configs.length === 0) {
      return NextResponse.json({ 
        error: 'No active Kie.ai API configuration found' 
      }, { status: 500 })
    }

    const config = configs[0] // 使用第一个可用的配置
    const kieService = new KieFluxService(config)

    // 验证配置
    if (!kieService.validateConfig()) {
      return NextResponse.json({ 
        error: 'Invalid Kie.ai API configuration' 
      }, { status: 500 })
    }

    let result
    
    if (mode === 'image_edit' && inputImage) {
      // 图像编辑模式
      result = await kieService.editImage({
        prompt,
        inputImage
      })
    } else {
      // 文本生成图像模式
      result = await kieService.generateImage({
        prompt,
        aspectRatio
      })
    }

    if (!result.success) {
      // 更新API配置的错误计数
      await supabase
        .from('api_configs')
        .update({ 
          error_count: config.error_count + 1,
          last_error_at: new Date().toISOString(),
          last_error_message: result.error
        })
        .eq('id', config.id)

      return NextResponse.json({ 
        error: result.error || 'Image generation failed' 
      }, { status: 500 })
    }

    // 更新API配置的成功计数
    await supabase
      .from('api_configs')
      .update({ 
        success_count: config.success_count + 1,
        last_success_at: new Date().toISOString(),
        last_used_at: new Date().toISOString()
      })
      .eq('id', config.id)

    // 如果是异步任务，返回任务ID
    if (result.data?.status === 'pending' || result.data?.status === 'processing') {
      return NextResponse.json({
        success: true,
        data: {
          taskId: result.data.taskId,
          status: result.data.status,
          message: 'Image generation started. Use the taskId to check status.',
          estimatedTime: result.data.estimatedTime
        }
      })
    }

    // 如果已完成，返回图像URL
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.data?.imageUrl,
        prompt,
        aspectRatio,
        model: config.model,
        mode,
        taskId: result.data?.taskId
      }
    })

  } catch (error) {
    console.error('❌ Kie.ai Flux generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// 获取任务状态
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ 
        error: 'Task ID is required' 
      }, { status: 400 })
    }

    // 获取API配置
    const supabase = await createServiceRoleClient()
    const { data: configs, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('provider', 'Kie.ai')
      .eq('type', 'image_generation')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (configError || !configs || configs.length === 0) {
      return NextResponse.json({ 
        error: 'No active Kie.ai API configuration found' 
      }, { status: 500 })
    }

    const config = configs[0] // 使用第一个可用的配置
    const kieService = new KieFluxService(config)

    const result = await kieService.getTaskStatus(taskId)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to get task status' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Kie.ai Flux status check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 