"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import MagicLoading from "./magic-loading"

interface MagicImageProps {
  src: string
  alt: string
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  loadingMessage?: string
  onError?: () => void
  priority?: boolean
  width?: number
  height?: number
  sizes?: string
  style?: React.CSSProperties
}

export default function MagicImage({
  src,
  alt,
  className = "",
  objectFit = "cover",
  loadingMessage = "Loading image...",
  onError,
  priority = false,
  width,
  height,
  sizes,
  style
}: MagicImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // 重置状态当src改变时
    setIsLoading(true)
    setHasError(false)
    setImageLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    setImageLoaded(true)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (onError) {
      onError()
    }
  }

  const imageClassName = `
    ${className}
    ${isLoading ? 'opacity-0' : 'opacity-100'}
    transition-opacity duration-300
  `.trim()

  return (
    <div className="relative w-full h-full">
      {/* 加载状态 */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5f1e8] to-[#d4a574]/20">
          <MagicLoading 
            size="small" 
            message={loadingMessage}
            showMessage={false}
          />
        </div>
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f1e8] to-[#d4a574]/20 text-[#8b7355]">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm font-bold text-center" style={{ fontFamily: "Comic Sans MS, cursive" }}>
            Image unavailable
          </div>
        </div>
      )}

      {/* 实际图片 */}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={imageClassName}
          style={{
            objectFit,
            ...style
          }}
          onLoad={handleLoad}
          onError={handleError}
          // 对于没有指定宽高的图片，使用fill模式
          {...(!width && !height ? { fill: true } : {})}
        />
      )}
    </div>
  )
} 