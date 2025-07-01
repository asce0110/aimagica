// Aimagica Cloudflare Workers Main Entry Point
import { createHash } from 'node:crypto';

// 配置常量
const CONFIG = {
  API_VERSION: 'v1',
  CACHE_TTL: 3600, // 1小时缓存
};

// 应用首页HTML
const APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIMAGICA - AI Image Generation Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover:hover { transform: translateY(-2px); transition: all 0.3s ease; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <nav class="gradient-bg shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-white">🎨 AIMAGICA</h1>
                    <span class="ml-2 text-blue-100 text-sm">AI Image Generation Platform</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-blue-100">Powered by Cloudflare Workers</span>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="gradient-bg py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-4xl md:text-6xl font-bold text-white mb-6">
                Create Amazing AI Images
            </h2>
            <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Transform your ideas into stunning visual content using our advanced AI image generation platform
            </p>
            <div class="space-x-4">
                <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Start Creating
                </button>
                <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition">
                    View Gallery
                </button>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 class="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h3>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="card-hover bg-gray-50 p-6 rounded-lg">
                    <div class="text-purple-600 text-3xl mb-4">🎯</div>
                    <h4 class="text-xl font-semibold mb-2">Text to Image</h4>
                    <p class="text-gray-600">Create stunning images from text descriptions using advanced AI models</p>
                </div>
                <div class="card-hover bg-gray-50 p-6 rounded-lg">
                    <div class="text-purple-600 text-3xl mb-4">🎨</div>
                    <h4 class="text-xl font-semibold mb-2">Style Transfer</h4>
                    <p class="text-gray-600">Apply artistic styles to transform your images with various filters</p>
                </div>
                <div class="card-hover bg-gray-50 p-6 rounded-lg">
                    <div class="text-purple-600 text-3xl mb-4">⚡</div>
                    <h4 class="text-xl font-semibold mb-2">Fast Generation</h4>
                    <p class="text-gray-600">Lightning-fast image generation powered by edge computing</p>
                </div>
            </div>
        </div>
    </div>

    <!-- API Section -->
    <div class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 class="text-3xl font-bold text-center text-gray-900 mb-12">API Endpoints</h3>
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="space-y-4">
                    <div class="flex justify-between items-center border-b pb-2">
                        <span class="font-mono text-sm">GET /api/health</span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2">
                        <span class="font-mono text-sm">GET /api/styles</span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div class="flex justify-between items-center border-b pb-2">
                        <span class="font-mono text-sm">GET /api/recommendations</span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-mono text-sm">POST /api/generate/*</span>
                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Coming Soon</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 AIMAGICA. Powered by Cloudflare Workers.</p>
            <p class="text-gray-400 mt-2">Worker URL: <span class="font-mono">aimagica-workers.403153162.workers.dev</span></p>
        </div>
    </footer>

    <script>
        // 简单的交互效果
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 AIMAGICA Workers loaded successfully!');
            
            // API测试功能
            window.testAPI = async function() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    console.log('API Health Check:', data);
                    alert('API is working! Check console for details.');
                } catch (error) {
                    console.error('API Error:', error);
                    alert('API test failed. Check console for details.');
                }
            };
        });
    </script>
</body>
</html>`;

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
      if (path === '/health') {
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

      // 根路径和所有其他路径返回应用首页
      return new Response(APP_HTML, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });

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