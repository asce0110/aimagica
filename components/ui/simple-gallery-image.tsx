"use client"

import { useState, useMemo } from "react"
import { optimizeImageUrl, getOptimalImageSize, generateImageSrcSet } from "@/lib/image-optimizer"

interface SimpleGalleryImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 简单的Gallery图片组件 - 直接显示图片，不做任何URL转换
 * 用于显示R2存储桶直链和本地静态图片，确保在任何网络环境下都能加载
 */
export default function SimpleGalleryImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: SimpleGalleryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 优化图片URL和生成srcSet
  const optimizedImage = useMemo(() => {
    // 估算容器宽度（Hero区域图片大约300px宽）
    const estimatedWidth = 300
    const optimizeOptions = getOptimalImageSize(estimatedWidth)
    
    return {
      src: optimizeImageUrl(src, optimizeOptions),
      srcSet: generateImageSrcSet(src),
      fallbackSrc: src // 保留原始URL作为fallback
    }
  }, [src])
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    
    // 如果优化URL失败，尝试使用原始URL
    if (target.src === optimizedImage.src && optimizedImage.fallbackSrc !== optimizedImage.src) {
      console.warn(`⚠️ 优化图片加载失败，尝试原始URL: ${optimizedImage.fallbackSrc}`)
      target.src = optimizedImage.fallbackSrc
      return
    }
    
    console.error(`❌ SimpleGalleryImage 加载失败: ${src}`)
    console.error('错误详情:', e)
    setHasError(true)
    setIsLoading(false)
    onError?.(e)
  }
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`✅ SimpleGalleryImage 加载成功: ${src}`)
    setIsLoading(false)
    onLoad?.(e)
  }
  
  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">图片加载失败</span>
      </div>
    )
  }
  
  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center animate-pulse`}>
          <div className="text-gray-400 text-xs">加载中...</div>
        </div>
      )}
      <img
        src={optimizedImage.src}
        srcSet={optimizedImage.srcSet}
        sizes="(max-width: 768px) 50vw, 25vw"
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        // 添加图片优化属性
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        decoding="async"
      />
    </>
  )
}