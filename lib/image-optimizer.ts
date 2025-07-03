/**
 * 图片优化工具 - 为R2图片添加压缩和尺寸优化
 */

interface ImageOptimizeOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
}

/**
 * 优化R2存储桶图片URL，添加压缩参数
 */
export function optimizeImageUrl(originalUrl: string, options: ImageOptimizeOptions = {}): string {
  if (!originalUrl) return originalUrl
  
  // 检查是否是R2存储桶URL
  const isR2Url = originalUrl.includes('images.aimagica.ai') || originalUrl.includes('tempfile.aiquickdraw.com')
  
  if (!isR2Url) {
    return originalUrl
  }
  
  const {
    width = 800,
    quality = 80,
    format = 'webp'
  } = options
  
  try {
    const url = new URL(originalUrl)
    
    // 如果是Cloudflare Images，添加变换参数
    if (url.hostname.includes('aimagica.ai')) {
      // Cloudflare Images变换格式: /cdn-cgi/image/width=800,quality=80,format=webp/原URL
      return `https://images.aimagica.ai/cdn-cgi/image/width=${width},quality=${quality},format=${format}${url.pathname}`
    }
    
    // 对于其他URL，尝试添加查询参数
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', quality.toString())
    if (format !== 'auto') {
      url.searchParams.set('f', format)
    }
    
    return url.toString()
  } catch (error) {
    console.warn('图片URL优化失败，使用原始URL:', error)
    return originalUrl
  }
}

/**
 * 根据屏幕尺寸获取合适的图片尺寸
 */
export function getOptimalImageSize(containerWidth: number): ImageOptimizeOptions {
  // 考虑设备像素比
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const targetWidth = Math.ceil(containerWidth * devicePixelRatio)
  
  // 限制最大尺寸以节省带宽
  const maxWidth = Math.min(targetWidth, 1200)
  
  return {
    width: maxWidth,
    quality: maxWidth > 800 ? 75 : 85, // 大图片用更低质量
    format: 'webp'
  }
}

/**
 * 生成多尺寸图片集合（用于响应式图片）
 */
export function generateImageSrcSet(originalUrl: string): string {
  const sizes = [400, 800, 1200]
  
  const srcSet = sizes.map(size => {
    const optimizedUrl = optimizeImageUrl(originalUrl, {
      width: size,
      quality: size > 800 ? 75 : 85,
      format: 'webp'
    })
    return `${optimizedUrl} ${size}w`
  }).join(', ')
  
  return srcSet
}