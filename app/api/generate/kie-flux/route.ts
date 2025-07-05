import { NextRequest, NextResponse } from 'next/server'

const WORKERS_API_BASE = 'https://aimagica-api.403153162.workers.dev'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🎨 代理KieFlux生图请求到Workers API')
    console.log('📊 请求数据:', body)
    
    // 调用Workers API
    const response = await fetch(`${WORKERS_API_BASE}/api/generate/kie-flux`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aimagica-frontend',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      console.error('❌ Workers API KieFlux错误:', response.status, response.statusText)
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Failed to generate image with KieFlux', details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ KieFlux生图请求成功')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ KieFlux代理错误:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}