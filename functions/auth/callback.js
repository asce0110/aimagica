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
  
  if (!GOOGLE_CLIENT_SECRET) {
    console.error('❌ 缺少GOOGLE_CLIENT_SECRET')
    return Response.redirect(`${url.origin}/?error=missing_secret`, 302)
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
    
    // UTF-8安全的base64编码
    function utf8ToBase64(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1)
      }))
    }
    
    // 简化的JWT实现（仅用于测试）
    const header = utf8ToBase64(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payloadStr = utf8ToBase64(JSON.stringify(payload))
    const jwt = `${header}.${payloadStr}.unsigned`
    
    console.log('✅ JWT生成成功')
    
    // 4. 重定向回前端并设置Token
    const headers = new Headers()
    headers.set('Location', `${url.origin}/?login=success`)
    
    // URL编码Cookie值防止特殊字符问题
    const encodedJwt = encodeURIComponent(jwt)
    // 只使用UTF-8安全编码，不再双重编码
    const userInfoBase64 = utf8ToBase64(JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture
    }))
    const encodedUserInfo = userInfoBase64
    
    headers.append('Set-Cookie', `auth-token=${encodedJwt}; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/`)
    headers.append('Set-Cookie', `user-info=${encodedUserInfo}; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/`)
    
    console.log('🍪 设置Cookie成功')
    console.log('JWT长度:', jwt.length)
    console.log('JWT部分:', jwt.split('.').length)
    
    return new Response(null, {
      status: 302,
      headers: headers
    })
    
  } catch (error) {
    console.error('❌ OAuth处理失败:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
    
    // 返回更详细的错误信息
    return Response.redirect(`${url.origin}/?error=oauth_failed&detail=${encodeURIComponent(error.message)}`, 302)
  }
}