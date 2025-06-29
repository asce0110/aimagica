import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}

// 获取API使用日志
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查管理员权限
    const adminStatus = await isAdmin(session.user.email)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    if (!supabase) {
      return NextResponse.json({
        logs: [],
        stats: null,
        message: 'Database not configured'
      })
    }

    const { searchParams } = new URL(request.url)
    const apiConfigId = searchParams.get('api_config_id')
    const requestType = searchParams.get('request_type') // 'image_generation' 或 'video_generation'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const stats = searchParams.get('stats') === 'true'

    // 如果请求统计数据
    if (stats) {
      // 获取最近24小时的统计
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: statsData, error: statsError } = await supabase
        .from('api_usage_logs')
        .select(`
          status,
          request_type,
          response_time_ms,
          api_config_id,
          api_configs (
            name,
            provider
          )
        `)
        .gte('created_at', twentyFourHoursAgo.toISOString())

      if (statsError) {
        console.error('Error fetching usage stats:', statsError)
        return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
      }

      // 处理统计数据
      const stats = {
        total_requests: statsData?.length || 0,
        success_requests: statsData?.filter(log => log.status === 'success').length || 0,
        error_requests: statsData?.filter(log => log.status === 'error').length || 0,
        avg_response_time: statsData?.length > 0 
          ? Math.round(statsData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / statsData.length)
          : 0,
        requests_by_type: {
          image_generation: statsData?.filter(log => log.request_type === 'image_generation').length || 0,
          video_generation: statsData?.filter(log => log.request_type === 'video_generation').length || 0,
        },
        requests_by_api: statsData?.reduce((acc: any, log) => {
          const apiName = log.api_configs?.name || 'Unknown'
          acc[apiName] = (acc[apiName] || 0) + 1
          return acc
        }, {}) || {}
      }

      return NextResponse.json({ stats })
    }

    // 构建查询
    let query = supabase
      .from('api_usage_logs')
      .select(`
        *,
        api_configs (
          name,
          provider
        ),
        users (
          display_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (apiConfigId) {
      query = query.eq('api_config_id', apiConfigId)
    }

    if (requestType) {
      query = query.eq('request_type', requestType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching API usage logs:', error)
      return NextResponse.json({ error: 'Failed to fetch API usage logs' }, { status: 500 })
    }

    return NextResponse.json({ 
      logs: logs || [],
      message: 'API usage logs fetched successfully'
    })

  } catch (error) {
    console.error('❌ API usage logs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 