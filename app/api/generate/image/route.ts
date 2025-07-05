import { NextRequest, NextResponse } from 'next/server'

const WORKERS_API_BASE = 'https://aimagica-api.403153162.workers.dev'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🎨 代理生图请求到Workers API')
    console.log('📊 请求数据:', {
      prompt: body.prompt?.substring(0, 50) + '...',
      styleId: body.styleId,
      modelId: body.modelId,
      aspectRatio: body.aspectRatio,
      imageCount: body.imageCount
    })
    
    // 调用Workers API
    const response = await fetch(`${WORKERS_API_BASE}/api/generate/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aimagica-frontend',
        'Origin': 'https://aimagica.ai',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      console.error('❌ Workers API生图错误:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ 错误详情:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorText },
        { status: response.status }
      )
    }
    
    // 检查是否是流式响应
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('text/plain')) {
      // 流式响应 - 转发流数据
      console.log('📡 转发流式响应')
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // JSON响应
      const data = await response.json()
      console.log('✅ 生图请求成功')
      return NextResponse.json(data)
    }
    
  } catch (error) {
    console.error('❌ 生图代理错误:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}