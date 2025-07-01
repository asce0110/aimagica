import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import { updateLogoutTime } from "@/lib/database/auth-logs"
import { getUserByEmail } from "@/lib/database/users"

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 用户登出API被调用")
    
    // 获取当前会话
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      console.log("⚠️  没有有效会话，无法记录登出")
      return NextResponse.json({
        success: true,
        message: "No active session to logout"
      })
    }

    console.log("👤 登出用户:", session.user.email)

    // 获取用户数据库ID
    const dbUser = await getUserByEmail(session.user.email)
    
    if (!dbUser) {
      console.error("❌ 未找到数据库用户记录:", session.user.email)
      return NextResponse.json({
        success: false,
        error: "User not found in database"
      }, { status: 404 })
    }

    console.log("📝 开始更新登出时间...")
    
    // 更新最近的登录记录的登出时间
    const updateSuccess = await updateLogoutTime(dbUser.id)
    
    if (updateSuccess) {
      console.log("✅ 登出时间记录成功:", session.user.email)
      return NextResponse.json({
        success: true,
        message: "Logout time recorded successfully",
        user_email: session.user.email
      })
    } else {
      console.error("❌ 登出时间记录失败:", session.user.email)
      return NextResponse.json({
        success: false,
        error: "Failed to record logout time"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ 登出API错误:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 