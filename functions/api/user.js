/**
 * Cloudflare Pages Function - 获取当前用户信息
 * 路径: /api/user
 */

export async function onRequest(context) {
  const { request, env } = context
  
  // 从Cookie获取JWT
  const cookies = request.headers.get('Cookie') || ''
  const authToken = cookies.split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1]
  
  if (!authToken) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  try {
    // 验证JWT (简化版本)
    const [header, payload, signature] = authToken.split('.')
    const decodedPayload = JSON.parse(atob(payload))
    
    // 检查过期时间
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(JSON.stringify({ error: 'Token expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({
      user: {
        id: decodedPayload.id,
        email: decodedPayload.email,
        name: decodedPayload.name,
        picture: decodedPayload.picture,
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ JWT验证失败:', error)
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}