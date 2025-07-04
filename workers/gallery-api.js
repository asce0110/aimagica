/**
 * Gallery专用API - 全新实现
 * 处理点赞、评论、浏览量等功能
 */

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// 处理 OPTIONS 请求
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  })
}

// 创建成功响应
function createSuccessResponse(data) {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// 创建错误响应
function createErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({
    success: false,
    error: message
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// 获取Supabase配置
function getSupabaseConfig(env) {
  const supabaseUrl = env.SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co'
  const supabaseKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return { supabaseUrl, supabaseKey }
}

// 执行Supabase查询
async function supabaseQuery(url, options, config) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': `Bearer ${config.supabaseKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status}`)
  }
  
  return response.json()
}

// 获取图片统计信息
async function handleGetImageStats(imageId, env) {
  try {
    console.log(`📊 获取图片统计: ${imageId}`)
    
    const config = getSupabaseConfig(env)
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    // 获取图片基础信息
    const imageUrl = `${config.supabaseUrl}/rest/v1/generated_images?id=eq.${imageId}&select=*`
    const imageData = await supabaseQuery(imageUrl, {}, config)
    
    if (!imageData || imageData.length === 0) {
      return createErrorResponse('Image not found', 404)
    }
    
    const image = imageData[0]
    
    // 检查用户是否已点赞
    const likeUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&user_id=eq.${ANONYMOUS_USER_ID}`
    const likeData = await supabaseQuery(likeUrl, {}, config)
    const isLiked = likeData.length > 0
    
    // 获取总点赞数
    const likesCountUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&select=count`
    const likesCount = await supabaseQuery(likesCountUrl, {}, config)
    
    // 获取评论数
    const commentsCountUrl = `${config.supabaseUrl}/rest/v1/image_comments?image_id=eq.${imageId}&select=count`
    const commentsCount = await supabaseQuery(commentsCountUrl, {}, config)
    
    return createSuccessResponse({
      likes: likesCount.length || 0,
      comments: commentsCount.length || 0,
      views: image.view_count || 0,
      isLiked: isLiked
    })
    
  } catch (error) {
    console.error('❌ 获取图片统计失败:', error)
    return createErrorResponse('Failed to get image stats')
  }
}

// 切换图片点赞状态
async function handleToggleImageLike(imageId, env) {
  try {
    console.log(`❤️ 切换点赞状态: ${imageId}`)
    
    const config = getSupabaseConfig(env)
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    // 检查现有点赞状态
    const checkUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&user_id=eq.${ANONYMOUS_USER_ID}`
    const existingLikes = await supabaseQuery(checkUrl, {}, config)
    const hasLiked = existingLikes.length > 0
    
    if (hasLiked) {
      // 取消点赞
      const deleteUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&user_id=eq.${ANONYMOUS_USER_ID}`
      await supabaseQuery(deleteUrl, { method: 'DELETE' }, config)
      
      console.log(`✅ 取消点赞成功: ${imageId}`)
    } else {
      // 添加点赞
      const insertUrl = `${config.supabaseUrl}/rest/v1/image_likes`
      await supabaseQuery(insertUrl, {
        method: 'POST',
        body: JSON.stringify({
          image_id: imageId,
          user_id: ANONYMOUS_USER_ID,
          created_at: new Date().toISOString()
        })
      }, config)
      
      console.log(`✅ 添加点赞成功: ${imageId}`)
    }
    
    // 获取新的点赞数量
    const countUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=eq.${imageId}&select=count`
    const countData = await supabaseQuery(countUrl, {}, config)
    
    return createSuccessResponse({
      liked: !hasLiked,
      count: countData.length || 0
    })
    
  } catch (error) {
    console.error('❌ 点赞操作失败:', error)
    return createErrorResponse('Failed to toggle like')
  }
}

// 增加图片浏览量
async function handleIncrementImageView(imageId, env) {
  try {
    console.log(`👁️ 增加浏览量: ${imageId}`)
    
    const config = getSupabaseConfig(env)
    
    // 获取当前浏览量
    const getUrl = `${config.supabaseUrl}/rest/v1/generated_images?id=eq.${imageId}&select=view_count`
    const currentData = await supabaseQuery(getUrl, {}, config)
    
    if (!currentData || currentData.length === 0) {
      return createErrorResponse('Image not found', 404)
    }
    
    const currentViews = currentData[0].view_count || 0
    const newViews = currentViews + 1
    
    // 更新浏览量
    const updateUrl = `${config.supabaseUrl}/rest/v1/generated_images?id=eq.${imageId}`
    await supabaseQuery(updateUrl, {
      method: 'PATCH',
      body: JSON.stringify({ view_count: newViews })
    }, config)
    
    console.log(`✅ 浏览量更新成功: ${imageId} -> ${newViews}`)
    
    return createSuccessResponse({
      views: newViews
    })
    
  } catch (error) {
    console.error('❌ 浏览量更新失败:', error)
    return createErrorResponse('Failed to increment view')
  }
}

// 获取图片评论列表
async function handleGetImageComments(imageId, env) {
  try {
    console.log(`💬 获取图片评论: ${imageId}`)
    
    const config = getSupabaseConfig(env)
    
    // 获取评论列表
    const commentsUrl = `${config.supabaseUrl}/rest/v1/image_comments?image_id=eq.${imageId}&order=created_at.desc`
    const comments = await supabaseQuery(commentsUrl, {}, config)
    
    console.log(`✅ 评论获取成功: ${comments.length}条`)
    
    return createSuccessResponse({
      comments: comments.map(comment => ({
        id: comment.id,
        imageId: comment.image_id,
        content: comment.content,
        author: comment.author || 'AIMAGICA User',
        authorAvatar: comment.author_avatar || '/images/aimagica-logo.png',
        createdAt: comment.created_at,
        likes: comment.likes_count || 0,
        isLiked: false // TODO: 实现评论点赞状态检查
      }))
    })
    
  } catch (error) {
    console.error('❌ 获取评论失败:', error)
    return createErrorResponse('Failed to get comments')
  }
}

// 添加新评论
async function handleAddImageComment(imageId, request, env) {
  try {
    console.log(`💬 添加评论: ${imageId}`)
    
    const config = getSupabaseConfig(env)
    const body = await request.json()
    
    if (!body.content || body.content.trim().length === 0) {
      return createErrorResponse('Comment content is required', 400)
    }
    
    if (body.content.length > 500) {
      return createErrorResponse('Comment too long', 400)
    }
    
    // 插入新评论
    const insertUrl = `${config.supabaseUrl}/rest/v1/image_comments`
    const commentData = {
      image_id: imageId,
      content: body.content.trim(),
      author: body.author || 'AIMAGICA User',
      author_avatar: body.authorAvatar || '/images/aimagica-logo.png',
      created_at: new Date().toISOString(),
      likes_count: 0
    }
    
    const result = await supabaseQuery(insertUrl, {
      method: 'POST',
      body: JSON.stringify(commentData),
      headers: { 'Prefer': 'return=representation' }
    }, config)
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create comment')
    }
    
    const newComment = result[0]
    console.log(`✅ 评论添加成功:`, newComment.id)
    
    return createSuccessResponse({
      comment: {
        id: newComment.id,
        imageId: newComment.image_id,
        content: newComment.content,
        author: newComment.author,
        authorAvatar: newComment.author_avatar,
        createdAt: newComment.created_at,
        likes: newComment.likes_count || 0,
        isLiked: false
      }
    })
    
  } catch (error) {
    console.error('❌ 添加评论失败:', error)
    return createErrorResponse('Failed to add comment')
  }
}

// 批量获取图片统计
async function handleBatchImageStats(request, env) {
  try {
    console.log(`📊 批量获取图片统计`)
    
    const config = getSupabaseConfig(env)
    const body = await request.json()
    
    if (!Array.isArray(body.imageIds) || body.imageIds.length === 0) {
      return createErrorResponse('Invalid image IDs', 400)
    }
    
    const imageIds = body.imageIds.slice(0, 50) // 限制最多50个
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'
    
    // 获取基础图片信息
    const imagesUrl = `${config.supabaseUrl}/rest/v1/generated_images?id=in.(${imageIds.join(',')})&select=id,view_count`
    const images = await supabaseQuery(imagesUrl, {}, config)
    
    // 获取点赞信息
    const likesUrl = `${config.supabaseUrl}/rest/v1/image_likes?image_id=in.(${imageIds.join(',')})&select=image_id,user_id`
    const likes = await supabaseQuery(likesUrl, {}, config)
    
    // 获取评论数量
    const commentsUrl = `${config.supabaseUrl}/rest/v1/image_comments?image_id=in.(${imageIds.join(',')})&select=image_id`
    const comments = await supabaseQuery(commentsUrl, {}, config)
    
    // 汇总统计数据
    const stats = {}
    
    imageIds.forEach(imageId => {
      const image = images.find(img => img.id === imageId)
      const imageLikes = likes.filter(like => like.image_id === imageId)
      const imageComments = comments.filter(comment => comment.image_id === imageId)
      const isLiked = imageLikes.some(like => like.user_id === ANONYMOUS_USER_ID)
      
      stats[imageId] = {
        id: imageId,
        likes: imageLikes.length,
        comments: imageComments.length,
        views: image?.view_count || 0,
        isLiked: isLiked
      }
    })
    
    console.log(`✅ 批量统计获取成功: ${Object.keys(stats).length}张图片`)
    
    return createSuccessResponse({ stats })
    
  } catch (error) {
    console.error('❌ 批量获取统计失败:', error)
    return createErrorResponse('Failed to get batch stats')
  }
}

// 主路由处理器
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      const { pathname, searchParams } = url
      
      // 处理 OPTIONS 请求 (CORS)
      if (request.method === 'OPTIONS') {
        return handleCORS()
      }
      
      // 提取路径
      const pathParts = pathname.split('/').filter(part => part.length > 0)
      
      // 路由匹配
      if (pathParts[0] === 'api' && pathParts[1] === 'gallery') {
        if (pathParts[2] === 'stats' && pathParts[3] && request.method === 'GET') {
          // GET /api/gallery/stats/:imageId
          return handleGetImageStats(pathParts[3], env)
        }
        
        if (pathParts[2] === 'like' && pathParts[3] && request.method === 'POST') {
          // POST /api/gallery/like/:imageId
          return handleToggleImageLike(pathParts[3], env)
        }
        
        if (pathParts[2] === 'view' && pathParts[3] && request.method === 'POST') {
          // POST /api/gallery/view/:imageId
          return handleIncrementImageView(pathParts[3], env)
        }
        
        if (pathParts[2] === 'comments' && pathParts[3]) {
          if (request.method === 'GET') {
            // GET /api/gallery/comments/:imageId
            return handleGetImageComments(pathParts[3], env)
          } else if (request.method === 'POST') {
            // POST /api/gallery/comments/:imageId
            return handleAddImageComment(pathParts[3], request, env)
          }
        }
        
        if (pathParts[2] === 'batch-stats' && request.method === 'POST') {
          // POST /api/gallery/batch-stats
          return handleBatchImageStats(request, env)
        }
      }
      
      // 404 - 路由未找到
      return createErrorResponse('API route not found', 404)
      
    } catch (error) {
      console.error('Gallery API Error:', error)
      return createErrorResponse('Internal Server Error', 500)
    }
  }
}