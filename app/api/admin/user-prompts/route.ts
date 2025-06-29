import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { isAdmin } from '@/lib/database/admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - 管理员获取所有提示词（包括待审核的）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查管理员权限
    const isAdminUser = await isAdmin(session.user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('user_prompts')
      .select(`
        *,
        users!user_prompts_user_id_fkey(
          id,
          name,
          email,
          image
        ),
        reviewed_user:users!user_prompts_reviewed_by_fkey(
          id,
          name,
          email
        )
      `, { count: 'exact' })

    // 状态过滤
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // 分类过滤
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 搜索过滤
    if (search) {
      query = query.or(
        `prompt.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // 排序
    const validSortColumns = ['created_at', 'updated_at', 'likes_count', 'uses_count', 'status']
    if (validSortColumns.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: prompts, error, count } = await query

    if (error) {
      console.error('Error fetching prompts for admin:', error)
      
      // 如果是表不存在的错误，返回空数据而不是错误
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('📊 用户提示词表还未创建，返回空数据')
        return NextResponse.json({
          prompts: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          },
          stats: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          },
          notice: '数据库表未初始化，请先创建 user_prompts 相关表结构'
        })
      }
      
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
    }

    // 获取统计信息
    const { data: stats, error: statsError } = await supabase
      .from('user_prompts')
      .select('status')

    let statusStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }

    if (!statsError && stats) {
      statusStats = {
        total: stats.length || 0,
        pending: stats.filter(p => p.status === 'pending').length || 0,
        approved: stats.filter(p => p.status === 'approved').length || 0,
        rejected: stats.filter(p => p.status === 'rejected').length || 0
      }
    }

    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('Error in GET /api/admin/user-prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 批量操作提示词
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查管理员权限
    const isAdminUser = await isAdmin(session.user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, promptIds, data } = body

    if (!action || !promptIds || !Array.isArray(promptIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    let updateData: any = {
      reviewed_by: session.user.id || null,
      reviewed_at: new Date().toISOString()
    }

    switch (action) {
      case 'approve':
        updateData.status = 'approved'
        updateData.rejection_reason = null
        break

      case 'reject':
        updateData.status = 'rejected'
        if (data?.rejectionReason) {
          updateData.rejection_reason = data.rejectionReason
        }
        break

      case 'feature':
        updateData.is_featured = true
        break

      case 'unfeature':
        updateData.is_featured = false
        break

      case 'delete':
        // 批量删除
        const { error: deleteError } = await supabase
          .from('user_prompts')
          .delete()
          .in('id', promptIds)

        if (deleteError) {
          console.error('Error deleting prompts:', deleteError)
          return NextResponse.json({ error: 'Failed to delete prompts' }, { status: 500 })
        }

        return NextResponse.json({ 
          message: `${promptIds.length} prompts deleted successfully` 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // 执行批量更新
    const { error } = await supabase
      .from('user_prompts')
      .update(updateData)
      .in('id', promptIds)

    if (error) {
      console.error(`Error ${action}ing prompts:`, error)
      return NextResponse.json({ error: `Failed to ${action} prompts` }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `${promptIds.length} prompts ${action}ed successfully` 
    })

  } catch (error) {
    console.error('Error in POST /api/admin/user-prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 