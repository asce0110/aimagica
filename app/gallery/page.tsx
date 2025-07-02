"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  Download, 
  Share2, 
  Search, 
  Filter, 
  Eye, 
  MessageCircle,
  User,
  Star,
  Crown,
  Send,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  Palette,
  Camera,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import MagicImage from "@/components/ui/magic-image"
import { getApiEndpoint } from "@/lib/api-config"

// 接口定义
interface GalleryImage {
  id: string | number
  url: string
  title: string
  author: string
  authorAvatar: string
  likes: number
  comments: number
  views: number
  downloads: number
  isPremium: boolean
  isFeatured: boolean
  isLiked: boolean
  createdAt: string
  prompt: string
  style: string
  tags: string[]
  size: "small" | "medium" | "large"
  rotation: number
}

interface Comment {
  id: string | number
  author: string
  authorAvatar: string
  content: string
  likes: number
  isLiked: boolean
  createdAt: string
  replies?: Comment[]
}

// 静态示例数据作为备用
const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: "/images/examples/magic-forest.svg",
    title: "Enchanted Forest",
    author: "MysticArt",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=MA",
    likes: 1234,
    comments: 89,
    views: 5678,
    downloads: 234,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "2 hours ago",
    prompt: "A magical forest with glowing trees, fairy lights, and mystical creatures dancing among the ancient oaks",
    style: "Fantasy",
    tags: ["fantasy", "forest", "magic", "nature", "mystical"],
    size: "large",
    rotation: -1,
  },
  {
    id: 2,
    url: "/images/examples/cyber-city.svg",
    title: "Neo Tokyo 2099",
    author: "CyberDreamer",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=CD",
    likes: 2345,
    comments: 156,
    views: 8901,
    downloads: 456,
    isPremium: true,
    isFeatured: true,
    isLiked: true,
    createdAt: "1 day ago",
    prompt: "Futuristic cyberpunk cityscape with neon lights, flying cars, and towering skyscrapers in a dystopian future",
    style: "Cyberpunk",
    tags: ["cyberpunk", "city", "future", "neon", "technology"],
    size: "medium",
    rotation: 0.5,
  },
  {
    id: 3,
    url: "/images/examples/cat-wizard.svg",
    title: "Whisker Wizard",
    author: "FeliFancy",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=FF",
    likes: 756,
    comments: 42,
    views: 2345,
    downloads: 123,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "3 days ago",
    prompt: "Cute cat wearing wizard hat and casting colorful magic spells with a wand",
    style: "Cartoon",
    tags: ["cat", "wizard", "cute", "magic", "spells"],
    size: "small",
    rotation: 1.5,
  },
  {
    id: 4,
    url: "/images/examples/space-art.svg",
    title: "Space Explorer",
    author: "StarGazer",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=SG",
    likes: 1567,
    comments: 103,
    views: 6789,
    downloads: 543,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "5 days ago",
    prompt: "Astronaut exploring an alien planet with strange flora and multiple moons in the sky",
    style: "Sci-Fi",
    tags: ["space", "astronaut", "alien", "planet", "exploration"],
    size: "medium",
    rotation: -2,
  },
  {
    id: 5,
    url: "/placeholder.svg?height=400&width=400&text=Ocean+Waves",
    title: "Ocean Dreams",
    author: "WaveRider",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=WR",
    likes: 890,
    comments: 67,
    views: 3456,
    downloads: 234,
    isPremium: false,
    isFeatured: false,
    isLiked: true,
    createdAt: "1 week ago",
    prompt: "Serene ocean waves at sunset with dolphins jumping and seagulls flying overhead",
    style: "Art",
    tags: ["ocean", "waves", "sunset", "dolphins", "peaceful"],
    size: "large",
    rotation: 0.8,
  },
  {
    id: 6,
    url: "/placeholder.svg?height=400&width=400&text=Mountain+Vista",
    title: "Mountain Vista",
    author: "PeakSeeker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=PS",
    likes: 445,
    comments: 23,
    views: 1789,
    downloads: 89,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "2 weeks ago",
    prompt: "Majestic mountain landscape with snow-capped peaks, alpine lakes, and golden sunrise",
    style: "Landscape",
    tags: ["mountains", "landscape", "nature", "sunrise", "peaceful"],
    size: "small",
    rotation: -0.3,
  },
]

export default function GalleryPage() {
  const { data: session } = useSession()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [imageAspectRatios, setImageAspectRatios] = useState<{[key: string]: string}>({})

  // 加载画廊图片数据
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiUrl = getApiEndpoint('GALLERY_PUBLIC')
        console.log('🔗 API URL:', apiUrl)
        
        if (!apiUrl) {
          console.error('❌ Gallery API not available - using fallback data')
          setImages(galleryImages)
          setLoading(false)
          return
        }
        
        console.log('📞 Calling API:', `${apiUrl}?limit=50`)
        const response = await fetch(`${apiUrl}?limit=50`)
        
        console.log('📋 Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gallery images: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('📦 API Response:', result)
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          // 将API数据转换为GalleryImage格式
          const transformedImages = result.data.map((item: any, index: number) => ({
            id: item.id || index,
            url: item.url || item.image_url || "/placeholder.svg",
            title: item.title || item.prompt?.substring(0, 50) + "..." || "Untitled",
            author: item.author || item.user_name || "Anonymous",
            authorAvatar: item.authorAvatar || item.user_avatar || "/placeholder.svg?height=50&width=50&text=A",
            likes: item.likes || item.like_count || Math.floor(Math.random() * 1000),
            comments: item.comments || item.comment_count || Math.floor(Math.random() * 100),
            views: item.views || item.view_count || Math.floor(Math.random() * 5000),
            downloads: item.downloads || Math.floor(Math.random() * 500),
            isPremium: item.isPremium || false,
            isFeatured: item.isFeatured || item.is_featured || false,
            isLiked: item.isLiked || item.is_liked || false,
            createdAt: item.createdAt || item.created_at || "Unknown",
            prompt: item.prompt || "No prompt available",
            style: item.style || item.style_name || "Art",
            tags: item.tags || (item.prompt ? item.prompt.split(' ').slice(0, 5) : ["art"]),
            size: ["small", "medium", "large"][Math.floor(Math.random() * 3)] as "small" | "medium" | "large",
            rotation: Math.random() * 4 - 2,
          }))
          
          setImages(transformedImages)
          console.log(`✅ Successfully loaded ${transformedImages.length} real gallery images from API`)
          
          // 检查URL参数，如果有image参数则自动打开该图片
          const urlParams = new URLSearchParams(window.location.search)
          const imageId = urlParams.get('image')
          if (imageId) {
            const targetImage = transformedImages.find((img: GalleryImage) => img.id.toString() === imageId)
            if (targetImage) {
              console.log('🔗 Auto-opening shared image:', imageId)
              setSelectedImage(targetImage)
              fetchImageDetails(imageId)
            }
          }
        } else {
          // 如果API返回空数据或格式错误，显示静态数据作为备用
          console.warn('⚠️ API returned empty or invalid data, using fallback images:', result)
          setImages(galleryImages)
        }
      } catch (error) {
        console.error('❌ Error fetching gallery images:', error)
        setError(`Failed to load real images: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // 使用静态数据作为备用
        console.log('🔄 Using fallback static images due to API error')
        setImages(galleryImages)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 获取图片详细信息
  const fetchImageDetails = async (imageId: string | number) => {
    try {
      const apiUrl = getApiEndpoint('GALLERY_ITEM')
      if (!apiUrl) {
        throw new Error('Gallery API not available')
      }
      
      const response = await fetch(`${apiUrl}/${imageId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch image details')
      }
      const imageDetails = await response.json()
      
      // 更新评论数据
      setComments(imageDetails.commentsData || [])
      
      // 从原始图片列表中获取size信息，避免覆盖
      const originalImage = images.find(img => img.id.toString() === imageId.toString())
      
      // 更新选中的图片信息为真实数据
      const realImageData: GalleryImage = {
        id: imageDetails.id,
        url: imageDetails.url,
        title: imageDetails.title,
        author: imageDetails.author,
        authorAvatar: imageDetails.authorAvatar,
        likes: imageDetails.likes,
        comments: imageDetails.comments,
        views: imageDetails.views,
        downloads: 0,
        isPremium: false,
        isFeatured: false,
        isLiked: imageDetails.isLiked,
        createdAt: imageDetails.createdAt,
        prompt: imageDetails.prompt,
        style: imageDetails.style,
        tags: imageDetails.tags,
        size: originalImage?.size || "medium",
        rotation: originalImage?.rotation || Math.random() * 4 - 2
      }
      
      setSelectedImage(realImageData)
      
      // 实时更新gallery列表中的浏览量和评论数
      setImages((prev) =>
        prev.map((img) =>
          img.id.toString() === imageId.toString()
            ? { 
                ...img, 
                views: imageDetails.views,
                comments: imageDetails.comments,
                likes: imageDetails.likes,
                isLiked: imageDetails.isLiked
              } 
            : img
        )
      )
      
      console.log('✅ Loaded real image details and updated gallery list:', imageDetails)
      
    } catch (error) {
      console.error('❌ Error fetching image details:', error)
      // 如果获取失败，使用原始数据
      const originalImage = images.find(img => img.id === imageId)
      if (originalImage) {
        setSelectedImage(originalImage)
      }
    }
  }

  // 过滤图片
  const filteredImages = images.filter(image => {
    const matchesFilter = filter === "all" || image.style.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    fetchImageDetails(image.id)
  }

  const handleLike = async (id: string | number) => {
    try {
      const apiUrl = getApiEndpoint('GALLERY_ITEM')
      if (!apiUrl) {
        throw new Error('Gallery API not available')
      }
      
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle_like' })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const result = await response.json()
      
      // 更新本地状态
      setImages((prev) =>
        prev.map((img) =>
          img.id === id 
            ? { 
                ...img, 
                isLiked: result.liked, 
                likes: result.liked ? img.likes + 1 : img.likes - 1 
              } 
            : img
        )
      )

      // 如果当前选中的图片就是被点赞的图片，也更新详情页面
      if (selectedImage && selectedImage.id === id) {
        setSelectedImage(prev => prev ? {
          ...prev,
          isLiked: result.liked,
          likes: result.liked ? prev.likes + 1 : prev.likes - 1
        } : null)
      }

      console.log('✅ Like toggled successfully')
      
    } catch (error) {
      console.error('❌ Error toggling like:', error)
      // 如果请求失败，仍然更新本地状态作为临时反馈
      setImages((prev) =>
        prev.map((img) =>
          img.id === id 
            ? { 
                ...img, 
                isLiked: !img.isLiked, 
                likes: !img.isLiked ? img.likes + 1 : img.likes - 1 
              } 
            : img
        )
      )

      if (selectedImage && selectedImage.id === id) {
        setSelectedImage(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likes: !prev.isLiked ? prev.likes + 1 : prev.likes - 1
        } : null)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading amazing artworks... ✨</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* 导航栏 */}
      <motion.nav 
        className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Palette className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AImagica Gallery
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search artworks, artists, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/50 border-white/30 focus:border-purple-300"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 过滤器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Fantasy", "Cyberpunk", "Sci-Fi", "Art"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption.toLowerCase() ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.toLowerCase())}
              className={`transition-all ${
                filter === filterOption.toLowerCase()
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white/50 hover:bg-white/70 border-white/30"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filterOption}
            </Button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <motion.div 
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">⚠️ {error}</p>
            <p className="text-sm mt-1">Showing backup images instead.</p>
          </motion.div>
        )}

        {/* 画廊网格 */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <Card 
                className={`overflow-hidden bg-white/60 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  image.size === "large" ? "sm:col-span-2 sm:row-span-2" : 
                  image.size === "medium" ? "sm:row-span-1" : ""
                }`}
                style={{
                  transform: `rotate(${image.rotation}deg)`,
                  transformOrigin: "center center"
                }}
              >
                <CardContent className="p-0">
                  {/* 图片 */}
                  <div className="relative aspect-square overflow-hidden">
                    <MagicImage
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* 悬停覆盖层 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">View Details</p>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.isFeatured && <Badge variant="secondary" className="text-xs bg-yellow-500/80 text-white"><Star className="h-3 w-3" /></Badge>}
                      {image.isPremium && <Badge variant="secondary" className="text-xs bg-purple-500/80 text-white"><Crown className="h-3 w-3" /></Badge>}
                    </div>

                    {/* 统计信息 */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-white text-xs">
                      <div className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
                        <Heart className="h-3 w-3" />
                        {image.likes}
                      </div>
                      <div className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
                        <MessageCircle className="h-3 w-3" />
                        {image.comments}
                      </div>
                    </div>
                  </div>

                  {/* 图片信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getProxiedAvatarUrl(image.authorAvatar)} />
                        <AvatarFallback className="text-xs">{image.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 truncate">{image.author}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{image.createdAt}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {image.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 图片详情弹窗 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          {selectedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* 图片展示 */}
              <div className="relative bg-gray-100">
                <MagicImage
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 详情内容 */}
              <div className="flex flex-col h-full max-h-[90vh] lg:max-h-none">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle className="text-xl font-bold">{selectedImage.title}</DialogTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getProxiedAvatarUrl(selectedImage.authorAvatar)} />
                      <AvatarFallback>{selectedImage.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{selectedImage.author}</p>
                      <p className="text-sm text-gray-500">{selectedImage.createdAt}</p>
                    </div>
                  </div>
                </DialogHeader>

                {/* 统计和操作 */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {selectedImage.likes.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {selectedImage.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {selectedImage.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {selectedImage.downloads}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant={selectedImage.isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLike(selectedImage.id)}
                      className={selectedImage.isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${selectedImage.isLiked ? 'fill-current' : ''}`} />
                      {selectedImage.isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Prompt</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedImage.prompt}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Style</h4>
                      <Badge variant="secondary">{selectedImage.style}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 评论区域 */}
                <div className="flex-1 overflow-y-auto p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Comments ({comments.length})</h4>
                  
                  {/* 新评论输入 */}
                  {session && (
                    <div className="flex gap-3 mb-6">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getProxiedAvatarUrl(session?.user?.image)} />
                        <AvatarFallback>{session?.user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm" disabled={!newComment.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 评论列表 */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getProxiedAvatarUrl(comment.authorAvatar)} />
                          <AvatarFallback>{comment.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">{comment.createdAt}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Reply
                            </Button>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}