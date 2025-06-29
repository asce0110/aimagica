import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../auth/[...nextauth]/route'
import { v5 as uuidv5 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { commentId } = await params
    
    // 尝试获取Google用户信息，如果失败则使用匿名用户
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    let userId = ANONYMOUS_USER_ID // 匿名用户ID
    
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
    } catch (authError) {
      console.log('Using anonymous user for comment like')
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // 取消点赞
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to unlike comment' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        liked: false,
        message: 'Comment unliked successfully'
      })
    } else {
      // 添加点赞
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to like comment' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        liked: true,
        message: 'Comment liked successfully'
      })
    }

  } catch (error) {
    console.error('Error toggling comment like:', error)
    return NextResponse.json(
      { error: 'Failed to process comment like' },
      { status: 500 }
    )
  }
} 