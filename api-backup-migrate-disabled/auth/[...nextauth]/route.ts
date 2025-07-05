import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { upsertUser, getUserByEmail } from "@/lib/database/users"
import { createLoginLog, updateLogoutTime } from "@/lib/database/auth-logs"
import { isAdmin } from "@/lib/database/admin"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // 将用户ID添加到会话中
      if (session.user && token.sub) {
        session.user.id = token.sub
        
        // 从数据库获取最新的用户信息（如果Supabase可用的话）
        if (session.user.email) {
          try {
            const dbUser = await getUserByEmail(session.user.email)
            if (dbUser) {
              // 将数据库用户信息添加到会话中
              session.user.dbId = dbUser.id
              session.user.subscriptionTier = dbUser.subscription_tier
              session.user.subscriptionStatus = dbUser.subscription_status
              session.user.dailyRenderCount = dbUser.daily_render_count
              session.user.dailyRerenderCount = dbUser.daily_rerender_count
            }
          } catch (error) {
            console.error("获取用户数据库信息失败:", error)
          }
          
          // 从数据库检查是否为管理员
          try {
            session.user.isAdmin = await isAdmin(session.user.email)
          } catch (error) {
            console.error("❌ 检查管理员权限失败:", error)
            session.user.isAdmin = false
          }
          
          // 如果数据库不可用，设置默认值
          if (!session.user.subscriptionTier) {
            session.user.subscriptionTier = 'free'
            session.user.subscriptionStatus = 'active'
            session.user.dailyRenderCount = 0
            session.user.dailyRerenderCount = 0
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // 首次登录时保存用户信息
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 用户登录:", user.email)
        console.log("👤 NextAuth User对象:", JSON.stringify(user, null, 2))
        console.log("🔑 NextAuth Account对象:", JSON.stringify(account, null, 2))
        console.log("📋 NextAuth Profile对象:", JSON.stringify(profile, null, 2))
        
        if (!user.email) {
          console.error("❌ 用户邮箱为空")
          return false
        }

        // 从数据库检查是否为管理员
        let isAdminLogin = false
        try {
          isAdminLogin = await isAdmin(user.email)
        } catch (error) {
          console.error("❌ 检查管理员权限失败:", error)
          isAdminLogin = false
        }
        
        if (isAdminLogin) {
          console.log("👨‍💼 管理员登录")
        }

        // 尝试同步用户数据到Supabase（如果失败也允许登录）
        try {
          console.log("📊 开始同步用户数据到数据库...")
          console.log("📊 NextAuth传入的用户信息:", {
            email: user.email,
            name: user.name,
            image: user.image
          })
          
          const syncedUser = await upsertUser({
            email: user.email,
            full_name: user.name || undefined,
            avatar_url: user.image || undefined,
            google_id: account?.providerAccountId || undefined
          })

          console.log("🔍 用户同步结果:", syncedUser ? "成功" : "失败")
          
          if (syncedUser) {
            console.log("✅ 用户数据同步成功!")
            console.log("📋 同步的用户信息:", {
              id: syncedUser.id,
              email: syncedUser.email,
              name: syncedUser.full_name
            })
            
            // 记录登录日志 - 使用同步成功的用户信息
            try {
              console.log("📝 准备记录登录日志...")
              
              const loginLogData = {
                user_id: syncedUser.id,
                email: syncedUser.email,  // 确保使用syncedUser的邮箱
                login_method: 'google',
                success: true,
                is_admin_login: isAdminLogin
              }
              
              console.log("📝 即将记录的登录日志数据:", loginLogData)
              
              const loginLogResult = await createLoginLog(loginLogData)
              
              if (loginLogResult) {
                console.log("✅ 登录日志记录成功! 日志ID:", loginLogResult.id)
                console.log("✅ 记录的用户邮箱:", loginLogResult.email)
              } else {
                console.error("❌ 登录日志记录失败：createLoginLog返回null")
              }
            } catch (logError) {
              console.error("❌ 登录日志记录异常:", logError)
            }
          } else {
            console.error("❌ 用户数据同步失败：upsertUser返回null")
            console.error("❌ 无法记录登录日志，因为没有有效的用户数据")
          }
        } catch (dbError) {
          console.error("❌ 数据库操作整体失败:", dbError)
        }
        
        console.log("🎉 登录成功！")
        return true
        
      } catch (error) {
        console.error("❌ 登录过程中发生错误:", error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // 登录成功后的重定向逻辑
      console.log("🔄 重定向:", url, "baseUrl:", baseUrl)
      
      // 如果URL是相对路径，使用baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 如果URL是同域的，允许重定向
      else if (new URL(url).origin === baseUrl) return url
      // 否则重定向到管理后台或首页
      return `${baseUrl}/admin/dashboard`
    }
  },
  pages: {
    signIn: '/admin/login', // 自定义登录页面
    error: '/admin/login', // 错误页面
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 