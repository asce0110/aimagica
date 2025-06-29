import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { v5 as uuidv5 } from 'uuid'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: imageId } = await params

    // 获取图片基本信息
    const { data: image, error: imageError } = await supabase
      .from('generated_images')
      .select(`
        id,
        prompt,
        style,
        generated_image_url,
        likes_count,
        view_count,
        created_at,
        user_id
      `)
      .eq('id', imageId)
      .eq('is_public', true)
      .eq('status', 'completed')
      .single()

    if (imageError) {
      console.error('Image query error:', imageError)
      return NextResponse.json(
        { error: 'Database error: ' + imageError.message },
        { status: 500 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // 单独查询用户信息（如果有用户ID）
    let userData = null
    if (image.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', image.user_id)
        .single()
      userData = user
    }

    // 获取真实评论数据
    const { data: commentsData, error: commentsError } = await supabase
      .from('image_comments')
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id
      `)
      .eq('image_id', imageId)
      .order('created_at', { ascending: false })
    
    const comments = commentsData || []

    if (commentsError) {
      console.error('Failed to fetch comments:', commentsError)
    }

    // 检查当前用户是否点赞了这张图片
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    let userId = ANONYMOUS_USER_ID // 默认匿名用户
    
    // 尝试获取Google用户信息
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        // 先查找现有用户
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (existingUser) {
          userId = existingUser.id
        } else {
          // 如果用户不存在，使用生成的UUID
          const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
          userId = uuidv5(session.user.email, namespace)
        }
      }
    } catch (error) {
      console.log('Using anonymous user for like check')
    }
    
    let hasLiked = false
    
    // 检查点赞状态（包括匿名用户）
    const { data: likeData } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', userId)
      .single()
    
    hasLiked = !!likeData

    // 更新浏览量（真实数据）
    const currentViews = image.view_count || 0
    const newViewCount = currentViews + 1
    
    // 异步更新浏览量，不等待结果
    supabase
      .from('generated_images')
      .update({ view_count: newViewCount })
      .eq('id', imageId)
      .then(() => {
        console.log('View count updated for image:', imageId, 'to', newViewCount)
      })
      .catch((error) => {
        console.error('Failed to update view count:', error)
      })

    // 构建返回数据
    const imageDetails = {
      id: image.id,
      title: `Generated Image - ${image.style}`,
      url: image.generated_image_url,
      prompt: image.prompt || 'No prompt available',
      style: image.style,
      author: userData?.full_name || 'Google User',
      authorAvatar: userData?.avatar_url || '/placeholder.svg?height=50&width=50&text=Admin',
      likes: image.likes_count || 0,
      views: newViewCount, // 真实浏览量
      comments: comments.length,
      createdAt: new Date(image.created_at).toLocaleDateString(),
      isLiked: hasLiked,
      tags: extractTags(image.prompt || ''),
      commentsData: await Promise.all(comments.map(async comment => {
        const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
        let commentUser = null
        console.log('🔍 处理图片详情页评论:', { commentId: comment.id, userId: comment.user_id })
        
        if (comment.user_id === ANONYMOUS_USER_ID) {
          // 匿名用户评论
          commentUser = null
          console.log('👤 图片详情页匿名评论')
        } else if (comment.user_id) {
          const { data: user, error: userError } = await supabase
            .from('users')  
            .select('id, full_name, avatar_url')
            .eq('id', comment.user_id)
            .single()
          
          if (userError) {
            console.error('❌ 图片详情页查询用户失败:', userError)
            // 查询失败时设为null，会被当作匿名用户处理
            commentUser = null
          } else {
            commentUser = user
            console.log('✅ 图片详情页获取用户信息:', { userId: comment.user_id, user })
          }
        } else {
          console.log('👤 图片详情页null用户ID评论')
        }
        
        // 检查当前用户是否点赞了这条评论（包括匿名用户）
        const { data: likeData } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', userId)
          .single()
        const commentLike = likeData
        
        const result = {
          id: comment.id,
          author: commentUser?.full_name || 'Anonymous User',
          authorAvatar: commentUser?.avatar_url || '/images/aimagica-logo.png',
          content: comment.content,
          createdAt: formatCommentDate(comment.created_at),
          likes: comment.likes_count || 0,
          isLiked: !!commentLike
        }
        
        console.log('📤 图片详情页返回评论数据:', result)
        return result
      }))
    }

    return NextResponse.json(imageDetails)

  } catch (error) {
    console.error('Error fetching image details:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch image details',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 从prompt中提取标签的辅助函数
function extractTags(prompt: string): string[] {
  // 简单的标签提取逻辑
  const words = prompt.toLowerCase()
    .split(/[,\s]+/)
    .filter(word => word.length > 2 && word.length < 15)
    .slice(0, 8) // 最多8个标签
  
  return Array.from(new Set(words))
}

// 格式化评论日期的辅助函数
function formatCommentDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else {
    return date.toLocaleDateString()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 获取用户信息，未登录用户使用匿名用户ID
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    let userId = ANONYMOUS_USER_ID // 默认匿名用户
    
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        // 先查找现有用户
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (existingUser) {
          userId = existingUser.id
        } else {
          // 如果用户不存在，使用生成的UUID
          const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
          userId = uuidv5(session.user.email, namespace)
        }
      }
    } catch (error) {
      console.log('Using anonymous user for like action')
    }
    
    const { id: imageId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'toggle_like') {
      console.log('🔍 处理点赞请求:', { imageId, userId, action, isAnonymous: userId === ANONYMOUS_USER_ID })
      
      // 切换点赞状态
      const { data: existingLike, error: checkError } = await supabase
        .from('image_likes')
        .select('id')
        .eq('image_id', imageId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ 检查现有点赞失败:', checkError)
        return NextResponse.json(
          { 
            error: 'Failed to check existing like',
            details: checkError.message 
          },
          { status: 500 }
        )
      }

      console.log('🔍 现有点赞状态:', existingLike ? '已点赞' : '未点赞')

      if (existingLike) {
        // 取消点赞
        console.log('🗑️ 执行取消点赞...')
        const { error } = await supabase
          .from('image_likes')
          .delete()
          .eq('image_id', imageId)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ 取消点赞失败:', error)
          return NextResponse.json(
            { 
              error: 'Failed to unlike image',
              details: error.message 
            },
            { status: 500 }
          )
        }

        console.log('✅ 取消点赞成功')
        return NextResponse.json({ liked: false })
      } else {
        // 添加点赞
        console.log('❤️ 执行添加点赞...')
        const { error } = await supabase
          .from('image_likes')
          .insert({
            image_id: imageId,
            user_id: userId
          })

        if (error) {
          console.error('❌ 添加点赞失败:', error)
          return NextResponse.json(
            { 
              error: 'Failed to like image',
              details: error.message 
            },
            { status: 500 }
          )
        }

        console.log('✅ 添加点赞成功')
        return NextResponse.json({ liked: true })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error processing image action:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to process action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 