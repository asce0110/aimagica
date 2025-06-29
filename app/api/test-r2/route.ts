import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 检查环境变量
    const config = {
      hasEndpoint: !!process.env.CLOUDFLARE_R2_ENDPOINT,
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      hasBucketName: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
      hasCustomDomain: !!process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ? 
        process.env.CLOUDFLARE_R2_ENDPOINT.replace(/\/[^\/]*\.r2\.cloudflarestorage\.com/, '/*****.r2.cloudflarestorage.com') : 
        'Not set',
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'Not set',
      customDomain: process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN || 'Not set'
    }

    // 测试S3客户端初始化
    let clientStatus = 'OK'
    try {
      const { S3Client } = await import('@aws-sdk/client-s3')
      new S3Client({
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
        },
      })
    } catch (error) {
      clientStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      success: true,
      config,
      clientStatus,
      message: 'R2 configuration check completed',
      recommendations: {
        missingVars: Object.entries(config)
          .filter(([key, value]) => key.startsWith('has') && !value)
          .map(([key]) => key.replace('has', '').toUpperCase()),
        ready: Object.entries(config)
          .filter(([key, value]) => key.startsWith('has'))
          .every(([, value]) => value)
      }
    })

  } catch (error) {
    console.error('❌ R2 test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 