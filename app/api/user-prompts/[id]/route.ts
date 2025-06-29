import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - 获取单个提示词详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const promptId = params.id

    const { data: prompt, error } = await supabase
      .from('user_prompts')
      .select(`
        *,
        users!user_prompts_user_id_fkey(
          id,
          name,
          email,
          image
        )
      `)
      .eq('id', promptId)
      .single()

    if (error || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // 权限检查
    if (prompt.status !== 'approved') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // 检查是否是管理员或提示词作者
      const { data: userInfo } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!userInfo?.is_admin && prompt.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // 检查用户是否点赞了这个提示词
    let isLikedByUser = false
    if (session?.user?.id) {
      const { data: userLike } = await supabase
        .from('user_prompt_likes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('prompt_id', promptId)
        .single()

      isLikedByUser = !!userLike
    }

    return NextResponse.json({
      prompt: {
        ...prompt,
        isLikedByUser
      }
    })

  } catch (error) {
    console.error('Error in GET /api/user-prompts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 更新提示词
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promptId = params.id
    const body = await request.json()

    // 获取原提示词
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('id', promptId)
      .single()

    if (fetchError || !existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // 检查权限
    const { data: userInfo } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    const isAdmin = userInfo?.is_admin
    const isOwner = existingPrompt.user_id === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 管理员操作
    if (isAdmin && body.adminAction) {
      const { action, status, featured, rejectionReason } = body.adminAction

      if (action === 'review') {
        const updateData: any = {
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString()
        }

        if (status) {
          updateData.status = status
        }

        if (featured !== undefined) {
          updateData.is_featured = featured
        }

        if (status === 'rejected' && rejectionReason) {
          updateData.rejection_reason = rejectionReason
        }

        const { data: updatedPrompt, error } = await supabase
          .from('user_prompts')
          .update(updateData)
          .eq('id', promptId)
          .select(`
            *,
            users!user_prompts_user_id_fkey(
              id,
              name,
              email,
              image
            )
          `)
          .single()

        if (error) {
          console.error('Error updating prompt status:', error)
          return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
        }

        return NextResponse.json({ prompt: updatedPrompt })
      }
    }

    // 用户编辑自己的提示词
    if (isOwner && !body.adminAction) {
      const { prompt, title, description, category, tags } = body

      // 验证数据
      if (prompt && prompt.length < 10) {
        return NextResponse.json({ error: 'Prompt must be at least 10 characters long' }, { status: 400 })
      }

      if (prompt && prompt.length > 1000) {
        return NextResponse.json({ error: 'Prompt must be less than 1000 characters' }, { status: 400 })
      }

      if (title && title.length > 100) {
        return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 })
      }

      const validCategories = ['fantasy', 'anime', 'cyberpunk', 'nature', 'portrait', 'abstract', 'cute', 'general']
      if (category && !validCategories.includes(category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }

      const updateData: any = {}
      if (prompt) updateData.prompt = prompt
      if (title) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (category) updateData.category = category
      if (tags !== undefined) updateData.tags = tags

      // 如果修改了内容，重置审核状态
      if (prompt || title || description) {
        updateData.status = 'pending'
        updateData.reviewed_by = null
        updateData.reviewed_at = null
        updateData.rejection_reason = null
      }

      const { data: updatedPrompt, error } = await supabase
        .from('user_prompts')
        .update(updateData)
        .eq('id', promptId)
        .select(`
          *,
          users!user_prompts_user_id_fkey(
            id,
            name,
            email,
            image
          )
        `)
        .single()

      if (error) {
        console.error('Error updating prompt:', error)
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
      }

      return NextResponse.json({ prompt: updatedPrompt })
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })

  } catch (error) {
    console.error('Error in PUT /api/user-prompts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - 删除提示词
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promptId = params.id

    // 获取提示词信息
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('user_prompts')
      .select('user_id')
      .eq('id', promptId)
      .single()

    if (fetchError || !existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // 检查权限
    const { data: userInfo } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    const isAdmin = userInfo?.is_admin
    const isOwner = existingPrompt.user_id === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 删除提示词（级联删除相关的点赞和使用记录）
    const { error } = await supabase
      .from('user_prompts')
      .delete()
      .eq('id', promptId)

    if (error) {
      console.error('Error deleting prompt:', error)
      return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Prompt deleted successfully' })

  } catch (error) {
    console.error('Error in DELETE /api/user-prompts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 