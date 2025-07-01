import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 懒加载 Supabase 客户端，避免构建时检查环境变量
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - 获取提示词列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'approved'
    const featured = searchParams.get('featured')
    const userId = searchParams.get('userId')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const supabase = getSupabaseClient()
    let query = supabase
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

    // 权限控制
    if (session?.user?.id) {
      // 检查是否是管理员
      const { data: userInfo } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!userInfo?.is_admin) {
        // 非管理员只能看到已批准的提示词和自己的提示词
        if (userId && userId === session.user.id) {
          query = query.or(`status.eq.approved,user_id.eq.${session.user.id}`)
        } else {
          query = query.eq('status', 'approved')
        }
      }
    } else {
      // 未登录用户只能看到已批准的提示词
      query = query.eq('status', 'approved')
    }

    // 过滤条件
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && session?.user?.id) {
      const { data: userInfo } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (userInfo?.is_admin) {
        query = query.eq('status', status)
      }
    }

    if (featured) {
      query = query.eq('is_featured', featured === 'true')
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (search) {
      query = query.or(
        `prompt.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`
      )
    }

    // 排序
    const validSortColumns = ['created_at', 'likes_count', 'uses_count', 'updated_at']
    if (validSortColumns.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: prompts, error, count } = await query

    if (error) {
      console.error('Error fetching prompts:', error)
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
    }

    // 检查用户是否点赞了这些提示词
    let promptsWithUserLikes = prompts
    if (session?.user?.id && prompts?.length) {
      const promptIds = prompts.map(p => p.id)
      const { data: userLikes } = await supabase
        .from('user_prompt_likes')
        .select('prompt_id')
        .eq('user_id', session.user.id)
        .in('prompt_id', promptIds)

      const likedPromptIds = new Set(userLikes?.map(like => like.prompt_id) || [])
      
      promptsWithUserLikes = prompts.map(prompt => ({
        ...prompt,
        isLikedByUser: likedPromptIds.has(prompt.id)
      }))
    }

    return NextResponse.json({
      prompts: promptsWithUserLikes,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/user-prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 创建新提示词
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, title, description, category, tags } = body

    // 验证必需字段
    if (!prompt || !title) {
      return NextResponse.json({ error: 'Prompt and title are required' }, { status: 400 })
    }

    // 验证提示词长度
    if (prompt.length < 10) {
      return NextResponse.json({ error: 'Prompt must be at least 10 characters long' }, { status: 400 })
    }

    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'Prompt must be less than 1000 characters' }, { status: 400 })
    }

    // 验证标题长度
    if (title.length > 100) {
      return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 })
    }

    // 验证分类
    const validCategories = ['fantasy', 'anime', 'cyberpunk', 'nature', 'portrait', 'abstract', 'cute', 'general']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // 检查是否有重复的提示词
    const supabase = getSupabaseClient()
    const { data: existingPrompt } = await supabase
      .from('user_prompts')
      .select('id')
      .eq('prompt', prompt)
      .eq('user_id', session.user.id)
      .single()

    if (existingPrompt) {
      return NextResponse.json({ error: 'You have already submitted this prompt' }, { status: 400 })
    }

    const { data: newPrompt, error } = await supabase
      .from('user_prompts')
      .insert({
        user_id: session.user.id,
        prompt,
        title,
        description,
        category: category || 'general',
        tags: tags || []
      })
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
      console.error('Error creating prompt:', error)
      return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
    }

    return NextResponse.json({ prompt: newPrompt }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/user-prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 