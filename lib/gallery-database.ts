/**
 * Gallery数据库操作 - 全新实现
 * 专门处理点赞和评论功能的数据库连接
 */

// API基础配置
const API_BASE_URL = 'https://aimagica-api.403153162.workers.dev'
const REQUEST_TIMEOUT = 15000 // 15秒超时，给评论更多时间

// 数据类型定义
export interface GalleryImageStats {
  id: string
  likes: number
  comments: number
  views: number
  isLiked: boolean
}

export interface Comment {
  id: string
  imageId: string
  content: string
  author: string
  authorAvatar: string
  createdAt: string
  likes: number
  isLiked: boolean
}

export interface LikeResponse {
  success: boolean
  liked: boolean
  newCount: number
}

export interface CommentsResponse {
  success: boolean
  comments: Comment[]
}

// 通用的fetch包装器，带超时和错误处理
async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // 增加重试机制
  const maxRetries = 2
  let lastError: any = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API请求 (尝试 ${attempt + 1}/${maxRetries + 1}): ${url}`)
      
      // 使用更兼容的超时方式
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      })
      
      const fetchPromise = fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      const response = await Promise.race([fetchPromise, timeoutPromise])
      console.log(`✅ API请求成功: ${url} (状态: ${response.status})`)
      return response
    } catch (error: any) {
      lastError = error
      console.warn(`⚠️ API请求失败 (尝试 ${attempt + 1}): ${url}`, error.message)
      
      // 如果不是最后一次尝试，等待一下再重试
      if (attempt < maxRetries) {
        const waitTime = (attempt + 1) * 1000 // 1秒、2秒递增
        console.log(`⏳ ${waitTime}ms后重试...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  console.error(`❌ API请求最终失败: ${url}`, lastError)
  throw lastError
}

/**
 * 获取图片的点赞和评论统计
 */
export async function getImageStats(imageId: string): Promise<GalleryImageStats | null> {
  try {
    console.log(`📊 获取图片统计: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/stats/${imageId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 图片统计获取成功:`, data)
    
    return {
      id: imageId,
      likes: data.likes || 0,
      comments: data.comments || 0,
      views: data.views || 0,
      isLiked: data.isLiked || false,
    }
  } catch (error) {
    console.warn(`⚠️ 获取图片统计失败: ${imageId}`, error)
    return null
  }
}

/**
 * 切换图片点赞状态
 */
export async function toggleImageLike(imageId: string): Promise<LikeResponse> {
  try {
    console.log(`❤️ 切换点赞状态: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/like/${imageId}`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 点赞操作成功:`, data)
    
    return {
      success: true,
      liked: data.liked,
      newCount: data.count || 0,
    }
  } catch (error) {
    console.warn(`⚠️ 点赞操作失败: ${imageId}`, error)
    return {
      success: false,
      liked: false,
      newCount: 0,
    }
  }
}

/**
 * 增加图片浏览量
 */
export async function incrementImageView(imageId: string): Promise<boolean> {
  try {
    console.log(`👁️ 增加浏览量: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/view/${imageId}`, {
      method: 'POST',
    })
    
    const success = response.ok
    console.log(`${success ? '✅' : '⚠️'} 浏览量${success ? '增加成功' : '增加失败'}: ${imageId}`)
    
    return success
  } catch (error) {
    console.warn(`⚠️ 浏览量增加失败: ${imageId}`, error)
    return false
  }
}

/**
 * 获取图片评论列表
 */
export async function getImageComments(imageId: string): Promise<Comment[]> {
  try {
    console.log(`💬 获取图片评论: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comments/${imageId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 评论获取成功:`, data)
    
    if (data.success && Array.isArray(data.comments)) {
      return data.comments.map((comment: any) => ({
        id: comment.id,
        imageId: comment.imageId || imageId,
        content: comment.content,
        author: comment.author || 'Anonymous',
        authorAvatar: comment.authorAvatar || '/images/aimagica-logo.png',
        createdAt: comment.createdAt || new Date().toISOString(),
        likes: comment.likes || 0,
        isLiked: comment.isLiked || false,
      }))
    }
    
    return []
  } catch (error) {
    console.warn(`⚠️ 获取评论失败: ${imageId}`, error)
    return []
  }
}

/**
 * 添加新评论
 */
export async function addImageComment(imageId: string, content: string): Promise<Comment | null> {
  try {
    console.log(`💬 开始添加评论: ${imageId}, 内容长度: ${content.length}`)
    
    // 验证输入
    if (!content || content.trim().length === 0) {
      console.warn('⚠️ 评论内容为空')
      return null
    }
    
    if (content.length > 500) {
      console.warn('⚠️ 评论内容过长')
      throw new Error('评论内容不能超过500字符')
    }
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comments/${imageId}`, {
      method: 'POST',
      body: JSON.stringify({
        content: content.trim(),
        author: 'AIMAGICA User', // 匿名用户名
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API响应错误: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`服务器错误: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 评论添加成功:`, data)
    
    if (data.success && data.comment) {
      return {
        id: data.comment.id,
        imageId: imageId,
        content: data.comment.content,
        author: data.comment.author || 'AIMAGICA User',
        authorAvatar: data.comment.authorAvatar || '/images/aimagica-logo.png',
        createdAt: data.comment.createdAt || new Date().toISOString(),
        likes: data.comment.likes || 0,
        isLiked: false,
      }
    }
    
    return null
  } catch (error) {
    console.warn(`⚠️ 添加评论失败: ${imageId}`, error)
    return null
  }
}

/**
 * 切换评论点赞状态
 */
export async function toggleCommentLike(commentId: string): Promise<boolean> {
  try {
    console.log(`👍 切换评论点赞: ${commentId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comment-like/${commentId}`, {
      method: 'POST',
    })
    
    const success = response.ok
    console.log(`${success ? '✅' : '⚠️'} 评论点赞${success ? '成功' : '失败'}: ${commentId}`)
    
    return success
  } catch (error) {
    console.warn(`⚠️ 评论点赞失败: ${commentId}`, error)
    return false
  }
}

/**
 * 批量获取多个图片的统计信息
 */
export async function getBatchImageStats(imageIds: string[]): Promise<Record<string, GalleryImageStats>> {
  try {
    console.log(`📊 批量获取图片统计: ${imageIds.length}张图片`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/batch-stats`, {
      method: 'POST',
      body: JSON.stringify({ imageIds }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 批量统计获取成功:`, Object.keys(data.stats || {}).length)
    
    return data.stats || {}
  } catch (error) {
    console.warn(`⚠️ 批量获取统计失败:`, error)
    return {}
  }
}

// 导出默认的数据库操作对象
export const galleryDB = {
  getImageStats,
  toggleImageLike,
  incrementImageView,
  getImageComments,
  addImageComment,
  toggleCommentLike,
  getBatchImageStats,
}

export default galleryDB