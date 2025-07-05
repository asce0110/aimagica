import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { v5 as uuidv5 } from 'uuid'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: imageId } = await params
    
    // 从数据库获取真实评论数据
    const { data: comments, error } = await supabase
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

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }



    // 格式化评论数据
    console.log('🔍 开始格式化评论数据，共', comments?.length || 0, '条评论')
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    const formattedComments = await Promise.all((comments || []).map(async comment => {
      let userName = 'Anonymous User'
      let userAvatar = '/images/aimagica-logo.png'
      
      console.log('📝 处理评论:', { commentId: comment.id, userId: comment.user_id })
      
      // 检查是否为匿名用户评论
      if (comment.user_id === ANONYMOUS_USER_ID) {
        // 匿名用户评论
        userName = 'Anonymous User'
        userAvatar = '/images/aimagica-logo.png'
        console.log('👤 匿名用户评论')
      } else if (comment.user_id) {
        console.log('🔍 查询注册用户信息:', comment.user_id)
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', comment.user_id)
          .single()
        
        if (userError) {
          console.error('❌ 查询用户失败:', userError)
          // 如果查询失败，当作匿名用户处理
          userName = 'Anonymous User'
          userAvatar = '/images/aimagica-logo.png'
        } else if (user) {
          userName = user.full_name || 'User'
          userAvatar = user.avatar_url || `/placeholder.svg?height=40&width=40&text=${userName.charAt(0)}`
          console.log('✅ 获取注册用户信息成功:', { userId: comment.user_id, userName, userAvatar })
        } else {
          console.log('❌ 未找到用户信息，当作匿名用户:', comment.user_id)
          userName = 'Anonymous User'
          userAvatar = '/images/aimagica-logo.png'
        }
      } else {
              // user_id 为 null 的评论也是匿名评论（向后兼容）
      userName = 'Anonymous User'
      userAvatar = '/images/aimagica-logo.png'
        console.log('👤 null用户ID评论')
      }
      
      const result = {
        id: comment.id,
        author: userName,
        authorAvatar: userAvatar,
        content: comment.content,
        createdAt: formatCommentDate(comment.created_at),
        likes: comment.likes_count || 0
      }
      
      console.log('📤 返回评论数据:', result)
      return result
    }))
    
    console.log('✅ 评论格式化完成，返回数据:')
    
    return NextResponse.json({
      success: true,
      data: formattedComments
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { content } = body
    const { id: imageId } = await params

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // 尝试获取当前登录用户信息
    let userId = null // 真正的匿名用户不存储在数据库中
    let authorName = 'Anonymous User'
    let authorAvatar = '/images/aimagica-logo.png'
    let googleUserEmail = null
    let isAnonymous = true
    
    // 获取NextAuth session信息
    try {
      const session = await getServerSession(authOptions)
      if (session?.user) {
        // 使用Google账户信息
        authorName = session.user.name || 'Google User'
        authorAvatar = session.user.image || `/placeholder.svg?height=40&width=40&text=${authorName.charAt(0)}`
        googleUserEmail = session.user.email
        // 为Google用户创建一个基于email的UUID
        const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // 标准命名空间UUID
        userId = uuidv5(session.user.email || 'anonymous', namespace)
        isAnonymous = false
        console.log('🔐 检测到登录用户:', { authorName, googleUserEmail, userId })
      } else {
        console.log('👤 匿名用户评论')
      }
    } catch (authError) {
      console.log('👤 认证失败，使用匿名用户:', authError)
    }

    // 如果是Google用户，查找或创建用户
    if (googleUserEmail && !isAnonymous) {
      console.log('处理Google用户:', { userId, authorName, googleUserEmail })
      
      // 先查找是否已经存在该邮箱的用户
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('email', googleUserEmail)
        .single()
      
      if (findError && findError.code !== 'PGRST116') {
        console.error('查找用户失败:', findError)
        return NextResponse.json(
          { error: 'Failed to check user profile' },
          { status: 500 }
        )
      }
      
      if (existingUser) {
        // 用户已存在，使用现有的用户ID，并更新头像信息
        console.log('用户已存在，使用现有ID:', existingUser.id)
        userId = existingUser.id
        authorName = existingUser.full_name || authorName
        
        // 总是使用最新的Google头像，并更新数据库
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: authorName,
            avatar_url: authorAvatar,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
        
        if (updateError) {
          console.error('更新用户信息失败:', updateError)
        } else {
          console.log('用户信息已更新，最新头像:', authorAvatar)
        }
      } else {
        // 用户不存在，创建新用户
        console.log('创建新用户:', { userId, authorName, googleUserEmail })
        
        const { data: createData, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: googleUserEmail,
            full_name: authorName,
            avatar_url: authorAvatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createError) {
          console.error('创建用户失败:', createError)
          return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
          )
        }
        
        console.log('用户创建成功:', createData)
      }
    }

    // 为匿名用户创建一个特殊的标识符
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    // 插入新评论到数据库
    let insertData
    if (isAnonymous) {
      // 匿名用户评论使用特殊的匿名用户ID
      insertData = {
        user_id: ANONYMOUS_USER_ID,
        image_id: imageId,
        content: content.trim()
      }
    } else {
      // 注册用户评论关联用户ID
      insertData = {
        user_id: userId,
        image_id: imageId,
        content: content.trim()
      }
    }

    console.log('💾 插入评论数据:', { isAnonymous, insertData })

    const { data: newComment, error: insertError } = await supabase
      .from('image_comments')
      .insert(insertData)
      .select(`
        id,
        content,
        likes_count,
        created_at,
        user_id
      `)
      .single()

    if (insertError) {
      console.error('Error inserting comment:', insertError)
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      )
    }

        // 格式化返回的评论数据，直接使用上面获取的Google用户信息
    const formattedComment = {
      id: newComment.id,
      author: authorName,
      authorAvatar: authorAvatar,
      content: newComment.content,
      createdAt: 'Just now',
      likes: 0
    }

    return NextResponse.json({
      success: true,
      data: formattedComment
    })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
} 