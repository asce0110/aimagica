"use client"

import { useState } from "react"

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
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
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
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      style={{ display: isLoading ? 'none' : 'block' }}
    />
  )
}