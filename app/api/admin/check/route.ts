import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"

export async function GET(request: NextRequest) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isAdmin: false, 
        message: 'Not authenticated' 
      }, { status: 401 })
    }

    // 从数据库检查管理员权限
    const adminStatus = await isAdmin(session.user.email)
    
    return NextResponse.json({ 
      isAdmin: adminStatus,
      email: session.user.email,
      message: adminStatus ? 'Admin user' : 'Regular user'
    })
    
  } catch (error) {
    console.error("❌ API检查管理员权限失败:", error)
    return NextResponse.json({ 
      isAdmin: false, 
      message: 'Error checking admin status' 
    }, { status: 500 })
  }
} 