import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - 记录提示词使用
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

    // 只能使用已批准的提示词
    if (prompt.status !== 'approved') {
      return NextResponse.json({ error: 'Can only use approved prompts' }, { status: 400 })
    }

    // 添加使用记录
    const { error } = await supabase
      .from('user_prompt_uses')
      .insert({
        user_id: session.user.id,
        prompt_id: promptId
      })

    if (error) {
      console.error('Error recording prompt usage:', error)
      return NextResponse.json({ error: 'Failed to record prompt usage' }, { status: 500 })
    }

    // 获取更新后的使用次数
    const { data: updatedPrompt } = await supabase
      .from('user_prompts')
      .select('uses_count')
      .eq('id', promptId)
      .single()

    return NextResponse.json({
      message: 'Prompt usage recorded successfully',
      usesCount: updatedPrompt?.uses_count || 0
    })

  } catch (error) {
    console.error('Error in POST /api/user-prompts/[id]/use:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 