import { NextRequest, NextResponse } from 'next/server'

const WORKERS_API_BASE = 'https://aimagica-api.403153162.workers.dev'

export async function GET(request: NextRequest) {
  try {
    console.log('🖼️ 代理精选图片请求到Workers API')
    
    // 调用Workers API
    const response = await fetch(`${WORKERS_API_BASE}/api/featured-images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aimagica-frontend',
      },
    })
    
    if (!response.ok) {
      console.error('❌ Workers API精选图片错误:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch featured images' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ 精选图片获取成功:', data.images?.length || 0, '张图片')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ 精选图片代理错误:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}