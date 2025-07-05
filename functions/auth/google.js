/**
 * Cloudflare Pages Function - Google OAuth 启动
 * 路径: /auth/google
 */

export async function onRequest(context) {
  const { request, env } = context
  
  // 获取环境变量
  const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
  const REDIRECT_URI = `${new URL(request.url).origin}/auth/callback`
  
  if (!GOOGLE_CLIENT_ID) {
    return new Response('Google OAuth not configured', { status: 500 })
  }
  
  // 生成state参数防止CSRF攻击
  const state = crypto.randomUUID()
  
  // 构建Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  
  console.log('🚀 启动Google OAuth:', {
    clientId: GOOGLE_CLIENT_ID.substring(0, 20) + '...',
    redirectUri: REDIRECT_URI,
    state: state
  })
  
  // 重定向到Google OAuth
  return Response.redirect(authUrl.toString(), 302)
}