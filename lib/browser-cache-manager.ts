/**
 * 浏览器缓存管理器 - 解决图片加载不稳定问题
 * 
 * 主要功能:
 * 1. 预加载关键图片
 * 2. 管理浏览器图片缓存
 * 3. 检测网络状态
 * 4. 提供缓存策略
 */

interface CacheOptions {
  maxAge?: number // 缓存最大时间(毫秒)
  preloadPriority?: 'high' | 'low'
  retryCount?: number
}

class BrowserCacheManager {
  private cache = new Map<string, { blob: Blob; timestamp: number; url: string }>()
  private loadingPromises = new Map<string, Promise<string>>()
  private failedUrls = new Set<string>()
  
  /**
   * 预加载图片到浏览器缓存
   */
  async preloadImage(src: string, options: CacheOptions = {}): Promise<string> {
    const { maxAge = 30 * 60 * 1000, preloadPriority = 'low', retryCount = 2 } = options
    
    // 检查是否已在加载中
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }
    
    // 检查缓存
    const cached = this.cache.get(src)
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log(`✅ 使用缓存图片: ${src}`)
      return cached.url
    }
    
    // 检查是否已失败
    if (this.failedUrls.has(src)) {
      throw new Error(`图片加载已知失败: ${src}`)
    }
    
    // 开始加载
    const loadPromise = this.loadImageWithRetry(src, retryCount)
    this.loadingPromises.set(src, loadPromise)
    
    try {
      const result = await loadPromise
      this.loadingPromises.delete(src)
      return result
    } catch (error) {
      this.loadingPromises.delete(src)
      this.failedUrls.add(src)
      throw error
    }
  }
  
  /**
   * 带重试的图片加载
   */
  private async loadImageWithRetry(src: string, retryCount: number): Promise<string> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await this.loadSingleImage(src, attempt)
        console.log(`✅ 图片加载成功 (尝试 ${attempt + 1}): ${src}`)
        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`⚠️ 图片加载失败 (尝试 ${attempt + 1}/${retryCount + 1}): ${src}`, error)
        
        // 如果不是最后一次尝试，等待一段时间再重试
        if (attempt < retryCount) {
          await this.delay(Math.pow(2, attempt) * 500) // 指数退避
        }
      }
    }
    
    throw lastError || new Error(`图片加载失败: ${src}`)
  }
  
  /**
   * 加载单个图片
   */
  private async loadSingleImage(src: string, attempt: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // 设置超时
      const timeout = setTimeout(() => {
        img.onload = null
        img.onerror = null
        reject(new Error('图片加载超时'))
      }, 15000) // 15秒超时，给更多时间
      
      img.onload = () => {
        clearTimeout(timeout)
        console.log(`✅ 图片预加载成功: ${src}`)
        
        // 不进行复杂的blob缓存，直接返回原URL
        // 浏览器自己会缓存已加载的图片
        resolve(src)
      }
      
      img.onerror = (e) => {
        clearTimeout(timeout)
        console.warn(`❌ 图片预加载失败: ${src}`, e)
        reject(new Error(`图片加载失败: ${src}`))
      }
      
      // 添加缓存破坏参数（仅重试时）
      const finalSrc = attempt > 0 ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}&t=${Date.now()}` : src
      
      // 设置图片属性
      try {
        img.crossOrigin = 'anonymous'
        if ('fetchPriority' in img) {
          (img as any).fetchPriority = 'low' // 预加载用低优先级
        }
        img.src = finalSrc
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }
  
  /**
   * 缓存图片Blob
   */
  private async cacheImageBlob(src: string, img: HTMLImageElement): Promise<string> {
    try {
      // 创建canvas来转换图片为blob
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建canvas context')
      
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('无法创建blob'))
            return
          }
          
          const objectUrl = URL.createObjectURL(blob)
          this.cache.set(src, {
            blob,
            timestamp: Date.now(),
            url: objectUrl
          })
          
          console.log(`💾 图片已缓存: ${src}`)
          resolve(objectUrl)
        }, 'image/jpeg', 0.8)
      })
    } catch (error) {
      console.warn('缓存图片失败:', error)
      return src
    }
  }
  
  /**
   * 批量预加载图片
   */
  async preloadImages(urls: string[], options: CacheOptions = {}): Promise<void> {
    console.log(`🚀 开始批量预加载 ${urls.length} 张图片`)
    
    const promises = urls.map(async (url, index) => {
      try {
        // 错开加载时间，避免网络拥塞
        await this.delay(index * 100)
        await this.preloadImage(url, options)
        console.log(`✅ 预加载完成 (${index + 1}/${urls.length}): ${url}`)
      } catch (error) {
        console.warn(`❌ 预加载失败 (${index + 1}/${urls.length}): ${url}`, error)
      }
    })
    
    await Promise.allSettled(promises)
    console.log(`🎉 批量预加载完成`)
  }
  
  /**
   * 检查网络状态
   */
  getNetworkStatus(): 'online' | 'offline' | 'slow' {
    if (!navigator.onLine) return 'offline'
    
    // 检查连接类型（如果支持）
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow'
      }
    }
    
    return 'online'
  }
  
  /**
   * 清理过期缓存
   */
  cleanup(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        URL.revokeObjectURL(value.url)
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 清理了 ${cleanedCount} 个过期缓存`)
    }
  }
  
  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      loadingCount: this.loadingPromises.size,
      failedCount: this.failedUrls.size,
      memoryUsage: this.estimateMemoryUsage()
    }
  }
  
  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(): string {
    let totalSize = 0
    for (const value of this.cache.values()) {
      totalSize += value.blob.size
    }
    
    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`
  }
  
  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * 重置所有状态
   */
  reset(): void {
    // 清理object URLs
    for (const value of this.cache.values()) {
      URL.revokeObjectURL(value.url)
    }
    
    this.cache.clear()
    this.loadingPromises.clear()
    this.failedUrls.clear()
    
    console.log('🔄 缓存管理器已重置')
  }
}

// 创建全局实例
export const browserCacheManager = new BrowserCacheManager()

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    try {
      browserCacheManager.cleanup()
    } catch (error) {
      console.warn('清理缓存时出错:', error)
    }
  }, 5 * 60 * 1000) // 每5分钟清理一次

  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    try {
      clearInterval(cleanupInterval)
      browserCacheManager.reset()
    } catch (error) {
      console.warn('页面卸载清理时出错:', error)
    }
  })
}