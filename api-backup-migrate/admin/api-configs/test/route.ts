import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { ApiManager } from "@/lib/services/api-manager"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { configId, testPrompt } = body

    if (!configId) {
      return NextResponse.json({ 
        error: 'Missing required field: configId' 
      }, { status: 400 })
    }

    // 测试API配置
    const apiManager = ApiManager.getInstance()
    const result = await apiManager.testApiConfig(
      configId, 
      testPrompt || 'A simple test image of a cat'
    )

    return NextResponse.json({ 
      success: result.success,
      data: result.data,
      error: result.error,
      response_time_ms: result.response_time_ms,
      api_config_id: result.api_config_id,
      message: result.success 
        ? 'API configuration test successful' 
        : 'API configuration test failed'
    })

  } catch (error) {
    console.error('❌ API config test error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 