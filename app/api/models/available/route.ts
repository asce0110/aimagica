import { NextRequest, NextResponse } from 'next/server'

const WORKERS_API_BASE = 'https://aimagica-api.403153162.workers.dev'

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 代理可用模型请求到Workers API')
    
    // 调用Workers API
    const response = await fetch(`${WORKERS_API_BASE}/api/models/available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aimagica-frontend',
      },
    })
    
    if (!response.ok) {
      console.error('❌ Workers API模型错误:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch available models' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ 可用模型获取成功:', data.models?.length || 0, '个模型')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ 模型代理错误:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}