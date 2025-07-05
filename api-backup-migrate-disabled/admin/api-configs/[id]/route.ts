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

// 获取单个API配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const { data: config, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching API config:', error)
      return NextResponse.json({ error: 'API config not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      config,
      message: 'API config fetched successfully'
    })

  } catch (error) {
    console.error('❌ API config fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新API配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
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

    // 验证type值（如果提供）
    if (type && !['image_generation', 'video_generation'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be "image_generation" or "video_generation"' 
      }, { status: 400 })
    }

    // 构建更新对象，只包含提供的字段
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (provider !== undefined) updateData.provider = provider
    if (base_url !== undefined) updateData.base_url = base_url
    if (api_key !== undefined) updateData.api_key = api_key
    if (model !== undefined) updateData.model = model
    if (endpoint !== undefined) updateData.endpoint = endpoint
    if (priority !== undefined) updateData.priority = priority
    if (is_default !== undefined) updateData.is_default = is_default
    if (is_active !== undefined) updateData.is_active = is_active
    if (max_retries !== undefined) updateData.max_retries = max_retries
    if (timeout_seconds !== undefined) updateData.timeout_seconds = timeout_seconds
    if (rate_limit_per_minute !== undefined) updateData.rate_limit_per_minute = rate_limit_per_minute
    if (config_data !== undefined) updateData.config_data = config_data

    const { data, error } = await supabase
      .from('api_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating API config:', error)
      return NextResponse.json({ error: 'Failed to update API config' }, { status: 500 })
    }

    return NextResponse.json({ 
      config: data,
      message: 'API config updated successfully'
    })

  } catch (error) {
    console.error('❌ API config update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除API配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    // 先检查是否是默认API
    const { data: config, error: fetchError } = await supabase
      .from('api_configs')
      .select('type, is_default')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'API config not found' }, { status: 404 })
    }

    // 如果是默认API，检查是否有其他同类型的API可以作为新的默认
    if (config.is_default) {
      const { data: otherConfigs, error: otherError } = await supabase
        .from('api_configs')
        .select('id')
        .eq('type', config.type)
        .eq('is_active', true)
        .neq('id', id)

      if (otherError || !otherConfigs || otherConfigs.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot delete the only active API config for this type. Please add another active API config first.' 
        }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('api_configs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting API config:', error)
      return NextResponse.json({ error: 'Failed to delete API config' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'API config deleted successfully'
    })

  } catch (error) {
    console.error('❌ API config deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 