/**
 * Cloudflare Pages Function - Google OAuth 回调处理
 * 路径: /auth/callback
 */

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  
  // 获取环境变量
  const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
  const JWT_SECRET = env.JWT_SECRET || 'default-secret-change-in-production'
  
  console.log('🔧 环境变量状态:', {
    hasClientId: !!GOOGLE_CLIENT_ID,
    hasClientSecret: !!GOOGLE_CLIENT_SECRET,
    hasJwtSecret: !!JWT_SECRET
  })
  
  // 获取授权码
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  
  if (error) {
    console.error('❌ OAuth错误:', error)
    return Response.redirect(`${url.origin}/?error=oauth_error`, 302)
  }
  
  if (!code) {
    console.error('❌ 缺少授权码')
    return Response.redirect(`${url.origin}/?error=missing_code`, 302)
  }
  
  try {
    // 1. 用授权码换取访问令牌
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${url.origin}/auth/callback`,
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }
    
    const tokens = await tokenResponse.json()
    console.log('✅ 获取访问令牌成功')
    
    // 2. 用访问令牌获取用户信息
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.status}`)
    }
    
    const user = await userResponse.json()
    console.log('✅ 获取用户信息成功:', user.email)
    
    // 3. 生成JWT Token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30天
    }
    
    // 简单的JWT实现（生产环境建议用库）
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/[+/=]/g, m => ({'+':'-','/':'_','=':''}[m]))
    const payloadStr = btoa(JSON.stringify(payload)).replace(/[+/=]/g, m => ({'+':'-','/':'_','=':''}[m]))
    
    // 使用Web Crypto API生成签名
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`${header}.${payloadStr}`)
    )
    
    // 转换签名为base64url
    const signatureArray = new Uint8Array(signature)
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray)).replace(/[+/=]/g, m => ({'+':'-','/':'_','=':''}[m]))
    
    const jwt = `${header}.${payloadStr}.${signatureBase64}`
    
    console.log('✅ JWT生成成功')
    
    // 4. 重定向回前端并设置Token
    const response = Response.redirect(`${url.origin}/?login=success`, 302)
    
    // 设置HttpOnly Cookie (更安全)
    response.headers.append('Set-Cookie', `auth-token=${jwt}; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/`)
    response.headers.append('Set-Cookie', `user-info=${btoa(JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture
    }))}; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/`)
    
    console.log('🍪 设置Cookie成功')
    
    return response
    
  } catch (error) {
    console.error('❌ OAuth处理失败:', error)
    return Response.redirect(`${url.origin}/?error=oauth_failed`, 302)
  }
}