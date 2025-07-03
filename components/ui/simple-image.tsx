"use client"

import { useState } from "react"
import useStaticUrl from "@/hooks/use-static-url"
import { getImageLoadingProps } from "@/lib/smart-image-url"

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 超简单的图片组件 - 模仿Hero区域的成功模式
 * 
 * 特点：
 * 1. 使用useStaticUrl自动处理URL
 * 2. 原生<img>标签，没有复杂逻辑
 * 3. 简单的错误状态显示
 * 4. 100%可靠的本地静态文件
 */
export default function SimpleImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 使用智能URL策略
  const smartProps = getImageLoadingProps(src)
  
  // 优先使用智能策略的URL，fallback到useStaticUrl
  const finalUrl = useStaticUrl(smartProps.src)
  const finalLoading = loading || smartProps.loading
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`❌ SimpleImage 加载失败: ${src}`)
    setHasError(true)
    setIsLoading(false)
    onError?.(e)
  }
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`✅ SimpleImage 加载成功: ${src}`)
    setIsLoading(false)
    onLoad?.(e)
  }
  
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
        <div className="text-center p-2">
          <div className="text-2xl mb-1">🖼️</div>
          <div className="text-xs text-gray-500 font-medium">Image unavailable</div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center animate-pulse`}>
          <div className="text-center p-2">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs text-gray-400 font-medium">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={finalUrl}
        alt={alt}
        className={className}
        loading={finalLoading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        // 使用智能策略的优化属性
        fetchPriority={smartProps.fetchPriority}
        decoding="async"
      />
    </>
  )
}