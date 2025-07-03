"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye } from "lucide-react"
import MagicImage from "@/components/ui/magic-image"
import MagicLoading from "@/components/ui/magic-loading"
import SmartAspectImage from "@/components/ui/smart-aspect-image"
import GlassMorphism from "@/components/glass-morphism"
import { useRouter } from "next/navigation"
import OptimizedImage from "@/components/ui/optimized-image"
import { imageCache } from "@/lib/image-cache"
import useStaticUrl from "@/hooks/use-static-url"
import { preloadImageMapping } from "@/lib/image-url-mapper"
import SimpleGalleryImage from "@/components/ui/simple-gallery-image"
import { getApiEndpoint } from "@/lib/api-config"
import { useSmartHeroImages } from "@/hooks/use-smart-hero-images"

interface GalleryImage {
  id: string
  url: string
  title: string
  author: string
  createdAt: string
  prompt: string
  style: string
  rotation: number
}

export default function HeroSection() {
  const router = useRouter()
  
  // 使用智能Hero图片管理
  const { 
    images: smartHeroImages, 
    isLoading: heroImagesLoading, 
    isRefreshing,
    cacheStatus, 
    lastUpdate,
    refreshImages 
  } = useSmartHeroImages({
    maxAge: 30, // 缓存30分钟
    fallbackImages: [
      {
        id: 'fallback-1',
        url: '/images/hero-cache/hero-1-japanese-anime.png',
        title: 'Japanese Anime Style',
        author: 'AIMAGICA User',
        createdAt: '最近',
        prompt: 'Japanese Anime Style',
        style: 'Anime',
        rotation: 2.5,
        isCached: true
      },
      {
        id: 'fallback-2', 
        url: '/images/hero-cache/hero-2-cyberpunk-city.jpeg',
        title: 'Cyberpunk City',
        author: 'AIMAGICA User',
        createdAt: '最近',
        prompt: 'A cyberpunk city with neon lights',
        style: 'Cyberpunk',
        rotation: -1.2,
        isCached: true
      },
      {
        id: 'fallback-3',
        url: '/images/hero-cache/hero-3-zen-garden.jpeg',
        title: 'Zen Garden',
        author: 'AIMAGICA User',
        createdAt: '最近',
        prompt: 'A peaceful zen garden',
        style: 'Photography',
        rotation: 1.8,
        isCached: true
      },
      {
        id: 'fallback-4',
        url: '/images/hero-cache/hero-4-digital-art.png',
        title: 'Digital Art',
        author: 'AIMAGICA User',
        createdAt: '最近',
        prompt: 'Beautiful digital artwork',
        style: 'Digital Art',
        rotation: -2.1,
        isCached: true
      }
    ]
  })
  
  // 使用 useStaticUrl hook 获取CDN URL
  const catWizardUrl = useStaticUrl('/images/examples/cat-wizard.svg')
  const cyberCityUrl = useStaticUrl('/images/examples/cyber-city.svg')
  const magicForestUrl = useStaticUrl('/images/examples/magic-forest.svg')
  const spaceArtUrl = useStaticUrl('/images/examples/space-art.svg')
  const backgroundUrl = useStaticUrl('/images/backgrounds/0c09cb2f-5876-49e0-9776-ef9c743a2eac.jpeg')
  const errorPlaceholderUrl = useStaticUrl('/images/placeholder-error.svg')
  const placeholderUrl = useStaticUrl('/images/placeholder.svg')

  // 优化的示例图片数据 - 使用CDN URL
  const exampleImages = useMemo(() => [
    { 
      src: catWizardUrl, 
      fallback: catWizardUrl,
      title: "Cat Wizard",
      preload: true
    },
    { 
      src: cyberCityUrl, 
      fallback: cyberCityUrl,
      title: "Cyber City",
      preload: true
    },
    { 
      src: magicForestUrl, 
      fallback: magicForestUrl,
      title: "Magic Forest",
      preload: false
    },
    { 
      src: spaceArtUrl, 
      fallback: spaceArtUrl,
      title: "Space Art",
      preload: false
    },
  ], [catWizardUrl, cyberCityUrl, magicForestUrl, spaceArtUrl])

  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  const [networkConnectivity, setNetworkConnectivity] = useState<'unknown' | 'good' | 'limited' | 'poor'>('unknown')
  const [forceLocalImages, setForceLocalImages] = useState(false)

  // 生成固定的随机旋转角度数组，避免hydration mismatch
  const imageRotations = useMemo(() => {
    return exampleImages.map(() => Math.random() * 4 - 2)
  }, [])

  // 为每个照片生成随机的摆动参数
  const swayAnimations = useMemo(() => {
    return Array.from({ length: 4 }, (_, index) => ({
      duration: 3 + Math.random() * 4, // 3-7秒的随机持续时间
      delay: Math.random() * 2, // 0-2秒的随机延迟
      amplitude: 0.5 + Math.random() * 1.5, // 0.5-2度的随机摆动幅度
      rotateRange: 2 + Math.random() * 3, // 2-5度的随机旋转范围
    }))
  }, [])

  // 预加载关键图片
  useEffect(() => {
    const preloadImages = () => {
      // 预加载示例图片
      exampleImages.forEach((img) => {
        if (img.preload) {
          const webpImg = new window.Image()
          webpImg.src = img.src
          
          const fallbackImg = new window.Image()
          fallbackImg.src = img.fallback
        }
      })
    }

    if (typeof window !== 'undefined') {
      preloadImages()
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    
    // 打印智能缓存状态
    if (!heroImagesLoading) {
      console.log('🎯 Hero智能缓存状态:', {
        cacheStatus,
        lastUpdate: lastUpdate?.toLocaleTimeString(),
        isRefreshing,
        imageCount: smartHeroImages.length
      })
      console.log('📸 Hero图片数据:', smartHeroImages.map(img => ({ 
        title: img.title, 
        isCached: img.isCached,
        url: img.url
      })))
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [heroImagesLoading, cacheStatus, smartHeroImages, lastUpdate, isRefreshing])

  // 网络连通性检测
  useEffect(() => {
    let failureCount = 0
    const maxFailures = 2
    
    const checkNetworkConnectivity = () => {
      if (failureCount >= maxFailures) {
        console.log('🚫 网络连通性差，强制使用本地图片')
        setNetworkConnectivity('poor')
        setForceLocalImages(true)
      }
    }
    
    // 监听图片加载错误
    const handleGlobalImageError = () => {
      failureCount++
      console.log(`📊 图片加载失败计数: ${failureCount}/${maxFailures}`)
      checkNetworkConnectivity()
    }
    
    // 暴露给全局使用
    (window as any).heroImageFailureHandler = handleGlobalImageError
    
    return () => {
      delete (window as any).heroImageFailureHandler
    }
  }, [])


  // 处理图片加载错误
  const handleImageError = (imageId: string) => {
    setImageLoadErrors(prev => new Set([...prev, imageId]))
  }

  // 检查是否支持WebP
  const supportsWebP = useMemo(() => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }, [])

  return (
    <section className="container mx-auto px-4 md:px-6 py-1 mb-4">
      {/* 背景图片容器 - 带景深效果 */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden">
        {/* 用户上传的海边晾衣绳背景 */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backgroundUrl})`,
            transform: 'scale(1.02)',
          }}
        />
        
        <div className="relative z-10 rounded-xl md:rounded-2xl shadow-xl overflow-hidden border-2 md:border-3 border-[#2d3e2d] transform hover:scale-[1.01] transition-all bg-transparent">
        
        {/* 简化的画廊展示区域 */}
        <div className="py-6 md:py-8 px-6 relative overflow-hidden">
          {/* 添加随风飘动的CSS动画 */}
          <style jsx>{`
            @keyframes swayGentle {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              25% { transform: translateX(2px) rotate(0.5deg); }
              50% { transform: translateX(-1px) rotate(-0.3deg); }
              75% { transform: translateX(1.5px) rotate(0.2deg); }
            }
            @keyframes swayMedium {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              20% { transform: translateX(-3px) rotate(-1deg); }
              40% { transform: translateX(4px) rotate(0.8deg); }
              60% { transform: translateX(-2px) rotate(-0.5deg); }
              80% { transform: translateX(3px) rotate(0.7deg); }
            }
            @keyframes swayStrong {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              16% { transform: translateX(-4px) rotate(-1.5deg); }
              32% { transform: translateX(5px) rotate(1.2deg); }
              48% { transform: translateX(-3px) rotate(-0.8deg); }
              64% { transform: translateX(4px) rotate(1deg); }
              80% { transform: translateX(-2px) rotate(-0.6deg); }
            }
            @keyframes swayWild {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              12% { transform: translateX(-6px) rotate(-2deg); }
              24% { transform: translateX(7px) rotate(1.8deg); }
              36% { transform: translateX(-4px) rotate(-1.2deg); }
              48% { transform: translateX(5px) rotate(1.5deg); }
              60% { transform: translateX(-3px) rotate(-1deg); }
              72% { transform: translateX(6px) rotate(1.3deg); }
              84% { transform: translateX(-2px) rotate(-0.7deg); }
            }
            .photo-sway-1 {
              animation: swayGentle 4.2s ease-in-out infinite;
              animation-delay: 0.5s;
            }
            .photo-sway-2 {
              animation: swayMedium 5.7s ease-in-out infinite;
              animation-delay: 1.2s;
            }
            .photo-sway-3 {
              animation: swayStrong 3.8s ease-in-out infinite;
              animation-delay: 0.8s;
            }
                         .photo-sway-4 {
               animation: swayWild 6.1s ease-in-out infinite;
               animation-delay: 1.8s;
             }
             /* 绳子轻微摆动 */
             @keyframes ropeSway {
               0%, 100% { transform: translateY(0px) scaleY(1); }
               50% { transform: translateY(1px) scaleY(0.995); }
             }
             .rope-container {
               animation: ropeSway 8s ease-in-out infinite;
             }
             /* 增强摆动效果，添加垂直方向的微小移动 */
             @keyframes photoFloatGentle {
               0%, 100% { transform: translateY(0px); }
               50% { transform: translateY(-1px); }
             }
             @keyframes photoFloatMedium {
               0%, 100% { transform: translateY(0px); }
               50% { transform: translateY(-2px); }
             }
             .photo-sway-1:hover, .photo-sway-3:hover {
               animation: swayGentle 4.2s ease-in-out infinite, photoFloatGentle 2s ease-in-out infinite;
             }
             .photo-sway-2:hover, .photo-sway-4:hover {
               animation: swayMedium 5.7s ease-in-out infinite, photoFloatMedium 2.5s ease-in-out infinite;
             }
           `}</style>
          
          {/* 照片容器 - 重新设计，确保夹子和绳子完美对齐 */}
          <div className="relative pt-8">
            {/* 晾晒绳子效果 - 固定在照片容器顶部 */}
            <div className="absolute top-0 left-0 right-0 h-12 z-10 overflow-hidden">
              {/* 绳子阴影 - 弧形 */}
              <div className="absolute inset-0 transform translate-y-3 blur-sm">
                <svg width="100%" height="48" viewBox="0 0 1200 48" className="w-full h-12" preserveAspectRatio="none">
                  <path
                    d="M0,15 Q300,45 600,40 T1200,15"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* 绳子主体 - 弧形 */}
              <div className="relative">
                <svg width="100%" height="48" viewBox="0 0 1200 48" className="w-full h-12" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b7355" />
                      <stop offset="50%" stopColor="#d4a574" />
                      <stop offset="100%" stopColor="#8b7355" />
                    </linearGradient>
                    {/* 简单的绳子螺旋纹理 */}
                    <pattern id="ropeSpiral" x="0" y="0" width="20" height="8" patternUnits="userSpaceOnUse">
                      {/* 螺旋线条 - 拧成的效果 */}
                      <path d="M0,4 Q5,1 10,4 T20,4" stroke="#6b4e3a" strokeWidth="1" fill="none" opacity="0.6" />
                      <path d="M0,4 Q5,7 10,4 T20,4" stroke="#967b5f" strokeWidth="1" fill="none" opacity="0.4" />
                      <path d="M5,4 Q10,2 15,4 T25,4" stroke="#a68660" strokeWidth="0.5" fill="none" opacity="0.5" />
                    </pattern>
                  </defs>
                  
                  {/* 绳子基础层 */}
                  <path
                    d="M0,15 Q300,45 600,40 T1200,15"
                    stroke="url(#ropeGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {/* 拧成的螺旋纹理 */}
                  <path
                    d="M0,15 Q300,45 600,40 T1200,15"
                    stroke="url(#ropeSpiral)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            
            {/* 装饰夹子 - 固定在绳子两端 */}
            <div className="absolute -top-2 -left-8 w-12 h-12 z-20">
              <div className="w-full h-full bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full shadow-xl border-4 border-[#2d3e2d] flex items-center justify-center transform rotate-12">
                <div className="text-xl">🪄</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-8 w-12 h-12 z-20">
              <div className="w-full h-full bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full shadow-xl border-4 border-[#2d3e2d] flex items-center justify-center transform -rotate-12">
                <div className="text-xl">✨</div>
              </div>
            </div>
            
            {/* 移动端：两排挂照片布局 */}
            <div className="md:hidden pt-4">
              {!isMounted ? null : (
                <div className="flex flex-col gap-8">
                  {/* 第一排 - 挂在绳子上 */}
                  <div className="grid grid-cols-2 gap-4 justify-items-center">
                    {(!heroImagesLoading && smartHeroImages.length > 0 ? smartHeroImages : exampleImages).slice(0, 2).map((img, index) => {
                      const hangHeight = [2, 4][index]
                      const aspectRatios = ['aspect-[4/5]', 'aspect-[3/4]']
                      const aspectRatio = aspectRatios[index % aspectRatios.length]
                      
                      return (
                        <div
                          key={`mobile-top-${index}`}
                          className={`group cursor-pointer relative photo-sway-${index + 1} w-36`}
                          style={{ 
                            transform: `rotate(${!heroImagesLoading && smartHeroImages.length > 0 ? img.rotation || 0 : imageRotations[index]}deg)`,
                            marginTop: `${hangHeight * 0.5}rem`
                          }}
                          onClick={() => router.push("/gallery")}
                        >
                          {/* 夹子 - 挂在绳子上 */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
                            <div className="w-10 h-7 bg-gradient-to-b from-[#f5f1e8] to-[#d4a574] rounded-lg shadow-xl border-2 border-[#2d3e2d] flex items-center justify-center transform hover:scale-110 transition-all">
                              <div className="w-1.5 h-4 bg-[#8b7355] rounded-full shadow-inner"></div>
                            </div>
                          </div>
                          
                          {/* 照片 */}
                          <div className={`${aspectRatio} w-full rounded-lg overflow-hidden transform hover:scale-110 hover:rotate-0 transition-all shadow-xl relative bg-white`}>
                            <div className="absolute inset-y-1 inset-x-0 bg-white rounded-md overflow-hidden">
                              {!heroImagesLoading && smartHeroImages.length > 0 ? (
                                <SimpleGalleryImage
                                  src={img.url || placeholderUrl}
                                  alt={img.title}
                                  className="w-full h-full object-cover transition-opacity duration-300"
                                  loading={index < 2 ? "eager" : "lazy"}
                                />
                              ) : (
                                <img
                                  src={img.src}
                                  alt={img.title}
                                  className="w-full h-full object-cover transition-opacity duration-300"
                                  loading={index < 2 ? "eager" : "lazy"}
                                />
                              )}
                            </div>
                          </div>
                          
                          {/* 垂直连接线到下一排 */}
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-[#8b7355] opacity-60"></div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 第二排 - 挂在第一排下面 */}
                  <div className="grid grid-cols-2 gap-4 justify-items-center">
                    {(!heroImagesLoading && smartHeroImages.length > 0 ? smartHeroImages : exampleImages).slice(2, 4).map((img, index) => {
                      const realIndex = index + 2
                      const aspectRatios = ['aspect-[5/4]', 'aspect-[4/3]']
                      const aspectRatio = aspectRatios[index % aspectRatios.length]
                      
                      return (
                        <div
                          key={`mobile-bottom-${index}`}
                          className={`group cursor-pointer relative photo-sway-${realIndex + 1} w-32`}
                          style={{ 
                            transform: `rotate(${!heroImagesLoading && smartHeroImages.length > 0 ? img.rotation || 0 : imageRotations[realIndex]}deg)`
                          }}
                          onClick={() => router.push("/gallery")}
                        >
                          {/* 夹子 - 挂在上一张照片的连接线上 */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                            <div className="w-8 h-6 bg-gradient-to-b from-[#f5f1e8] to-[#d4a574] rounded-lg shadow-xl border-2 border-[#2d3e2d] flex items-center justify-center transform hover:scale-110 transition-all">
                              <div className="w-1 h-3 bg-[#8b7355] rounded-full shadow-inner"></div>
                            </div>
                          </div>
                          
                          {/* 照片 */}
                          <div className={`${aspectRatio} w-full rounded-lg overflow-hidden transform hover:scale-110 hover:rotate-0 transition-all shadow-xl relative bg-white`}>
                            <div className="absolute inset-y-1 inset-x-0 bg-white rounded-md overflow-hidden">
                              {!heroImagesLoading && smartHeroImages.length > 0 ? (
                                <SimpleGalleryImage
                                  src={img.url || placeholderUrl}
                                  alt={img.title}
                                  className="w-full h-full object-cover transition-opacity duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <img
                                  src={img.src}
                                  alt={img.title}
                                  className="w-full h-full object-cover transition-opacity duration-300"
                                  loading="lazy"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 桌面端：横向4张布局 */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-4 md:pt-4">
            {!isMounted ? null : (!heroImagesLoading && smartHeroImages.length > 0 ? smartHeroImages : exampleImages).slice(0, 4).map((img, index) => {
              const hangHeight = [2, 4, 3, 1][index]
              const aspectRatios = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-[5/4]', 'aspect-[4/3]']
              const aspectRatio = aspectRatios[index % aspectRatios.length]
              
              return (
                <div
                  key={`desktop-${index}`}
                  className={`group cursor-pointer relative photo-sway-${index + 1}`}
                  style={{ 
                    transform: `rotate(${!heroImagesLoading && smartHeroImages.length > 0 ? img.rotation || 0 : imageRotations[index]}deg)`,
                    marginTop: `${hangHeight * 0.5}rem`
                  }}
                  onClick={() => router.push("/gallery")}
                >
                  {/* 夹子 - 挂在绳子上 */}
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="w-10 h-7 bg-gradient-to-b from-[#f5f1e8] to-[#d4a574] rounded-lg shadow-xl border-2 border-[#2d3e2d] flex items-center justify-center transform hover:scale-110 transition-all">
                      <div className="w-1.5 h-4 bg-[#8b7355] rounded-full shadow-inner"></div>
                    </div>
                  </div>
                  
                  {/* 照片 */}
                  <div className={`${aspectRatio} w-full rounded-lg overflow-hidden transform hover:scale-110 hover:rotate-0 transition-all shadow-xl relative bg-white`}>
                    <div className="absolute inset-y-1 inset-x-0 bg-white rounded-md overflow-hidden">
                      {!heroImagesLoading && cachedHeroImages.length > 0 ? (
                        <SimpleGalleryImage
                          src={img.url || placeholderUrl}
                          alt={img.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                      ) : (
                        <img
                          src={img.src}
                          alt={img.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
            </div>
          </div>

          <div className="text-center mt-8">
            {/* 智能缓存状态指示器 */}
            {!heroImagesLoading && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  cacheStatus === 'live' ? 'bg-green-500' :
                  cacheStatus === 'cached' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <span className="text-[#f5f1e8]/70">
                  {cacheStatus === 'live' ? '🔄 最新内容' :
                   cacheStatus === 'cached' ? '⚡ 缓存内容' : '📱 离线内容'}
                </span>
                {isRefreshing && (
                  <span className="text-[#f5f1e8]/50 animate-pulse">正在更新...</span>
                )}
                {lastUpdate && (
                  <span className="text-[#f5f1e8]/50 text-xs">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            
            <Button
              onClick={() => router.push("/gallery")}
              className="bg-[#8b7355] hover:bg-[#7a6449] text-[#f5f1e8] font-black px-8 py-3 rounded-xl shadow-lg transform hover:scale-110 transition-all"
              style={{ 
                fontFamily: "var(--font-accent)",
                boxShadow: "3px 3px 0px #2d3e2d" 
              }}
            >
              <Eye className="w-5 h-5 mr-3" />
              VIEW GALLERY 🖼️
            </Button>
          </div>
        </div>

        {/* Header - 简化版 - 移到下方 */}
        <div 
          className="py-2 md:py-3 px-4 text-center relative bg-[#4a5a4a]/70 backdrop-blur-sm"
        >
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#f5f1e8] rounded-full"></div>
          <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-[#f5f1e8] rounded-full"></div>
          <h1
            className="text-3xl md:text-6xl font-black text-[#f5f1e8] mb-8 transform -rotate-1 animate-pulse font-heading"
            style={{
              textShadow: "3px 3px 0px #2d3e2d, 6px 6px 0px rgba(45,62,45,0.5)",
            }}
          >
            CREATE YOUR AIMAGICA!
          </h1>

          <div className="flex justify-center mb-4">
            <Button
              onClick={() => {
                // 检查当前是否已经在首页
                if (window.location.pathname === "/") {
                  // 已经在首页，直接滚动到创建区域
                  const createSection = document.querySelector('[data-step="create"]')
                  if (createSection) {
                    createSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                } else {
                  // 不在首页，先导航到首页
                  router.push("/")
                  // 滚动到创建区域
                  setTimeout(() => {
                    const createSection = document.querySelector('[data-step="create"]')
                    if (createSection) {
                      createSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }
              }}
              className="relative bg-gradient-to-r from-[#f5f1e8] via-[#d4a574] to-[#f5f1e8] hover:from-[#d4a574] hover:via-[#f5f1e8] hover:to-[#d4a574] text-[#2d3e2d] font-black px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-125 transition-all text-xl md:text-2xl animate-pulse hover:animate-none border-4 border-[#2d3e2d]"
              style={{ 
                fontFamily: "var(--font-accent)",
                boxShadow: "8px 8px 0px #2d3e2d, 12px 12px 20px rgba(0,0,0,0.3)" 
              }}
            >
              <Sparkles className="w-8 h-8 mr-4 animate-spin" />
              START CREATING! ✨
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-pulse flex items-center justify-center text-white text-xs font-bold">!</div>
            </Button>
          </div>
          
          <div className="text-center">
            <p
              className="text-[#f5f1e8] font-bold text-lg md:text-xl animate-bounce"
              style={{ 
                fontFamily: "var(--font-accent)",
                textShadow: "2px 2px 0px #2d3e2d" 
              }}
            >
              👆 CLICK HERE TO START THE MAGIC! 👆
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
