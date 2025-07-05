/**
 * Cloudflare Pages Function - 获取当前用户信息
 * 路径: /api/user
 */

export async function onRequest(context) {
  const { request, env } = context
  
  // 从Cookie获取JWT
  const cookies = request.headers.get('Cookie') || ''
  console.log('🍪 收到的Cookies:', cookies)
  
  const authToken = cookies.split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1]
  
  // URL解码Cookie值
  const decodedToken = authToken ? decodeURIComponent(authToken) : null
  
  console.log('🔑 提取的Token:', decodedToken ? '存在' : '不存在')
  
  if (!decodedToken) {
    return new Response(JSON.stringify({ 
      error: 'Not authenticated',
      debug: { cookies: cookies || 'No cookies found' }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  try {
    // UTF-8安全的base64解码
    function base64ToUtf8(str) {
      return decodeURIComponent(atob(str).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
    }
    
    // 验证JWT (简化版本)
    const [header, payload, signature] = decodedToken.split('.')
    const decodedPayload = JSON.parse(base64ToUtf8(payload))
    
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
    console.error('Token内容:', decodedToken)
    console.error('错误详情:', error.message)
    return new Response(JSON.stringify({ 
      error: 'Invalid token',
      debug: { 
        tokenLength: decodedToken?.length,
        tokenParts: decodedToken?.split('.').length,
        errorMessage: error.message
      }
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}