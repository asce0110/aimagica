/**
 * Cloudflare Workers API Handler
 * 处理所有来自Next.js的API路由请求
 */

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

// 处理 OPTIONS 请求
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  })
}

// 环境变量验证
function validateEnvironment() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'NEXTAUTH_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_ENDPOINT',
    'R2_BUCKET_NAME'
  ]
  
  const missing = required.filter(key => !env[key])
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
  }
}

// API 路由处理映射
const routeHandlers = {
  // Admin routes
  'admin/check': handleAdminCheck,
  'admin/stats': handleAdminStats,
  'admin/users': handleAdminUsers,
  'admin/images': handleAdminImages,
  'admin/styles': handleAdminStyles,
  'admin/payment': handleAdminPayment,
  
  // Auth routes
  'auth/callback': handleAuthCallback,
  'auth/logout': handleAuthLogout,
  
  // Dashboard routes
  'dashboard/images': handleDashboardImages,
  'dashboard/stats': handleDashboardStats,
  'dashboard/users': handleDashboardUsers,
  
  // Gallery routes
  'gallery/public': handleGalleryPublic,
  'gallery/:id': handleGalleryItem,
  'gallery/:id/comments': handleGalleryComments,
  
  // Image generation routes
  'generate/image': handleGenerateImage,
  'generate/kie-flux': handleKieFlux,
  'generate/video': handleGenerateVideo,
  
  // Image management routes
  'images/generate': handleImagesGenerate,
  'images/save': handleImagesSave,
  'images/upload-base64': handleImagesUploadBase64,
  'images/upload-to-r2': handleImagesUploadToR2,
  
  // Magic coins routes
  'magic-coins/balance': handleMagicCoinsBalance,
  'magic-coins/packages': handleMagicCoinsPackages,
  'magic-coins/transactions': handleMagicCoinsTransactions,
  
  // Payment routes
  'payment/create-checkout': handlePaymentCheckout,
  'payment/paypal/verify': handlePaypalVerify,
  'payment/webhooks/paypal': handlePaypalWebhook,
  
  // Other routes
  'styles': handleStyles,
  'styles-public': handleStylesPublic,
  'featured-images': handleFeaturedImages,
  'recommendations': handleRecommendations,
  'user-prompts': handleUserPrompts,
  'test': handleTest,
}

// 主要请求处理函数
export default {
  async fetch(request, env, ctx) {
    try {
      // 设置全局环境变量
      globalThis.env = env
      
      // 验证环境变量
      validateEnvironment()
      
      const url = new URL(request.url)
      const { pathname, searchParams } = url
      
      // 处理 OPTIONS 请求 (CORS)
      if (request.method === 'OPTIONS') {
        return handleCORS()
      }
      
      // 提取 API 路由路径
      const apiPath = pathname.replace(/^\/api\//, '')
      
      // 添加日志
      console.log(`API Request: ${request.method} ${apiPath}`)
      
      // 查找路由处理器
      let handler = null
      let params = {}
      
      // 精确匹配
      if (routeHandlers[apiPath]) {
        handler = routeHandlers[apiPath]
      } else {
        // 模式匹配（如 gallery/:id）
        for (const [pattern, handlerFunc] of Object.entries(routeHandlers)) {
          const match = matchRoute(pattern, apiPath)
          if (match) {
            handler = handlerFunc
            params = match.params
            break
          }
        }
      }
      
      // 如果找不到处理器，返回404
      if (!handler) {
        return createErrorResponse(`API route not found: ${apiPath}`, 404)
      }
      
      // 执行处理器
      const response = await handler(request, env, { params, searchParams })
      
      // 添加 CORS 头部
      const newHeaders = new Headers(response.headers)
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value)
      })
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
      
    } catch (error) {
      console.error('Worker Error:', error)
      return createErrorResponse('Internal Server Error', 500)
    }
  }
}

// 路由匹配函数
function matchRoute(pattern, path) {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')
  
  if (patternParts.length !== pathParts.length) {
    return null
  }
  
  const params = {}
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]
    
    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1)
      params[paramName] = pathPart
    } else if (patternPart !== pathPart) {
      return null
    }
  }
  
  return { params }
}

// 错误响应创建函数
function createErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// API 处理器函数 - 这些函数需要根据你的实际API逻辑实现
async function handleAdminCheck(request, env) {
  return new Response(JSON.stringify({ status: 'ok', admin: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAdminStats(request, env) {
  // 实现管理员统计逻辑
  return new Response(JSON.stringify({ stats: {} }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAdminUsers(request, env) {
  // 实现用户管理逻辑
  return new Response(JSON.stringify({ users: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAdminImages(request, env) {
  // 实现图片管理逻辑
  return new Response(JSON.stringify({ images: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAdminStyles(request, env) {
  // 实现样式管理逻辑
  return new Response(JSON.stringify({ styles: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAdminPayment(request, env) {
  // 实现支付管理逻辑
  return new Response(JSON.stringify({ payments: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAuthCallback(request, env) {
  // 实现认证回调逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleAuthLogout(request, env) {
  // 实现登出逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleDashboardImages(request, env) {
  // 实现仪表板图片逻辑
  return new Response(JSON.stringify({ images: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleDashboardStats(request, env) {
  // 实现仪表板统计逻辑
  return new Response(JSON.stringify({ stats: {} }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleDashboardUsers(request, env) {
  // 实现仪表板用户逻辑
  return new Response(JSON.stringify({ users: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGalleryPublic(request, env) {
  // 实现公共画廊逻辑
  return new Response(JSON.stringify({ gallery: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGalleryItem(request, env, context) {
  // 实现画廊项目逻辑
  const { id } = context.params
  return new Response(JSON.stringify({ id, item: {} }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGalleryComments(request, env, context) {
  // 实现画廊评论逻辑
  const { id } = context.params
  return new Response(JSON.stringify({ id, comments: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGenerateImage(request, env) {
  // 实现图片生成逻辑
  return new Response(JSON.stringify({ message: 'Image generation API' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleKieFlux(request, env) {
  // 实现 KieFlux 生成逻辑
  return new Response(JSON.stringify({ message: 'KieFlux API' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleGenerateVideo(request, env) {
  // 实现视频生成逻辑
  return new Response(JSON.stringify({ message: 'Video generation API' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleImagesGenerate(request, env) {
  // 实现图片生成逻辑
  return new Response(JSON.stringify({ message: 'Images generate API' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleImagesSave(request, env) {
  // 实现图片保存逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleImagesUploadBase64(request, env) {
  // 实现Base64图片上传逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleImagesUploadToR2(request, env) {
  // 实现R2图片上传逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleMagicCoinsBalance(request, env) {
  // 实现魔法币余额逻辑
  return new Response(JSON.stringify({ balance: 0 }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleMagicCoinsPackages(request, env) {
  // 实现魔法币套餐逻辑
  return new Response(JSON.stringify({ packages: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleMagicCoinsTransactions(request, env) {
  // 实现魔法币交易逻辑
  return new Response(JSON.stringify({ transactions: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handlePaymentCheckout(request, env) {
  // 实现支付检出逻辑
  return new Response(JSON.stringify({ checkout_url: '' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handlePaypalVerify(request, env) {
  // 实现PayPal验证逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handlePaypalWebhook(request, env) {
  // 实现PayPal Webhook逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleStyles(request, env) {
  // 实现样式API逻辑
  return new Response(JSON.stringify({ styles: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleStylesPublic(request, env) {
  // 实现公共样式API逻辑
  return new Response(JSON.stringify({ styles: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleFeaturedImages(request, env) {
  // 实现精选图片逻辑
  return new Response(JSON.stringify({ images: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleRecommendations(request, env) {
  // 实现推荐逻辑
  return new Response(JSON.stringify({ recommendations: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleUserPrompts(request, env) {
  // 实现用户提示词逻辑
  return new Response(JSON.stringify({ prompts: [] }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleTest(request, env) {
  // 实现测试API逻辑
  return new Response(JSON.stringify({ 
    message: 'Workers API is working!',
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
} 