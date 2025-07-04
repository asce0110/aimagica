"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Download, 
  Share2, 
  Search, 
  Eye, 
  MessageCircle,
  Star,
  Crown,
  Wand2,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import useStaticUrl from "@/hooks/use-static-url"
import { getStaticGalleryData, getImagesByStyle, searchImages, type StaticGalleryImage } from "@/lib/static-gallery-data"
import VirtualWaterfall, { type WaterfallItem } from "@/components/ui/virtual-waterfall"
import LazyGalleryImage from "@/components/ui/lazy-gallery-image"

// 分页配置
const ITEMS_PER_PAGE = 12
const INITIAL_LOAD = 12

interface Comment {
  id: string | number
  author: string
  authorAvatar: string
  content: string
  likes: number
  createdAt: string
}

const sampleComments: Comment[] = [
  {
    id: 1,
    author: "ArtLover",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=AL",
    content: "This is absolutely stunning! The colors are magical! ✨",
    createdAt: "2 hours ago",
    likes: 24,
  },
  {
    id: 2,
    author: "CreativeSoul",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=CS",
    content: "How did you create this masterpiece? The details are incredible!",
    createdAt: "1 day ago",
    likes: 18,
  },
  {
    id: 3,
    author: "DigitalDreamer",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=DD",
    content: "I'm inspired to create something similar. Thanks for sharing your art!",
    createdAt: "3 days ago",
    likes: 12,
  },
]

/**
 * 高性能Gallery客户端组件
 * 
 * 特性：
 * 1. 虚拟瀑布流布局
 * 2. 分页加载机制
 * 3. SEO友好的首屏渲染
 * 4. 懒加载图片
 * 5. 响应式设计
 */
export default function OptimizedGalleryClient() {
  const { data: session } = useSession()
  const logoUrl = useStaticUrl('/images/aimagica-logo.png')

  // 数据状态
  const [allImages] = useState<StaticGalleryImage[]>(() => {
    const staticData = getStaticGalleryData()
    console.log('🎯 OptimizedGallery初始化:', staticData.length, '张图片')
    return staticData
  })
  
  const [displayedImages, setDisplayedImages] = useState<StaticGalleryImage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // UI状态
  const [selectedImage, setSelectedImage] = useState<StaticGalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 过滤和搜索逻辑
  const filteredImages = useMemo(() => {
    let result = allImages

    // 样式过滤
    if (filter !== "all") {
      result = result.filter(image => 
        image.style.toLowerCase() === filter.toLowerCase()
      )
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(image =>
        image.title.toLowerCase().includes(query) ||
        image.author.toLowerCase().includes(query) ||
        image.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    console.log(`🔍 过滤结果: ${result.length}张图片 (filter: ${filter}, search: "${searchQuery}")`)
    return result
  }, [allImages, filter, searchQuery])

  // 初始化首屏数据
  useEffect(() => {
    const initialImages = filteredImages.slice(0, INITIAL_LOAD)
    setDisplayedImages(initialImages)
    setCurrentPage(1)
    console.log(`📦 初始化显示: ${initialImages.length}张图片`)
  }, [filteredImages])

  // 加载更多图片
  const loadMore = useCallback(() => {
    if (loading) return

    const nextPage = currentPage + 1
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newImages = filteredImages.slice(startIndex, endIndex)

    if (newImages.length === 0) {
      console.log('📄 没有更多图片可加载')
      return
    }

    setLoading(true)
    console.log(`📄 加载第${nextPage}页: ${newImages.length}张新图片`)

    // 模拟加载延迟，提升用户体验
    setTimeout(() => {
      setDisplayedImages(prev => [...prev, ...newImages])
      setCurrentPage(nextPage)
      setLoading(false)
      console.log(`✅ 加载完成，总计显示: ${displayedImages.length + newImages.length}张图片`)
    }, 800)
  }, [loading, currentPage, filteredImages, displayedImages.length])

  // 是否还有更多数据
  const hasMore = displayedImages.length < filteredImages.length

  // 转换为瀑布流数据格式 - 统一移动端高度避免间距不一致
  const waterfallItems: WaterfallItem[] = useMemo(() => {
    return displayedImages.map(image => {
      // 移动端使用固定高度避免间距不一致，桌面端使用多样化高度
      const mobileHeight = 280 // 统一的移动端高度
      const desktopHeight = image.size === 'vertical' ? 400 : 
                           image.size === 'horizontal' ? 225 :
                           image.size === 'large' ? 450 :
                           image.size === 'small' ? 300 : 375
      
      return {
        id: image.id,
        url: image.url,
        title: image.title,
        height: isMobile ? mobileHeight : desktopHeight,
        ...image
      }
    })
  }, [displayedImages, isMobile])

  // 图片点击处理
  const handleImageClick = useCallback((image: StaticGalleryImage) => {
    setSelectedImage(image)
    console.log(`🖼️ 打开图片详情: ${image.title}`)
  }, [])

  // 点赞处理
  const handleLike = useCallback(async (id: string | number) => {
    console.log(`❤️ 点赞图片: ${id}`)
    
    // 更新本地状态
    setDisplayedImages(prev =>
      prev.map(img =>
        img.id === id 
          ? { 
              ...img, 
              isLiked: !img.isLiked, 
              likes: img.isLiked ? img.likes - 1 : img.likes + 1 
            } 
          : img
      )
    )

    // 如果是当前选中的图片，也更新详情页面
    if (selectedImage && selectedImage.id === id) {
      setSelectedImage(prev => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      } : null)
    }
  }, [selectedImage])

  // 渲染单个图片项
  const renderItem = useCallback((item: WaterfallItem, index: number) => {
    const image = item as StaticGalleryImage
    return (
      <LazyGalleryImage
        key={image.id}
        id={image.id}
        url={image.url}
        title={image.title}
        author={image.author}
        likes={image.likes}
        views={image.views}
        isPremium={image.isPremium}
        isFeatured={image.isFeatured}
        isLiked={image.isLiked}
        createdAt={image.createdAt}
        size={image.size}
        rotation={image.rotation}
        onClick={() => handleImageClick(image)}
        priority={index < 4} // 前4张图片优先加载
      />
    )
  }, [handleImageClick])

  return (
    <div className="min-h-screen bg-black">
      {/* 导航栏 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333] sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo和品牌 */}
            <div className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all">
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="AIMAGICA"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                  onError={(e) => {
                    console.error('🖼️ Gallery logo加载失败:', logoUrl)
                    const target = e.currentTarget as HTMLImageElement
                    if (!target.src.includes('placeholder-logo')) {
                      target.src = '/placeholder-logo.png'
                    }
                  }}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl font-black text-white transform -rotate-1"
                  style={{ textShadow: "2px 2px 0px #333" }}
                >
                  AIMAGICA
                </h1>
                <p className="text-xs text-gray-400 transform rotate-1">
                  Magic Gallery ✨
                </p>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search magical creations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* 过滤器标签 */}
        <div className="mb-8 flex flex-wrap gap-4 items-start">
          <Tabs value={filter} onValueChange={setFilter} className="flex-1 min-w-[200px]">
            <TabsList className="bg-[#1a1a1a] border-2 border-[#444] rounded-xl p-1 flex flex-wrap gap-1">
              <TabsTrigger
                value="all"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all"
              >
                All Magic
              </TabsTrigger>
              <TabsTrigger
                value="fantasy"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all"
              >
                Fantasy 🧙‍♂️
              </TabsTrigger>
              <TabsTrigger
                value="cyberpunk"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all"
              >
                Cyberpunk 🤖
              </TabsTrigger>
              <TabsTrigger
                value="sci-fi"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all"
              >
                Sci-Fi 🚀
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 统计信息 */}
        <motion.div 
          className="mb-6 flex items-center justify-between bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#444]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#d4a574]" />
              <span className="text-white font-bold">
                {displayedImages.length} of {filteredImages.length} artworks
              </span>
            </div>
            {searchQuery && (
              <Badge variant="outline" className="bg-[#2a2a2a] text-gray-300">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>High-performance gallery</span>
          </div>
        </motion.div>

        {/* 瀑布流画廊 */}
        <VirtualWaterfall
          items={waterfallItems}
          columns={isMobile ? 2 : 4}
          gap={isMobile ? 12 : 16}
          itemMinWidth={isMobile ? 150 : 250}
          renderItem={renderItem}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          initialRenderCount={INITIAL_LOAD}
          className="mb-8"
        />

        {/* 无内容提示 */}
        {filteredImages.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-white mb-2">No artworks found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>

      {/* 图片详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => {
        if (!open) setSelectedImage(null)
      }}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] bg-black p-0 rounded-2xl border-4 border-[#333] shadow-2xl">
          <DialogTitle style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            {selectedImage?.title || "Image Details"}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
            {/* 图片侧 */}
            <div className="relative bg-black rounded-l-xl overflow-hidden">
              {selectedImage && (
                <>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2
                      className="text-lg md:text-xl font-black text-white mb-1 transform -rotate-1"
                      style={{ textShadow: "2px 2px 0px #333" }}
                    >
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <img
                        src={getProxiedAvatarUrl(selectedImage.authorAvatar)}
                        alt={selectedImage.author}
                        className="w-6 h-6 rounded-full border-2 border-[#444]"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackAvatarUrl(selectedImage.author)
                        }}
                      />
                      <p className="text-[#d4a574] font-bold text-sm">
                        by {selectedImage.author}
                      </p>
                      {selectedImage.isPremium && <Crown className="w-4 h-4 text-[#d4a574]" />}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 详情侧 */}
            <div className="p-6 overflow-y-auto bg-[#0a0a0a]">
              {selectedImage && (
                <>
                  <DialogHeader className="border-b border-[#333] pb-4 mb-4">
                    <DialogTitle className="text-xl font-black text-white">
                      {selectedImage.title}
                    </DialogTitle>
                  </DialogHeader>

                  {/* 统计信息 */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => handleLike(selectedImage.id)}
                      className={`flex items-center space-x-1 transform rotate-1 ${
                        selectedImage.isLiked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                      } font-bold rounded-lg border-2 border-[#444]`}
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Heart className="w-4 h-4" fill={selectedImage.isLiked ? "currentColor" : "none"} />
                      <span>{selectedImage.likes}</span>
                    </Button>

                    <span
                      className="flex items-center text-gray-300 font-bold transform -rotate-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{ boxShadow: "1px 1px 0 #333" }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedImage.comments}
                    </span>

                    <span
                      className="flex items-center text-gray-300 font-bold transform rotate-0.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{ boxShadow: "1px 1px 0 #333" }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedImage.views}
                    </span>

                    <span className="ml-auto text-gray-400 font-bold text-sm transform -rotate-1">
                      {selectedImage.createdAt}
                    </span>
                  </div>

                  {/* 提示词 */}
                  <div className="mb-6 transform rotate-0.5">
                    <h3
                      className="text-white font-black mb-3 transform -rotate-1"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Prompt ✨
                    </h3>
                    <div
                      className="p-4 bg-[#1a1a1a] border-2 border-[#444] shadow-md"
                      style={{
                        borderRadius: "16px",
                        clipPath: "polygon(0% 0%, 100% 2%, 99% 98%, 1% 100%)",
                      }}
                    >
                      <p className="text-gray-200 font-bold text-sm leading-relaxed">
                        "{selectedImage.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="mb-6">
                    <h3
                      className="text-white font-black mb-3 transform rotate-0.5"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Tags 🏷️
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className="bg-[#d4a574] text-black font-black transform rotate-1"
                        style={{ boxShadow: "1px 1px 0 #333" }}
                      >
                        {selectedImage.style}
                      </Badge>
                      {selectedImage.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#1a1a1a] border-2 border-[#444] text-gray-300 font-bold hover:bg-[#2a2a2a]"
                          style={{ transform: `rotate(${(index % 3) - 1}deg)` }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white font-black rounded-xl flex-1 border-2 border-[#666] transform -rotate-0.5 hover:scale-105 transition-all"
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-xl flex-1 transform rotate-0.5 hover:scale-105 transition-all"
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* 评论区域 */}
                  <div>
                    <h3
                      className="text-white font-black mb-4 transform -rotate-0.5"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Comments 💬
                    </h3>

                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {comments.map((comment, index) => (
                        <div
                          key={comment.id}
                          className="bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#444] shadow-md"
                          style={{
                            transform: `rotate(${(index % 3) - 1}deg)`,
                            boxShadow: `${(index % 3) - 1}px ${(index % 2) + 1}px 0 #333`,
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <img
                              src={getProxiedAvatarUrl(comment.authorAvatar)}
                              alt={comment.author}
                              className="w-8 h-8 rounded-full border-2 border-[#444]"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackAvatarUrl(comment.author)
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-white font-black text-sm">
                                    {comment.author}
                                  </span>
                                  <span className="text-gray-400 font-bold text-xs ml-2">
                                    {comment.createdAt}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-200 font-bold text-sm mt-1">
                                {comment.content}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className="text-gray-400 font-bold text-xs">
                                  {comment.likes} likes
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {comments.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}