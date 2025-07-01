import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()

    // 获取所有精选的图片
    const { data, error } = await supabase
      .from('featured_images')
      .select('image_id')

    if (error) {
      console.error('❌ 获取精选图片失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })

  } catch (error) {
    console.error('❌ 服务器错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageId, featured } = await request.json()

    if (!imageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image ID is required' 
      }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    if (featured) {
      // 添加到精选
      // 首先检查精选图片数量，最多12张
      const { data: existingFeatured, error: countError } = await supabase
        .from('featured_images')
        .select('image_id')

      if (countError) {
        console.error('❌ 检查精选图片数量失败:', countError)
        return NextResponse.json({ 
          success: false, 
          error: countError.message 
        }, { status: 500 })
      }

      if ((existingFeatured?.length || 0) >= 12) {
        return NextResponse.json({ 
          success: false, 
          error: 'Maximum 12 featured images allowed. Please remove one first.' 
        }, { status: 400 })
      }

      // 检查是否已经是精选
      const { data: existing } = await supabase
        .from('featured_images')
        .select('id')
        .eq('image_id', imageId)
        .single()

      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'Image is already featured' 
        }, { status: 400 })
      }

      // 添加到精选表
      const { error: insertError } = await supabase
        .from('featured_images')
        .insert({
          image_id: imageId,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('❌ 添加精选图片失败:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: insertError.message 
        }, { status: 500 })
      }
    } else {
      // 从精选中移除
      const { error: deleteError } = await supabase
        .from('featured_images')
        .delete()
        .eq('image_id', imageId)

      if (deleteError) {
        console.error('❌ 移除精选图片失败:', deleteError)
        return NextResponse.json({ 
          success: false, 
          error: deleteError.message 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: featured ? 'Image added to featured' : 'Image removed from featured' 
    })

  } catch (error) {
    console.error('❌ 服务器错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 