import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase-server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}

// 获取API配置列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查管理员权限
    const adminStatus = await isAdmin(session.user.email)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const provider = searchParams.get('provider')

    const supabase = await createServiceRoleClient()
    
    let query = supabase
      .from('api_configs')
      .select('*')
      .order('priority', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    if (provider) {
      query = query.ilike('provider', `%${provider}%`)
    }

    const { data: configs, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        error: 'Failed to fetch API configurations'
      }, { status: 500 })
    }

    return NextResponse.json({
      configs: configs || [],
      message: 'API configs fetched successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// 创建新的API配置
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查管理员权限
    const adminStatus = await isAdmin(session.user.email)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      type,
      provider,
      base_url,
      api_key,
      model,
      endpoint,
      priority,
      is_default,
      is_active,
      max_retries,
      timeout_seconds,
      rate_limit_per_minute,
      config_data
    } = body

    // 验证必需字段
    if (!name || !type || !provider || !base_url || !api_key) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // 如果设为默认，先清除其他默认配置
    if (is_default) {
      await supabase
        .from('api_configs')
        .update({ is_default: false })
        .eq('type', type)
    }

    const { data, error } = await supabase
      .from('api_configs')
      .insert({
        name,
        type,
        provider,
        base_url,
        api_key,
        model: model || '',
        endpoint: endpoint || '',
        priority: priority || 0,
        is_default: is_default || false,
        is_active: is_active !== undefined ? is_active : true,
        max_retries: max_retries || 3,
        timeout_seconds: timeout_seconds || 30,
        rate_limit_per_minute: rate_limit_per_minute || 60,
        config_data: config_data || {},
        success_count: 0,
        error_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        error: 'Failed to create API configuration'
      }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
} 