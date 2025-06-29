// Cloudflare Workers - 身份验证和代理服务
// 处理轻量级 API，减少 Pages 负担

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 处理
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      // 路由分发
      switch (true) {
        case path.startsWith('/api/auth/token'):
          return handleTokenValidation(request, env);
        
        case path.startsWith('/api/proxy/avatar'):
          return handleAvatarProxy(request, env);
        
        case path.startsWith('/api/users/sync'):
          return handleUserSync(request, env);
          
        case path.startsWith('/api/health'):
          return handleHealthCheck(request, env);
          
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      });
    }
  },
};

// Token 验证 (轻量级，适合 Workers)
async function handleTokenValidation(request, env) {
  const { token } = await request.json();
  
  // 简单的JWT验证逻辑
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    return new Response(JSON.stringify({ 
      valid: true, 
      userId: payload.sub,
      exp: payload.exp 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Invalid token' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 头像代理 (适合边缘处理)
async function handleAvatarProxy(request, env) {
  const url = new URL(request.url);
  const avatarUrl = url.searchParams.get('url');
  
  if (!avatarUrl) {
    return new Response('Missing avatar URL', { status: 400 });
  }
  
  // 验证URL安全性
  if (!isValidAvatarUrl(avatarUrl)) {
    return new Response('Invalid avatar URL', { status: 400 });
  }
  
  try {
    // 获取头像并缓存
    const response = await fetch(avatarUrl, {
      headers: {
        'User-Agent': 'Aimagica-Bot/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch avatar');
    }
    
    // 返回带缓存的响应
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // 24小时缓存
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response('Failed to proxy avatar', { status: 500 });
  }
}

// 用户同步 (轻量级数据处理)
async function handleUserSync(request, env) {
  const { userId, userData } = await request.json();
  
  // 数据验证
  if (!userId || !userData) {
    return new Response('Missing required data', { status: 400 });
  }
  
  // 调用主数据库 API
  const syncResponse = await fetch(`${env.MAIN_API_BASE}/api/users/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.INTERNAL_API_KEY}`
    },
    body: JSON.stringify({ userId, userData })
  });
  
  return new Response(await syncResponse.text(), {
    status: syncResponse.status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 健康检查
async function handleHealthCheck(request, env) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    worker: 'auth-worker',
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// CORS 处理
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// JWT 验证函数
async function verifyJWT(token, secret) {
  // 简化的JWT验证实现
  const [header, payload, signature] = token.split('.');
  
  if (!header || !payload || !signature) {
    throw new Error('Invalid token format');
  }
  
  // 这里应该实现完整的JWT验证逻辑
  const decodedPayload = JSON.parse(atob(payload));
  
  // 检查过期时间
  if (decodedPayload.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  return decodedPayload;
}

// URL 安全验证
function isValidAvatarUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = [
      'github.com',
      'githubusercontent.com',
      'gravatar.com',
      'googleusercontent.com'
    ];
    
    return allowedDomains.some(domain => 
      parsedUrl.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
} 