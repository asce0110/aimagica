/**
 * Cloudflare Pages Function - 用户登出
 * 路径: /auth/logout
 */

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  
  console.log('👋 用户登出')
  
  // 清除Cookie并重定向
  const response = Response.redirect(`${url.origin}/`, 302)
  
  response.headers.set('Set-Cookie', [
    'auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
    'user-info=; Secure; SameSite=Lax; Max-Age=0; Path=/'
  ].join(', '))
  
  return response
}