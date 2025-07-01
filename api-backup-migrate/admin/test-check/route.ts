import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"

export async function GET(request: NextRequest) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Test Check - Session:', {
      hasSession: !!session,
      email: session?.user?.email,
      name: session?.user?.name
    })

    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null
      }, { status: 401 })
    }

    // 从数据库检查管理员权限
    console.log('🔍 Test Check - Checking admin status for:', session.user.email)
    const adminStatus = await isAdmin(session.user.email)
    console.log('🔍 Test Check - Admin status result:', adminStatus)
    
    return NextResponse.json({ 
      isAdmin: adminStatus,
      email: session.user.email,
      name: session.user.name,
      session: {
        user: session.user
      },
      message: adminStatus ? 'Admin user confirmed' : 'Regular user confirmed'
    })
    
  } catch (error) {
    console.error("❌ Test Check - Error:", error)
    return NextResponse.json({ 
      error: 'Error in test check',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 