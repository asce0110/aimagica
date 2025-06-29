import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getSystemLoginStats, getAdminLoginStats } from '@/lib/database/auth-logs'
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
    const type = searchParams.get('type') || 'all'
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    if (type === 'stats') {
      // 获取统计数据
      const [systemStats, adminStats] = await Promise.all([
        getSystemLoginStats(days),
        getAdminLoginStats(days)
      ])

      return NextResponse.json({
        systemStats,
        adminStatsCount: adminStats.length,
        recentAdminLogins: adminStats.slice(0, 10)
      })
    }

    // 获取登录日志列表
    let query = supabase
      .from('login_logs')
      .select(`
        id,
        email,
        login_method,
        success,
        error_message,
        login_time,
        logout_time,
        session_duration,
        is_admin_login,
        ip_address,
        user_agent
      `)
      .order('login_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // 根据类型过滤
    if (type === 'admin') {
      query = query.eq('is_admin_login', true)
    } else if (type === 'failed') {
      query = query.eq('success', false)
    } else if (type === 'success') {
      query = query.eq('success', true)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching login logs:', error)
      return NextResponse.json({ error: 'Failed to fetch login logs' }, { status: 500 })
    }

    // 格式化数据
    const formattedLogs = logs?.map(log => ({
      id: log.id,
      email: log.email,
      method: log.login_method,
      success: log.success,
      errorMessage: log.error_message,
      loginTime: new Date(log.login_time).toLocaleString(),
      logoutTime: log.logout_time ? new Date(log.logout_time).toLocaleString() : null,
      sessionDuration: log.session_duration ? `${Math.floor(log.session_duration / 60)}分${log.session_duration % 60}秒` : null,
      isAdmin: log.is_admin_login,
      ipAddress: log.ip_address || 'Unknown',
      userAgent: log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'Unknown'
    })) || []

    return NextResponse.json({
      logs: formattedLogs,
      total: logs?.length || 0,
      hasMore: (logs?.length || 0) === limit
    })

  } catch (error) {
    console.error('Error in login logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 