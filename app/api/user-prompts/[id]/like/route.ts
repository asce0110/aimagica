import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - 点赞提示词
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promptId = params.id

    // 检查提示词是否存在
    const { data: prompt, error: promptError } = await supabase
      .from('user_prompts')
      .select('id, status')
      .eq('id', promptId)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // 只能点赞已批准的提示词
    if (prompt.status !== 'approved') {
      return NextResponse.json({ error: 'Can only like approved prompts' }, { status: 400 })
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('user_prompt_likes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)
      .single()

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked this prompt' }, { status: 400 })
    }

    // 添加点赞记录
    const { error } = await supabase
      .from('user_prompt_likes')
      .insert({
        user_id: session.user.id,
        prompt_id: promptId
      })

    if (error) {
      console.error('Error adding like:', error)
      return NextResponse.json({ error: 'Failed to like prompt' }, { status: 500 })
    }

    // 获取更新后的点赞数
    const { data: updatedPrompt } = await supabase
      .from('user_prompts')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    return NextResponse.json({
      message: 'Prompt liked successfully',
      likesCount: updatedPrompt?.likes_count || 0
    })

  } catch (error) {
    console.error('Error in POST /api/user-prompts/[id]/like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - 取消点赞
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

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('user_prompt_likes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)
      .single()

    if (!existingLike) {
      return NextResponse.json({ error: 'Not liked yet' }, { status: 400 })
    }

    // 删除点赞记录
    const { error } = await supabase
      .from('user_prompt_likes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('prompt_id', promptId)

    if (error) {
      console.error('Error removing like:', error)
      return NextResponse.json({ error: 'Failed to unlike prompt' }, { status: 500 })
    }

    // 获取更新后的点赞数
    const { data: updatedPrompt } = await supabase
      .from('user_prompts')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    return NextResponse.json({
      message: 'Prompt unliked successfully',
      likesCount: updatedPrompt?.likes_count || 0
    })

  } catch (error) {
    console.error('Error in DELETE /api/user-prompts/[id]/like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 