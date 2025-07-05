/**
 * Cloudflare Pages Function - 用户登出
 * 路径: /auth/logout
 */

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  
  console.log('👋 用户登出')
  
  try {
    // 创建响应头清除Cookie
    const headers = new Headers()
    headers.set('Location', `${url.origin}/?logout=success`)
    
    // 每个Cookie需要单独的Set-Cookie头
    headers.append('Set-Cookie', 'auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/')
    headers.append('Set-Cookie', 'user-info=; Secure; SameSite=Lax; Max-Age=0; Path=/')
    
    console.log('✅ 用户登出成功，Cookie已清除')
    
    return new Response(null, {
      status: 302,
      headers: headers
    })
    
  } catch (error) {
    console.error('❌ 登出处理失败:', error)
    
    return new Response(JSON.stringify({
      error: 'logout_failed',
      message: '登出失败，请重试'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}