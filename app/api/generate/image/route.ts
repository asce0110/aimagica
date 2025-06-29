import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ApiManager } from '@/lib/services/api-manager'
import { getStyleById } from "@/lib/database/styles"
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let apiManager: ApiManager | null = null
  
  try {
    console.log('📸 Image generation API called')
    
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 解析请求体
    const body = await request.json()
    const { prompt, styleId, aspectRatio, imageCount, userId, uploadedImage, creationMode, modelId, kieModel } = body
    
          console.log('📋 Request params:', {
        prompt: prompt?.substring(0, 50) + '...',
        styleId,
        aspectRatio,
        imageCount: imageCount || 1,
        userId: userId ? 'provided' : 'not provided',
        uploadedImage: uploadedImage ? 'provided' : 'not provided',
        creationMode: creationMode || 'text2img',
        modelId: modelId ? `specified (${modelId})` : 'auto-select',
        kieModel: kieModel || 'pro'
      })

    // 先处理风格和默认提示词，再验证最终提示词
    let finalPrompt = prompt ? prompt.trim() : ''
    
    if (styleId) {
      console.log(`🎨 Fetching style template for styleId: ${styleId}`)
      
      const { data: style, error: styleError } = await supabase
        .from('styles')
        .select('name, prompt_template, default_prompt')
        .eq('id', styleId)
        .eq('is_active', true)
        .single()
      
      if (styleError) {
        console.error('❌ Error fetching style:', styleError)
        return NextResponse.json({
          success: false,
          error: 'Style not found or inactive'
        }, { status: 404 })
      }
      
      if (style) {
        console.log(`🎨 Found style: ${style.name}`)
        console.log(`📝 Template: ${style.prompt_template}`)
        console.log(`🎯 Default prompt: ${style.default_prompt}`)
        
        // 图生图模式：不使用默认提示词，只有用户输入才使用
        // 文生图模式：可以使用默认提示词
        let userPrompt = prompt ? prompt.trim() : ''
        if (!userPrompt && style.default_prompt && creationMode !== 'img2img') {
          userPrompt = style.default_prompt.trim()
          console.log(`🔄 Using default prompt for text-to-image: ${userPrompt}`)
        } else if (creationMode === 'img2img') {
          console.log(`🖼️ Image-to-image mode: ${userPrompt ? 'using user prompt' : 'no prompt, style template only'}`)
        }
        
        // 将提示词（用户输入或默认）插入到模板中
        if (style.prompt_template.includes('{prompt}')) {
          finalPrompt = style.prompt_template.replace('{prompt}', userPrompt)
        } else {
          // 如果模板没有{prompt}占位符，则在前面添加提示词
          finalPrompt = userPrompt ? `${userPrompt}, ${style.prompt_template}` : style.prompt_template
        }
        
        console.log(`✅ Final merged prompt: ${finalPrompt}`)
      }
    }

    // 验证最终提示词（在处理默认提示词之后）
    // 图生图模式允许没有提示词
    if (creationMode !== 'img2img' && (!finalPrompt || finalPrompt.trim().length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a prompt to generate an image!'
      }, { status: 400 })
    }
    
    // 图生图模式下：如果没有提示词，保持为空字符串（KIE.AI支持无提示词图生图）
    if (creationMode === 'img2img' && (!finalPrompt || finalPrompt.trim().length === 0)) {
      finalPrompt = '' // 完全空的提示词，让KIE.AI自己处理
      console.log('🖼️ Image-to-image mode with empty prompt - letting KIE.AI handle transformation')
    }

    // 准备生成选项
    const options: any = {}
    
    // 图生图模式：先将base64图片上传到R2获得URL
    if (creationMode === 'img2img' && uploadedImage) {
      console.log('🖼️ Image-to-image mode with uploaded image')
      console.log('📸 Upload image length:', uploadedImage.length)
      console.log('📸 Upload image format:', uploadedImage.substring(0, 50) + '...')
      
      try {
        console.log('📤 Uploading base64 image to R2...')
        
        // 调用内部API将base64图片上传到R2
        const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/images/upload-base64`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '', // 传递session cookie
          },
          body: JSON.stringify({
            imageData: uploadedImage,
            filename: 'img2img_input.png'
          }),
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Failed to upload image to R2')
        }

        const uploadResult = await uploadResponse.json()
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image to R2')
        }

        // 使用R2的URL而不是base64数据
        options.image_url = uploadResult.data.url
        console.log(`✅ Image uploaded to R2 successfully: ${uploadResult.data.url}`)
        
      } catch (uploadError) {
        console.error('❌ Failed to upload image to R2:', uploadError)
        // 如果R2上传失败，尝试直接使用base64（作为备选）
        options.image_url = uploadedImage
        console.log('⚠️ Falling back to base64 image data')
      }
    } else if (creationMode === 'img2img' && !uploadedImage) {
      console.log('❌ Image-to-image mode but no uploaded image provided')
    }
    
    // 设置图片数量（始终设置，包括1张的情况）
    if (imageCount) {
      options.num_outputs = imageCount
      options.count = imageCount // KIE.AI可能使用count参数
      console.log(`🖼️ Set image count to ${imageCount}`)
      console.log(`🐛 Debug: options now contains:`, JSON.stringify({
        num_outputs: options.num_outputs,
        count: options.count,
        size: options.size
      }))
    } else {
      // 默认生成1张图片
      options.num_outputs = 1
      options.count = 1
      console.log(`🖼️ Set default image count to 1`)
    }
    
    if (aspectRatio) {
      // 直接使用aspectRatio值，让ApiManager处理具体的格式转换
      // 这样保证了参数的一致性，避免重复转换
      options.size = aspectRatio
      console.log(`📐 Set aspect ratio to ${aspectRatio}`)
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      start(controller) {
        // 初始化ApiManager
        apiManager = ApiManager.getInstance()
        
        // 生成图片，并提供进度回调
        apiManager.generateImageWithProgress(
          finalPrompt,
          options,
          userId,
          modelId, // 指定模型ID
          kieModel, // Kie.ai模型选择
          // 进度回调函数
          (progress: number) => {
            console.log(`📊 Progress update: ${progress}%`)
            
            // 发送进度数据
            const progressData = JSON.stringify({
              type: 'progress',
              progress: Math.round(progress)
            }) + '\n'
            
            controller.enqueue(encoder.encode(progressData))
          }
        ).then(result => {
          console.log('🎉 Image generation completed')
          
          // 发送完成数据
          const completionData = JSON.stringify({
            type: 'complete',
            success: result.success,
            data: result.data,
            error: result.error
          }) + '\n'
          
          controller.enqueue(encoder.encode(completionData))
          controller.close()
          
        }).catch(error => {
          console.error('❌ Image generation failed:', error)
          
          // 发送错误数据
          const errorData = JSON.stringify({
            type: 'error',
            success: false,
            error: error.message || 'Generation failed'
          }) + '\n'
          
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
} 