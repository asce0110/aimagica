import { NextRequest, NextResponse } from 'next/server'

// 重定向到正确的图片生成端点
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deprecated endpoint', 
      message: 'Please use /api/generate/image for image generation',
      redirect: '/api/generate/image'
    },
    { status: 301 }
  )
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deprecated endpoint', 
      message: 'Please use /api/generate/image for image generation',
      redirect: '/api/generate/image'
    },
    { status: 301 }
  )
}