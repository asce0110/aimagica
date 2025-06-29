import { NextRequest, NextResponse } from 'next/server'
import { getPublicImages } from "@/lib/database/images"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const styleFilter = searchParams.get('style')
    const optimize = searchParams.get('optimize') === 'true'

    console.log(`🎨 Fetching public gallery images (limit: ${limit}, offset: ${offset}, style: ${styleFilter}, optimize: ${optimize})`)

    // 获取公开的图片（按时间倒序排列），直接在数据库层面进行风格过滤
    const images = await getPublicImages(limit, offset, styleFilter || undefined)

    console.log(`✅ Found ${images.length} public images${styleFilter ? ` matching style: ${styleFilter}` : ''}`)

    // 获取每张图片的真实评论数量
    const galleryImages = await Promise.all(images.map(async (image) => {
      let commentsCount = 0
      
      // 只有在非优化模式下才获取评论数量（减少数据库查询）
      if (!optimize) {
        const { createClient } = await import('@/lib/supabase')
        const supabase = await createClient()
        
        const { count } = await supabase
          .from('image_comments')
          .select('*', { count: 'exact', head: true })
          .eq('image_id', image.id)
        
        commentsCount = count || 0
      }
      
      return {
        id: image.id,
        url: image.generated_image_url,
        title: image.prompt?.substring(0, 50) + '...' || 'Untitled',
        author: 'AIMAGICA User', // 可以后续扩展显示真实用户名
        authorAvatar: "/images/placeholder.svg",
        likes: image.likes_count || 0,
        comments: commentsCount, // 优化模式下为0，减少查询时间
        views: image.view_count || 0, // 真实浏览量
        downloads: 0, // 暂时设为0，后续可以添加下载功能
        isPremium: false,
        isFeatured: (image.likes_count || 0) > 10, // 超过10个赞的设为精选
        isLiked: false, // 需要用户登录状态才能判断
        createdAt: new Date(image.created_at).toLocaleDateString(),
        prompt: image.prompt || '',
        style: image.style,
        tags: optimize ? [] : extractTagsFromPrompt(image.prompt || ''), // 优化模式下跳过标签提取
        size: getRandomSize(),
        rotation: getRandomRotation()
      }
    }))

    // 返回图片数据，确保包含所需格式
    const responseData = {
      success: true,
      images: galleryImages, // 注意：这里使用 'images' 字段名，与RenderProgress组件中期望的字段名一致
      data: galleryImages,
      total: galleryImages.length,
      message: styleFilter 
        ? `Gallery images filtered by style "${styleFilter}" fetched successfully`
        : 'Gallery images fetched successfully'
    }

    const response = NextResponse.json(responseData)
    
    // 添加缓存头优化性能
    if (optimize) {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600') // 5分钟客户端缓存，10分钟CDN缓存
      response.headers.set('ETag', `gallery-${limit}-${offset}-${Date.now()}`)
    } else {
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120') // 1分钟客户端缓存，2分钟CDN缓存
    }
    
    return response

  } catch (error) {
    console.error('❌ Error fetching gallery images:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 从提示词中提取标签
function extractTagsFromPrompt(prompt: string): string[] {
  const commonTags = ['art', 'fantasy', 'portrait', 'landscape', 'digital', 'anime', 'realistic', 'abstract']
  const promptLower = prompt.toLowerCase()
  return commonTags.filter(tag => promptLower.includes(tag)).slice(0, 5)
}

// 生成随机大小
function getRandomSize(): "small" | "medium" | "large" | "vertical" | "horizontal" {
  const sizes = ["small", "medium", "large", "vertical", "horizontal"] as const
  return sizes[Math.floor(Math.random() * sizes.length)]
}

// 生成随机旋转角度
function getRandomRotation(): number {
  return (Math.random() - 0.5) * 6 // -3 到 3 度的随机旋转
} 