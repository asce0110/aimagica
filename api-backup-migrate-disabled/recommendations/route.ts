import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}



// 获取个性化推荐
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        recommendations: getDefaultRecommendations()
      })
    }

    let recommendations = []

    if (session?.user?.email) {
      // 已登录用户：基于点赞历史推荐
      console.log('获取已登录用户的个性化推荐:', session.user.email)
      recommendations = await getPersonalizedRecommendations(session.user.email)
    } else {
      // 未登录用户：返回画廊随机推荐
      console.log('获取未登录用户的画廊随机推荐')
      recommendations = await getRandomGalleryRecommendations()
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations.slice(0, 4), // 最多返回4张图片
      isPersonalized: !!session?.user?.email
    })

  } catch (error) {
    console.error('获取推荐失败:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recommendations',
      recommendations: getDefaultRecommendations()
    })
  }
}

// 获取个性化推荐（基于用户点赞历史）
async function getPersonalizedRecommendations(userEmail: string) {
  try {
    // 1. 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (userError || !userData) {
      console.log('用户不存在，返回热门推荐')
      return await getPopularRecommendations()
    }

    // 2. 获取用户点赞的图片及其风格
    const { data: likedImages, error: likesError } = await supabase
      .from('image_likes')
      .select(`
        image_id,
        generated_images (
          id,
          style,
          prompt,
          generated_image_url,
          view_count,
          likes_count,
          user_id,
          users (
            full_name,
            email
          )
        )
      `)
      .eq('user_id', userData.id)
      .limit(20)

    console.log('用户点赞查询结果:', { likedImages, likesError, count: likedImages?.length })

    if (likesError || !likedImages || likedImages.length === 0) {
      console.log('用户没有点赞历史，返回画廊随机推荐')
      return await getRandomGalleryRecommendations()
    }

    // 3. 分析用户喜欢的风格
    const stylePreferences = {}
    likedImages.forEach(like => {
      const image = like.generated_images
      if (image && image.style) {
        stylePreferences[image.style] = (stylePreferences[image.style] || 0) + 1
      }
    })

    // 4. 获取用户喜欢的风格的其他图片
    const preferredStyles = Object.keys(stylePreferences)
      .sort((a, b) => stylePreferences[b] - stylePreferences[a])
      .slice(0, 3) // 取前3个最喜欢的风格

    if (preferredStyles.length === 0) {
      console.log('用户没有明确的风格偏好，返回画廊随机推荐')
      return await getRandomGalleryRecommendations()
    }

    // 5. 获取这些风格的推荐图片（排除用户已点赞的）
    const likedImageIds = likedImages.map(like => like.image_id)
    
    const { data: recommendations, error: recError } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        style,
        generated_image_url,
        view_count,
        likes_count,
        created_at,
        user_id,
        users (
          full_name,
          email
        )
      `)
      .in('style', preferredStyles)
      .not('id', 'in', `(${likedImageIds.join(',')})`)
      .not('user_id', 'eq', userData.id) // 排除用户自己的图片
      .eq('status', 'completed')
      .not('generated_image_url', 'is', null)
      .order('likes_count', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(8)

    console.log('风格推荐查询结果:', { recommendations, recError, count: recommendations?.length })

    if (recError || !recommendations || recommendations.length === 0) {
      // 如果没有找到推荐，直接返回用户点赞过的图片（随机选择）
      console.log('没有找到新推荐，返回用户点赞的图片')
      const userLikedImages = likedImages
        .filter(like => like.generated_images && like.generated_images.generated_image_url)
        .map(like => ({
          id: like.generated_images.id,
          url: like.generated_images.generated_image_url,
          title: `${like.generated_images.style} Art`,
          style: like.generated_images.style,
          prompt: like.generated_images.prompt || 'Amazing AI generated artwork',
          likes: like.generated_images.likes_count || 0,
          views: like.generated_images.view_count || 0,
          author: like.generated_images.users?.full_name || like.generated_images.users?.email?.split('@')[0] || 'AI Artist',
          isLiked: true
        }))
        .sort(() => Math.random() - 0.5) // 随机排序
        .slice(0, 4)
      
      console.log('用户点赞图片处理结果:', { count: userLikedImages.length })
      
      if (userLikedImages.length > 0) {
        return userLikedImages
      }
      
      // 如果用户点赞的图片也没有，返回画廊随机推荐
      console.log('用户点赞图片为空，返回画廊随机推荐')
      return await getRandomGalleryRecommendations()
    }

    // 6. 格式化推荐结果 - 直接使用数据库中的风格名称
    return recommendations.map(image => {
      return {
        id: image.id,
        url: image.generated_image_url,
        title: `${image.style} Art`,
        style: image.style,
        prompt: image.prompt || 'Amazing AI generated artwork',
        likes: image.likes_count || 0,
        views: image.view_count || 0,
        author: image.users?.full_name || image.users?.email?.split('@')[0] || 'AI Artist',
        isLiked: false // 这里可以进一步查询用户是否已点赞
      }
    })

  } catch (error) {
    console.error('获取个性化推荐失败:', error)
    return await getPopularRecommendations()
  }
}

// 获取画廊随机推荐（用于没有点赞历史的用户）
async function getRandomGalleryRecommendations() {
  try {
    console.log('获取画廊随机推荐')
    const { data: galleryImages, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        style,
        generated_image_url,
        view_count,
        likes_count,
        created_at,
        user_id,
        users (
          full_name,
          email
        )
      `)
      .eq('status', 'completed')
      .eq('is_public', true) // 只获取公开的画廊图片
      .not('generated_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20) // 获取更多图片用于随机选择

    console.log('画廊图片查询结果:', { galleryImages, error, count: galleryImages?.length })
    
    // 打印前几个图片的详细信息用于调试
    if (galleryImages && galleryImages.length > 0) {
      console.log('画廊图片样本数据:', galleryImages.slice(0, 2).map(img => ({
        id: img.id,
        style: img.style,
        prompt: img.prompt?.substring(0, 50) + '...',
        author: img.users?.full_name || img.users?.email
      })))
    }

    if (error || !galleryImages || galleryImages.length === 0) {
      console.log('画廊中没有图片，使用默认推荐')
      return getDefaultRecommendations()
    }

    // 随机选择4张图片
    const shuffled = galleryImages.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 4)

    const result = selected.map(image => {
      return {
        id: image.id,
        url: image.generated_image_url,
        title: `${image.style || 'AI'} Art`,
        style: image.style || 'AI Generated',
        prompt: image.prompt || 'Amazing AI generated artwork',
        likes: image.likes_count || 0,
        views: image.view_count || 0,
        author: image.users?.full_name || image.users?.email?.split('@')[0] || 'AI Artist',
        isLiked: false
      }
    })
    
    console.log('最终返回的推荐数据:', result.map(r => ({ id: r.id, style: r.style, author: r.author })))
    return result

  } catch (error) {
    console.error('获取画廊随机推荐失败:', error)
    return getDefaultRecommendations()
  }
}

// 获取热门推荐
async function getPopularRecommendations() {
  try {
    // 先尝试获取有点赞的图片
    const { data: popularImages, error } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        style,
        generated_image_url,
        view_count,
        likes_count,
        created_at,
        user_id,
        users (
          full_name,
          email
        )
      `)
      .eq('status', 'completed')
      .not('generated_image_url', 'is', null)
      .gte('likes_count', 0) // 降低门槛，包含0个赞的图片
      .order('likes_count', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(8)

    console.log('热门图片查询结果:', { popularImages, error, count: popularImages?.length })

    if (error || !popularImages || popularImages.length === 0) {
      // 如果没有热门图片，获取最新的完成图片
      console.log('没有热门图片，获取最新图片')
      const { data: latestImages, error: latestError } = await supabase
        .from('generated_images')
        .select(`
          id,
          prompt,
          style,
          generated_image_url,
          view_count,
          likes_count,
          created_at,
          user_id,
          users (
            full_name,
            email
          )
        `)
        .eq('status', 'completed')
        .not('generated_image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(8)

      console.log('最新图片查询结果:', { latestImages, latestError, count: latestImages?.length })

      if (latestError || !latestImages || latestImages.length === 0) {
        console.log('没有找到任何图片，使用默认推荐')
        return getDefaultRecommendations()
      }

      return latestImages.map(image => {
        return {
          id: image.id,
          url: image.generated_image_url,
          title: `${image.style || 'AI'} Art`,
          style: image.style || 'AI Generated',
          prompt: image.prompt || 'Amazing AI generated artwork',
          likes: image.likes_count || 0,
          views: image.view_count || 0,
          author: image.users?.full_name || image.users?.email?.split('@')[0] || 'AI Artist',
          isLiked: false
        }
      })
    }

    return popularImages.map(image => {
      return {
        id: image.id,
        url: image.generated_image_url,
        title: `${image.style || 'AI'} Art`,
        style: image.style || 'AI Generated',
        prompt: image.prompt || 'Amazing AI generated artwork',
        likes: image.likes_count || 0,
        views: image.view_count || 0,
        author: image.users?.full_name || image.users?.email?.split('@')[0] || 'AI Artist',
        isLiked: false
      }
    })

  } catch (error) {
    console.error('获取热门推荐失败:', error)
    return getDefaultRecommendations()
  }
}

// 默认推荐（当数据库查询失败时使用）
function getDefaultRecommendations() {
  const randomSeed = Math.floor(Math.random() * 1000)
  return [
    {
      id: 'default-1',
      url: `https://picsum.photos/400/400?random=${randomSeed + 1}`,
      title: 'Magical Anime Girl',
      style: 'Anime',
      prompt: 'Beautiful anime girl with flowing silver hair, starlight in her eyes, magical aura, detailed illustration',
      likes: 1245,
      views: 3456,
      author: 'AnimeMaster',
      isLiked: false
    },
    {
      id: 'default-2',
      url: `https://picsum.photos/400/400?random=${randomSeed + 2}`,
      title: 'Epic Dragon',
      style: 'Fantasy',
      prompt: 'Majestic dragon soaring through stormy clouds, lightning, epic fantasy scene, cinematic lighting',
      likes: 987,
      views: 2134,
      author: 'DragonLord',
      isLiked: false
    },
    {
      id: 'default-3',
      url: `https://picsum.photos/400/400?random=${randomSeed + 3}`,
      title: 'Neon City',
      style: 'Cyberpunk',
      prompt: 'Cyberpunk city at night, neon lights, flying cars, rain, reflective streets, futuristic atmosphere',
      likes: 756,
      views: 1890,
      author: 'NeonDreamer',
      isLiked: false
    },
    {
      id: 'default-4',
      url: `https://picsum.photos/400/400?random=${randomSeed + 4}`,
      title: 'Magical Cat',
      style: 'Cute',
      prompt: 'Cute cat wizard wearing a starry magic hat, casting rainbow spells, adorable expression',
      likes: 834,
      views: 2156,
      author: 'CatLover',
      isLiked: false
    }
  ]
} 