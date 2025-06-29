import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()

    // 获取精选图片及其详细信息
    const { data, error } = await supabase
      .from('featured_images')
      .select(`
        image_id,
        created_at,
        generated_images (
          id,
          prompt,
          generated_image_url,
          style,
          is_public,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('❌ 获取精选图片失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // 转换数据格式，只返回公开的图片
    const featuredImages = (data || [])
      .map(item => ({
        id: item.generated_images?.id,
        title: `${item.generated_images?.style} Art`,
        prompt: item.generated_images?.prompt,
        image_url: item.generated_images?.generated_image_url,
        style: item.generated_images?.style,
        created_at: item.generated_images?.created_at,
        featured_at: item.created_at
      }))
      .filter(item => item.id && item.image_url) // 确保图片存在

    return NextResponse.json({ 
      success: true, 
      data: featuredImages 
    })

  } catch (error) {
    console.error('❌ 服务器错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 