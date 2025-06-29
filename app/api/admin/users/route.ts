import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查是否为管理员
    const adminEmails = ['admin@aimagica.com', 'your-admin@gmail.com']
    if (!adminEmails.includes(session.user.email!)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // 获取用户列表及其统计信息
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        display_name,
        avatar_url,
        subscription_tier,
        subscription_status,
        created_at,
        daily_render_count,
        user_stats (
          total_renders,
          total_rerenders,
          total_downloads
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.display_name || 'Anonymous User',
      email: user.email,
      avatar: user.display_name ? user.display_name.substring(0, 2).toUpperCase() : 'AU',
      joined: new Date(user.created_at).toISOString().split('T')[0],
      plan: user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1),
      status: user.subscription_status,
      images: user.user_stats?.[0]?.total_renders || 0,
      dailyRenders: user.daily_render_count
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: users.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 