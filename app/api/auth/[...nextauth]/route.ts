import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { createClient } from '@supabase/supabase-js'

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
        
        // 设置默认值
        session.user.subscriptionTier = 'free'
        session.user.subscriptionStatus = 'active'
        session.user.dailyRenderCount = 0
        session.user.dailyRerenderCount = 0
        session.user.isAdmin = false
        
        // 检查是否为管理员
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          
          const { data: adminConfig } = await supabase
            .from('admin_config')
            .select('email')
            .eq('email', session.user.email)
            .single()
          
          if (adminConfig) {
            session.user.isAdmin = true
            console.log('🔑 Admin user detected:', session.user.email)
          }
        } catch (error) {
          console.log('📝 Admin check error (non-critical):', error)
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
      // 基本验证 - 必须有邮箱
      if (!user.email) {
        console.error("❌ 登录失败：用户邮箱为空")
        return false
      }

      console.log("🔐 用户登录:", user.email)

      // 暂时不进行数据库操作
      
      console.log("🎉 登录成功！")
      return true
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