import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { toggleImagePublic } from "@/lib/database/images"
import { isAdmin } from "@/lib/database/admin"

export async function POST(request: NextRequest) {
  try {
    // 验证管理员登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 验证管理员权限
    const isAdminUser = await isAdmin(session.user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { imageId, userId } = body

    if (!imageId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: imageId, userId' 
      }, { status: 400 })
    }

    console.log(`🔄 Admin toggling public status for image ${imageId} (user: ${userId})`)

    // 切换公开状态
    const success = await toggleImagePublic(imageId, userId)

    if (!success) {
      throw new Error('Failed to toggle image public status')
    }

    console.log(`✅ Image ${imageId} public status toggled successfully`)

    return NextResponse.json({ 
      success: true,
      message: 'Image public status updated successfully'
    })

  } catch (error) {
    console.error('❌ Error toggling image public status:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 