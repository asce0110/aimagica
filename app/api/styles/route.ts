import { NextRequest, NextResponse } from 'next/server'

const WORKERS_API_BASE = 'https://aimagica-api.403153162.workers.dev'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // 构建Workers API URL
    const workersUrl = new URL('/api/styles', WORKERS_API_BASE)
    
    // 转发查询参数
    for (const [key, value] of searchParams.entries()) {
      workersUrl.searchParams.set(key, value)
    }
    
    console.log('🔄 代理样式请求到:', workersUrl.toString())
    
    // 调用Workers API
    const response = await fetch(workersUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aimagica-frontend',
      },
    })
    
    if (!response.ok) {
      console.error('❌ Workers API错误:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch styles from Workers API' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ 样式数据获取成功:', data.styles?.length || 0, '个样式')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ 样式代理错误:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}