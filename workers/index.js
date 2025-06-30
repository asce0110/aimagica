// Aimagica Cloudflare Workers Main Entry Point
import { createHash } from 'node:crypto';

// 配置常量
const CONFIG = {
  STATIC_DOMAIN: 'https://aimagica.pages.dev', // Pages域名作为静态资源CDN
  API_VERSION: 'v1',
  CACHE_TTL: 3600, // 1小时缓存
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log(`[${new Date().toISOString()}] ${request.method} ${path}`);

    // CORS头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    try {
      // API路由处理
      if (path.startsWith('/api/')) {
        return await handleAPIRoute(request, env, corsHeaders);
      }

      // 健康检查
      if (path === '/health' || path === '/') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'aimagica-workers',
          version: CONFIG.API_VERSION,
          timestamp: new Date().toISOString(),
          uptime: Date.now(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 静态资源代理到Pages
      if (isStaticResource(path)) {
        return await proxyToPages(request, corsHeaders);
      }

      // 页面路由代理到Pages
      return await proxyToPages(request, corsHeaders);

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

// API路由处理函数
async function handleAPIRoute(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 基础API信息
  if (path === '/api' || path === '/api/') {
    return new Response(JSON.stringify({
      service: 'Aimagica API',
      version: CONFIG.API_VERSION,
      endpoints: {
        auth: '/api/auth/*',
        images: '/api/images/*',
        styles: '/api/styles',
        generate: '/api/generate/*',
        user: '/api/user/*',
        admin: '/api/admin/*',
      },
      docs: 'https://docs.aimagica.ai',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 健康检查API
  if (path === '/api/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      worker: 'aimagica-workers',
      api_version: CONFIG.API_VERSION,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 样式API
  if (path === '/api/styles' && method === 'GET') {
    return await handleStylesAPI(request, env, corsHeaders);
  }

  // 推荐API  
  if (path === '/api/recommendations' && method === 'GET') {
    return await handleRecommendationsAPI(request, env, corsHeaders);
  }

  // 图像生成API
  if (path.startsWith('/api/generate/')) {
    return await handleGenerateAPI(request, env, corsHeaders);
  }

  // 用户API
  if (path.startsWith('/api/user/')) {
    return await handleUserAPI(request, env, corsHeaders);
  }

  // 管理员API
  if (path.startsWith('/api/admin/')) {
    return await handleAdminAPI(request, env, corsHeaders);
  }

  // 认证API
  if (path.startsWith('/api/auth/')) {
    return await handleAuthAPI(request, env, corsHeaders);
  }

  // 默认API响应
  return new Response(JSON.stringify({
    error: 'API endpoint not found',
    path: path,
    method: method,
    available_endpoints: [
      '/api/health',
      '/api/styles',
      '/api/recommendations', 
      '/api/generate/*',
      '/api/auth/*',
      '/api/user/*',
      '/api/admin/*',
    ]
  }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 样式API处理
async function handleStylesAPI(request, env, corsHeaders) {
  // 模拟样式数据 - 实际环境中会连接Supabase
  const styles = [
    { 
      id: 1, 
      name: 'Anime', 
      category: 'art', 
      featured: true,
      description: 'Japanese anime style illustrations',
      thumbnail: 'https://images.aimagica.ai/styles/anime.jpg'
    },
    { 
      id: 2, 
      name: 'Realistic', 
      category: 'photo', 
      featured: true,
      description: 'Photorealistic images',
      thumbnail: 'https://images.aimagica.ai/styles/realistic.jpg'
    },
    { 
      id: 3, 
      name: 'Cartoon', 
      category: 'art', 
      featured: false,
      description: 'Cartoon style illustrations',
      thumbnail: 'https://images.aimagica.ai/styles/cartoon.jpg'
    }
  ];

  return new Response(JSON.stringify({
    data: styles,
    total: styles.length,
    timestamp: new Date().toISOString(),
  }), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CONFIG.CACHE_TTL}`
    }
  });
}

// 推荐API处理
async function handleRecommendationsAPI(request, env, corsHeaders) {
  const recommendations = [
    {
      id: 1,
      prompt: "A mystical forest with glowing mushrooms",
      style: "Fantasy",
      tags: ["nature", "magic", "forest"]
    },
    {
      id: 2,
      prompt: "Cyberpunk city at night with neon lights",
      style: "Cyberpunk", 
      tags: ["city", "neon", "futuristic"]
    },
    {
      id: 3,
      prompt: "Portrait of a wise wizard with a long beard",
      style: "Fantasy",
      tags: ["character", "wizard", "portrait"]
    }
  ];

  return new Response(JSON.stringify({
    data: recommendations,
    total: recommendations.length,
    timestamp: new Date().toISOString(),
  }), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CONFIG.CACHE_TTL}`
    }
  });
}

// 图像生成API处理
async function handleGenerateAPI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('/kie-flux')) {
    return await handleKieFluxGeneration(request, env, corsHeaders);
  }

  return new Response(JSON.stringify({
    error: 'Generation endpoint not implemented',
    message: 'This endpoint requires integration with image generation services',
    path: path,
  }), {
    status: 501,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 其他API处理函数的占位符
async function handleUserAPI(request, env, corsHeaders) {
  return new Response(JSON.stringify({
    message: 'User API endpoint',
    status: 'not_implemented',
  }), {
    status: 501,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAdminAPI(request, env, corsHeaders) {
  return new Response(JSON.stringify({
    message: 'Admin API endpoint',
    status: 'not_implemented',
  }), {
    status: 501,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAuthAPI(request, env, corsHeaders) {
  return new Response(JSON.stringify({
    message: 'Auth API endpoint',
    status: 'not_implemented',
  }), {
    status: 501,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleKieFluxGeneration(request, env, corsHeaders) {
  return new Response(JSON.stringify({
    message: 'KIE Flux generation endpoint',
    status: 'not_implemented',
  }), {
    status: 501,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 静态资源检查
function isStaticResource(path) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => path.toLowerCase().endsWith(ext)) || 
         path.startsWith('/_next/') || 
         path.startsWith('/images/') ||
         path.startsWith('/api/');
}

// 代理到Pages
async function proxyToPages(request, corsHeaders) {
  try {
    const url = new URL(request.url);
    const pagesUrl = new URL(url.pathname + url.search, CONFIG.STATIC_DOMAIN);
    
    const response = await fetch(pagesUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // 复制响应但添加CORS头
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders,
      },
    });

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(JSON.stringify({
      error: 'Proxy error',
      message: 'Failed to proxy request to Pages',
    }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
} 