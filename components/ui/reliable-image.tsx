"use client"

import { useState, useRef, useEffect } from "react"

interface ReliableImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 可靠的图片组件 - 专门解决白屏问题
 * 
 * 核心原则：
 * 1. 始终显示内容，绝不白屏
 * 2. 简单可靠，不过度复杂化
 * 3. 用户体验优先
 */
export default function ReliableImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: ReliableImageProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [actualSrc, setActualSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // 重置状态当src改变时
  useEffect(() => {
    if (src !== actualSrc) {
      setActualSrc(src)
      setImageStatus('loading')
    }
  }, [src])

  // 超时处理
  useEffect(() => {
    if (imageStatus === 'loading') {
      timeoutRef.current = setTimeout(() => {
        console.warn(`图片加载超时: ${src}`)
        setImageStatus('error')
      }, 10000) // 10秒超时
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [imageStatus, src])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setImageStatus('loaded')
    onLoad?.(e)
    console.log(`✅ 图片加载成功: ${src}`)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setImageStatus('error')
    onError?.(e)
    console.error(`❌ 图片加载失败: ${src}`)
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 始终显示的背景层 - 确保不会白屏 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
        {/* 加载状态 */}
        {imageStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-lg">📷</div>
              </div>
              <div className="text-sm text-gray-400 font-medium">加载中...</div>
              <div className="w-8 h-1 mx-auto mt-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {imageStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-lg">🖼️</div>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-1">图片暂时无法显示</div>
              <div className="text-xs text-gray-400 max-w-[150px] truncate">{alt}</div>
            </div>
          </div>
        )}
      </div>

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={actualSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: imageStatus === 'loaded' ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        // 优化属性
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
      />
    </div>
  )
}