import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}

// 获取对用户可见的可用模型配置列表
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话（但不强制要求登录）
    const session = await getServerSession(authOptions)
    
    if (!supabase) {
      return NextResponse.json({
        models: [],
        message: 'Database not configured'
      })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'image_generation' // 默认为图片生成

    // 只返回活跃的API配置，并且只返回用户需要的基本信息
    const { data: configs, error } = await supabase
      .from('api_configs')
      .select('id, name, provider, model, is_default, priority, type')
      .eq('type', type)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('is_default', { ascending: false })

    if (error) {
      console.error('Error fetching available models:', error)
      return NextResponse.json({ error: 'Failed to fetch available models' }, { status: 500 })
    }

    // 格式化返回数据，只包含用户需要的信息
    const models = (configs || []).map(config => ({
      id: config.id,
      name: config.name,
      provider: config.provider,
      model: config.model,
      isDefault: config.is_default,
      displayName: `${config.provider} - ${config.model || config.name}`,
      shortName: config.provider
    }))

    return NextResponse.json({ 
      models,
      defaultModel: models.find(m => m.isDefault) || models[0] || null,
      message: 'Available models fetched successfully'
    })

  } catch (error) {
    console.error('❌ Available models fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 