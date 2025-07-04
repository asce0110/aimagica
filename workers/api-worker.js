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
  'images/proxy/:url': handleImageProxy,
  
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
  try {
    console.log('🎨 Fetching real gallery images from Supabase...')
    
    // 解析查询参数
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const styleFilter = url.searchParams.get('style')
    
    // 构建Supabase查询
    const supabaseUrl = env.SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co'
    const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseKey) {
      console.error('❌ Missing Supabase service key in environment')
      throw new Error('Missing Supabase configuration')
    }
    
    // 构建查询URL
    let queryUrl = `${supabaseUrl}/rest/v1/generated_images?select=*&is_public=eq.true&status=eq.completed&order=created_at.desc&limit=${limit}&offset=${offset}`
    
    // 如果有样式过滤
    if (styleFilter) {
      queryUrl += `&style=ilike.%25${encodeURIComponent(styleFilter)}%25`
    }
    
    console.log('🔍 Querying:', queryUrl)
    
    // 查询Supabase
    const response = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('❌ Supabase query failed:', response.status, response.statusText)
      throw new Error(`Supabase query failed: ${response.status}`)
    }
    
    const images = await response.json()
    console.log(`✅ Found ${images.length} real images from database`)
    
    // 获取当前请求的域名来生成代理URL
    const requestUrl = new URL(request.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    
    // 转换为Gallery格式，提供多层备用方案
    const galleryImages = images.map((image, index) => {
      let imageUrl = '/images/placeholder.svg' // 默认备用
      
      if (image.generated_image_url) {
        // 方案1: 尝试使用代理URL（如果Workers域名可访问）
        const proxyUrl = `${baseUrl}/api/images/proxy/${encodeURIComponent(image.generated_image_url)}`
        
        // 方案2: 如果是本地开发或者特殊情况，提供原始URL作为备用
        const originalUrl = image.generated_image_url
        
        // 方案3: 使用本地示例图片作为最终备用
        const localExamples = [
          '/images/examples/magic-forest.svg',
          '/images/examples/cyber-city.svg', 
          '/images/examples/space-art.svg',
          '/images/examples/cat-wizard.svg'
        ]
        const fallbackExample = localExamples[index % localExamples.length]
        
        // 记录所有可用的URL选项
        console.log(`🖼️ Image ${image.id} URL options:`, {
          proxy: proxyUrl,
          original: originalUrl,
          fallback: fallbackExample
        })
        
        // 优先使用代理URL，但在前端会有更多备用逻辑
        imageUrl = proxyUrl
      }
      
      return {
        id: image.id,
        url: imageUrl,
        originalUrl: image.generated_image_url, // 保留原始URL供前端备用
        title: (image.prompt?.substring(0, 50) + '...' || 'Untitled'),
        author: 'AIMAGICA User',
        authorAvatar: "/images/aimagica-logo.png",
        likes: image.likes_count || 0,
        comments: 0, // 暂时设为0，避免额外查询
        views: image.view_count || 0,
        downloads: 0,
        isPremium: false,
        isFeatured: (image.likes_count || 0) > 10,
        isLiked: false,
        createdAt: new Date(image.created_at).toLocaleDateString(),
        prompt: image.prompt || '',
        style: image.style,
        tags: extractTagsFromPrompt(image.prompt || ''),
        size: getRandomSize(),
        rotation: getRandomRotation()
      }
    })
    
    console.log(`🎯 Returning ${galleryImages.length} processed gallery images`)
    
    return new Response(JSON.stringify({ 
      success: true,
      data: galleryImages,
      total: galleryImages.length
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
    
  } catch (error) {
    console.error('❌ Error in handleGalleryPublic:', error)
    
    // Fallback: 如果数据库查询失败，返回示例数据
    const fallbackData = [
      {
        id: 'fallback-1',
        url: "https://aimagica.pages.dev/images/examples/magic-forest.svg",
        title: "魔法森林",
        author: "AIMAGICA",
        authorAvatar: "https://aimagica.pages.dev/images/aimagica-logo.png",
        likes: 1243,
        comments: 89,
        views: 5678,
        downloads: 432,
        isPremium: false,
        isFeatured: true,
        isLiked: false,
        createdAt: "2 days ago",
        prompt: "A magical forest with glowing mushrooms, fairy lights, and mystical creatures hiding among ancient trees",
        style: "Fantasy",
        tags: ["forest", "magic", "fantasy", "glow", "mystical"],
        size: "vertical",
        rotation: 2,
      },
      {
        id: 'fallback-2',
        url: "https://aimagica.pages.dev/images/examples/cyber-city.svg",
        title: "赛博东京2099",
        author: "CyberArtist",
        authorAvatar: "https://aimagica.pages.dev/images/aimagica-logo.png",
        likes: 982,
        comments: 56,
        views: 4321,
        downloads: 321,
        isPremium: true,
        isFeatured: false,
        isLiked: true,
        createdAt: "1 week ago",
        prompt: "Futuristic cyberpunk cityscape with neon lights, flying cars, and holographic advertisements",
        style: "Cyberpunk",
        tags: ["cyberpunk", "city", "future", "neon", "scifi"],
        size: "horizontal",
        rotation: -1,
      },
      {
        id: 'fallback-3',
        url: "https://aimagica.pages.dev/images/examples/space-art.svg",
        title: "太空探索者",
        author: "StarGazer",
        authorAvatar: "https://aimagica.pages.dev/images/aimagica-logo.png",
        likes: 756,
        comments: 42,
        views: 3210,
        downloads: 198,
        isPremium: false,
        isFeatured: false,
        isLiked: false,
        createdAt: "3 days ago",
        prompt: "Astronaut exploring an alien planet with strange flora and multiple moons in the sky",
        style: "Sci-Fi",
        tags: ["space", "astronaut", "alien", "planet", "exploration"],
        size: "small",
        rotation: 1.5,
      },
      {
        id: 'fallback-4',
        url: "https://aimagica.pages.dev/images/examples/cat-wizard.svg",
        title: "魔法师小猫",
        author: "OceanWhisperer",
        authorAvatar: "https://aimagica.pages.dev/images/aimagica-logo.png",
        likes: 1567,
        comments: 103,
        views: 6789,
        downloads: 543,
        isPremium: true,
        isFeatured: true,
        isLiked: false,
        createdAt: "5 days ago",
        prompt: "Cute cat wearing wizard hat and casting colorful magic spells with a wand",
        style: "Fantasy",
        tags: ["cat", "wizard", "cute", "magic", "spells"],
        size: "medium",
        rotation: -2,
      }
    ]
    
    return new Response(JSON.stringify({ 
      success: true,
      data: fallbackData,
      error: 'Database connection failed, showing fallback data',
      details: error.message
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// 辅助函数
function extractTagsFromPrompt(prompt) {
  const commonTags = ['art', 'fantasy', 'portrait', 'landscape', 'digital', 'anime', 'realistic', 'abstract']
  const promptLower = prompt.toLowerCase()
  return commonTags.filter(tag => promptLower.includes(tag)).slice(0, 5)
}

function getRandomSize() {
  const sizes = ["small", "medium", "large", "vertical", "horizontal"]
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function getRandomRotation() {
  return (Math.random() - 0.5) * 6 // -3 到 3 度的随机旋转
}

async function handleGalleryItem(request, env, context) {
  try {
    const { id } = context.params
    const method = request.method
    
    if (method === 'GET') {
      // 获取图片详情并增加浏览量
      return handleGetImageDetails(id, env)
    } else if (method === 'POST') {
      // 处理点赞等操作
      const body = await request.json()
      const { action } = body
      
      if (action === 'toggle_like') {
        return handleToggleLike(id, env)
      }
      
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('❌ Error in handleGalleryItem:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 处理点赞功能
async function handleToggleLike(imageId, env) {
  try {
    const supabaseUrl = env.SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co'
    const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    // 匿名用户ID
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = ANONYMOUS_USER_ID
    
    // 检查现有点赞
    const checkUrl = `${supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&user_id=eq.${userId}`
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const existingLikes = await checkResponse.json()
    const hasLiked = existingLikes.length > 0
    
    if (hasLiked) {
      // 取消点赞
      const deleteUrl = `${supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&user_id=eq.${userId}`
      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`✅ 取消点赞成功: ${imageId}`)
      return new Response(JSON.stringify({ liked: false }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      // 添加点赞
      const insertUrl = `${supabaseUrl}/rest/v1/image_likes`
      await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_id: imageId,
          user_id: userId
        })
      })
      
      console.log(`✅ 添加点赞成功: ${imageId}`)
      return new Response(JSON.stringify({ liked: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('❌ 点赞操作失败:', error)
    return new Response(JSON.stringify({ error: 'Failed to toggle like' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 获取图片详情
async function handleGetImageDetails(imageId, env) {
  try {
    const supabaseUrl = env.SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co'
    const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    // 获取图片基本信息
    const imageUrl = `${supabaseUrl}/rest/v1/generated_images?id=eq.${imageId}&is_public=eq.true&status=eq.completed`
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const images = await imageResponse.json()
    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const image = images[0]
    
    // 更新浏览量
    const newViewCount = (image.view_count || 0) + 1
    const updateUrl = `${supabaseUrl}/rest/v1/generated_images?id=eq.${imageId}`
    fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ view_count: newViewCount })
    }).catch(console.error) // 异步更新，不等待
    
    // 构建返回数据
    const imageDetails = {
      id: image.id,
      title: image.prompt?.substring(0, 50) + '...' || 'Untitled',
      url: image.generated_image_url,
      prompt: image.prompt || 'No prompt available',
      style: image.style,
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      likes: image.likes_count || 0,
      views: newViewCount,
      comments: 0, // 暂时为0
      createdAt: new Date(image.created_at).toLocaleDateString(),
      isLiked: false, // 需要登录状态才能判断
      tags: extractTagsFromPrompt(image.prompt || ''),
      commentsData: [] // 暂时为空数组
    }
    
    return new Response(JSON.stringify(imageDetails), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ 获取图片详情失败:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch image details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
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

// 图片代理处理函数 - 解决不翻墙无法访问R2直链的问题
async function handleImageProxy(request, env) {
  try {
    // 从URL路径中提取图片URL参数
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const imageUrlParam = pathParts[pathParts.length - 1]
    const imageUrl = decodeURIComponent(imageUrlParam)
    
    console.log('🖼️ Image proxy request:', {
      originalPath: url.pathname,
      extractedUrl: imageUrl,
      userAgent: request.headers.get('User-Agent'),
      referer: request.headers.get('Referer')
    })
    
    // 验证URL是否为有效的图片URL
    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('https'))) {
      console.error('❌ Invalid image URL:', imageUrl)
      return new Response('Invalid image URL', { status: 400 })
    }
    
    // 获取原始图片
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'AIMAGICA-Proxy/1.0',
        'Accept': 'image/*',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(30000) // 30秒超时
    })
    
    console.log('🖼️ Original image response:', {
      status: imageResponse.status,
      contentType: imageResponse.headers.get('content-type'),
      contentLength: imageResponse.headers.get('content-length')
    })
    
    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch image:', {
        url: imageUrl,
        status: imageResponse.status,
        statusText: imageResponse.statusText
      })
      return new Response('Image not found', { status: 404 })
    }
    
    // 获取内容类型
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    
    console.log('✅ Successfully proxied image:', imageUrl)
    
    // 返回代理的图片，添加适当的缓存头
    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存1年
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, User-Agent, Referer',
        'X-Proxied-From': imageUrl,
        'X-Proxy-Status': 'success'
      }
    })
    
  } catch (error) {
    console.error('❌ Image proxy error:', {
      error: error.message,
      stack: error.stack,
      url: request.url
    })
    
    // 返回备用图片或错误响应
    return new Response('Proxy error: ' + error.message, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Proxy-Status': 'error',
        'X-Error-Message': error.message
      }
    })
  }
} 