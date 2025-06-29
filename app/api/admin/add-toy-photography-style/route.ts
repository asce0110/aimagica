import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Adding TOY PHOTOGRAPHY style...')

    // 检查是否已存在 TOY PHOTOGRAPHY 风格
    const { data: existingStyle } = await supabase
      .from('styles')
      .select('id')
      .ilike('name', '%TOY PHOTOGRAPHY%')
      .single()

    if (existingStyle) {
      return NextResponse.json({
        success: true,
        message: 'TOY PHOTOGRAPHY style already exists',
        styleId: existingStyle.id
      })
    }

    // 创建 TOY PHOTOGRAPHY 风格
    const { data: newStyle, error } = await supabase
      .from('styles')
      .insert({
        name: 'TOY PHOTOGRAPHY',
        description: '玩具摄影风格，将真实物体转换为可爱的玩具模型效果',
        emoji: '🧸',
        prompt_template: '{prompt}, toy photography style, miniature effect, tilt-shift photography, cute toy model, detailed miniature scene, shallow depth of field, vibrant colors',
        type: 'image',
        category: 'photographic-realism',
        is_premium: false,
        is_active: true,
        sort_order: 100,
        // 设置限制条件
        requires_image_upload: true,
        requires_prompt_description: true,
        min_prompt_length: 10,
        max_prompt_length: 500,
        allowed_image_formats: ['jpg', 'jpeg', 'png', 'webp'],
        requirements_description: '此风格需要上传参考图片，AI将基于您的图片创造玩具摄影风格的作品。请确保图片清晰，主体明确。建议上传人物、动物或物体的照片以获得最佳效果。'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating TOY PHOTOGRAPHY style:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create style',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ TOY PHOTOGRAPHY style created successfully:', newStyle.id)

    return NextResponse.json({
      success: true,
      message: 'TOY PHOTOGRAPHY style created successfully',
      style: newStyle
    })

  } catch (error) {
    console.error('❌ Failed to add TOY PHOTOGRAPHY style:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add style',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 