import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 公共：获取风格数据（无需权限验证，仅用于调试）
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Public styles API: Testing database connection...')
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // image, video, both
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 基础查询
    let query = supabase
      .from('styles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    // 如果指定了类型，添加类型过滤
    if (type && ['image', 'video', 'both'].includes(type)) {
      query = query.or(`type.eq.${type},type.eq.both`)
    }

    console.log('📊 Running Supabase query...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Supabase query error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: 'Database query failed - table may not exist'
      }, { status: 500 })
    }

    console.log(`✅ Query successful - found ${data?.length || 0} styles`)

    return NextResponse.json({ 
      success: true,
      styles: data || [],
      count: data?.length || 0,
      message: 'Styles loaded successfully'
    })

  } catch (error) {
    console.error('❌ Public styles API error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      message: 'API error occurred'
    }, { status: 500 })
  }
} 