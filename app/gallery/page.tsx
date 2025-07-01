"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Download, Star, Crown, Eye, Menu, X, Sparkles, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { toast } from "sonner"

import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import MagicImage from "@/components/ui/magic-image"


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
  size: "small" | "medium" | "large" | "vertical" | "horizontal"
  rotation?: number
}

interface Comment {
  id: number
  author: string
  authorAvatar: string
  content: string
  createdAt: string
  likes: number
  isLiked?: boolean
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: "/placeholder.svg?height=400&width=300&text=Magic+Forest",
    title: "Enchanted Forest",
    author: "DreamWeaver",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=DW",
    likes: 1243,
    comments: 89,
    views: 5678,
    downloads: 432,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "2 days ago",
    prompt: "A magical forest with glowing mushrooms, fairy lights, and mystical creatures hiding among ancient trees",
    style: "Fantasy",
    tags: ["forest", "magic", "fantasy", "glow", "mystical"],
    size: "vertical",
    rotation: 2,
  },
  {
    id: 2,
    url: "/placeholder.svg?height=300&width=400&text=Future+City",
    title: "Neo Tokyo 2099",
    author: "CyberArtist",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=CA",
    likes: 982,
    comments: 56,
    views: 4321,
    downloads: 321,
    isPremium: true,
    isFeatured: false,
    isLiked: true,
    createdAt: "1 week ago",
    prompt: "Futuristic cyberpunk cityscape with neon lights, flying cars, and holographic advertisements",
    style: "Cyberpunk",
    tags: ["cyberpunk", "city", "future", "neon", "scifi"],
    size: "horizontal",
    rotation: -1,
  },
  {
    id: 3,
    url: "/placeholder.svg?height=300&width=300&text=Space+Explorer",
    title: "Space Explorer",
    author: "StarGazer",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=SG",
    likes: 756,
    comments: 42,
    views: 3210,
    downloads: 198,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "3 days ago",
    prompt: "Astronaut exploring an alien planet with strange flora and multiple moons in the sky",
    style: "Sci-Fi",
    tags: ["space", "astronaut", "alien", "planet", "exploration"],
    size: "small",
    rotation: 1.5,
  },
  {
    id: 4,
    url: "/placeholder.svg?height=400&width=400&text=Underwater+Kingdom",
    title: "Atlantis Dreams",
    author: "OceanWhisperer",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=OW",
    likes: 1567,
    comments: 103,
    views: 6789,
    downloads: 543,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "5 days ago",
    prompt: "Underwater kingdom with mermaids, coral palaces, and bioluminescent sea creatures",
    style: "Fantasy",
    tags: ["underwater", "mermaid", "ocean", "kingdom", "fantasy"],
    size: "medium",
    rotation: -2,
  },
  {
    id: 5,
    url: "/placeholder.svg?height=300&width=300&text=Dragon+Rider",
    title: "Dragon Rider",
    author: "MythMaker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=MM",
    likes: 2134,
    comments: 167,
    views: 8765,
    downloads: 876,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "1 day ago",
    prompt: "Warrior riding a majestic dragon over mountain peaks during sunset",
    style: "Fantasy",
    tags: ["dragon", "warrior", "fantasy", "mountains", "epic"],
    size: "small",
    rotation: 3,
  },
  {
    id: 6,
    url: "/placeholder.svg?height=300&width=400&text=Cherry+Blossom",
    title: "Sakura Path",
    author: "ZenArtist",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=ZA",
    likes: 1876,
    comments: 92,
    views: 7654,
    downloads: 654,
    isPremium: false,
    isFeatured: false,
    isLiked: true,
    createdAt: "2 weeks ago",
    prompt: "Japanese garden path with cherry blossoms in full bloom and traditional temple in background",
    style: "Watercolor",
    tags: ["japan", "cherry blossom", "garden", "peaceful", "spring"],
    size: "horizontal",
    rotation: -1.5,
  },
  {
    id: 7,
    url: "/placeholder.svg?height=400&width=300&text=Ancient+Temple",
    title: "Lost Temple",
    author: "AdventureSeeker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=AS",
    likes: 1432,
    comments: 78,
    views: 5432,
    downloads: 432,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "4 days ago",
    prompt: "Ancient temple ruins covered in jungle vegetation with mysterious glowing symbols",
    style: "Realistic",
    tags: ["temple", "ruins", "jungle", "ancient", "mystery"],
    size: "vertical",
    rotation: 1,
  },
  {
    id: 8,
    url: "/placeholder.svg?height=400&width=400&text=Northern+Lights",
    title: "Aurora Magic",
    author: "NorthernSoul",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=NS",
    likes: 2345,
    comments: 145,
    views: 9876,
    downloads: 765,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "1 week ago",
    prompt: "Spectacular northern lights dancing over a snowy landscape with pine trees and mountains",
    style: "Realistic",
    tags: ["aurora", "northern lights", "winter", "night", "nature"],
    size: "medium",
    rotation: -2.5,
  },
  {
    id: 9,
    url: "/placeholder.svg?height=300&width=300&text=Steampunk+Inventor",
    title: "Clockwork Genius",
    author: "GearMaster",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=GM",
    likes: 876,
    comments: 56,
    views: 3456,
    downloads: 234,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "3 weeks ago",
    prompt: "Steampunk inventor in workshop surrounded by brass gears, steam engines, and mechanical wonders",
    style: "Steampunk",
    tags: ["steampunk", "inventor", "gears", "workshop", "mechanical"],
    size: "small",
    rotation: 2.5,
  },
  {
    id: 10,
    url: "/placeholder.svg?height=300&width=400&text=Floating+Islands",
    title: "Sky Islands",
    author: "CloudWalker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=CW",
    likes: 1654,
    comments: 87,
    views: 6543,
    downloads: 543,
    isPremium: true,
    isFeatured: false,
    isLiked: true,
    createdAt: "6 days ago",
    prompt: "Floating islands in the sky with waterfalls cascading down and airships sailing between them",
    style: "Fantasy",
    tags: ["floating islands", "sky", "fantasy", "waterfalls", "airships"],
    size: "horizontal",
    rotation: -1,
  },
  {
    id: 11,
    url: "/placeholder.svg?height=300&width=300&text=Cat+Wizard",
    title: "Whisker Wizard",
    author: "FeliFancy",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=FF",
    likes: 2876,
    comments: 198,
    views: 9432,
    downloads: 876,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "2 days ago",
    prompt: "Cute cat wearing wizard hat and casting colorful magic spells with a wand",
    style: "Cartoon",
    tags: ["cat", "wizard", "cute", "magic", "spells"],
    size: "small",
    rotation: 3,
  },
  {
    id: 12,
    url: "/placeholder.svg?height=300&width=400&text=Crystal+Cave",
    title: "Crystal Cavern",
    author: "GemHunter",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=GH",
    likes: 1543,
    comments: 76,
    views: 6123,
    downloads: 432,
    isPremium: true,
    isFeatured: false,
    isLiked: false,
    createdAt: "1 week ago",
    prompt: "Magical crystal cave with glowing gems of various colors illuminating the darkness",
    style: "Fantasy",
    tags: ["crystal", "cave", "gems", "glow", "magic"],
    size: "horizontal",
    rotation: -2,
  },
]

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

export default function GalleryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        
        const response = await fetch('/api/gallery/public?limit=50')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gallery images: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          setImages(result.data)
          console.log(`✅ Loaded ${result.data.length} gallery images`)
          
          // 检查URL参数，如果有image参数则自动打开该图片
          const urlParams = new URLSearchParams(window.location.search)
          const imageId = urlParams.get('image')
          if (imageId) {
            const targetImage = result.data.find((img: GalleryImage) => img.id.toString() === imageId)
            if (targetImage) {
              console.log('🔗 Auto-opening shared image:', imageId)
              setSelectedImage(targetImage)
              fetchImageDetails(imageId)
            }
          }
        } else {
          // 如果没有数据，显示静态数据作为备用
          setImages(galleryImages)
          console.log('📝 No real data found, using placeholder images')
        }
      } catch (error) {
        console.error('❌ Error fetching gallery images:', error)
        setError(error instanceof Error ? error.message : 'Failed to load images')
        // 使用静态数据作为备用
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
      const response = await fetch(`/api/gallery/${imageId}`)
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
        downloads: 0, // 暂时设为0，后续可以添加
        isPremium: false,
        isFeatured: false,
        isLiked: imageDetails.isLiked,
        createdAt: imageDetails.createdAt,
        prompt: imageDetails.prompt,
        style: imageDetails.style,
        tags: imageDetails.tags,
        size: originalImage?.size || "medium", // 保持原始size信息，而不是硬编码
        rotation: originalImage?.rotation || Math.random() * 4 - 2 // 保持原始旋转
      }
      
      setSelectedImage(realImageData)
      
      // 🔥 实时更新gallery列表中的浏览量和评论数
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

  const handleLike = async (id: string | number) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
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
                likes: img.isLiked ? img.likes - 1 : img.likes + 1 
              } 
            : img
        )
      )
    }
  }

  const handleCommentLike = async (commentId: number | string) => {
    if (!selectedImage) return

    try {
      const response = await fetch(`/api/gallery/${selectedImage.id}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to toggle comment like')
      }

      const result = await response.json()
      
      if (result.success) {
        // 更新评论的点赞状态
        setComments((prev) =>
          prev.map((comment) => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  likes: result.liked ? comment.likes + 1 : comment.likes - 1,
                  isLiked: result.liked
                } 
              : comment
          )
        )
        
        console.log('✅ Comment like toggled successfully')
      }
      
    } catch (error) {
      console.error('❌ Error toggling comment like:', error)
      
      // 如果请求失败，仍然更新本地状态作为临时反馈
      setComments((prev) =>
        prev.map((comment) => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      )
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedImage) return

    try {
      const response = await fetch(`/api/gallery/${selectedImage.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const result = await response.json()
      
      if (result.success) {
        // 添加新评论到列表顶部
        setComments([result.data, ...comments])
        setNewComment("")
        
        // 更新选中图片的评论数量
        if (selectedImage) {
          setSelectedImage(prev => prev ? {
            ...prev,
            comments: prev.comments + 1
          } : null)
        }
        
        // 🔥 实时更新gallery列表中的评论数量
        if (selectedImage) {
          setImages((prev) =>
            prev.map((img) =>
              img.id.toString() === selectedImage.id.toString()
                ? { ...img, comments: img.comments + 1 } 
                : img
            )
          )
        }
        
        console.log('✅ Comment added successfully and updated gallery list')
      }
      
    } catch (error) {
      console.error('❌ Error adding comment:', error)
      
      // 如果请求失败，仍然添加到本地状态作为临时反馈
      const newCommentObj: Comment = {
        id: Date.now(),
        author: session?.user?.name || "Anonymous",
        authorAvatar: session?.user?.image || "/placeholder.svg?height=40&width=40&text=A",
        content: newComment,
        createdAt: "Just now",
        likes: 0,
      }

      setComments([newCommentObj, ...comments])
      setNewComment("")
    }
  }

  const handleShare = async () => {
    if (!selectedImage) return

    try {
      // 构建分享URL
      const shareUrl = `${window.location.origin}/gallery?image=${selectedImage.id}`
      const shareText = `Check out this amazing AI artwork: "${selectedImage.title}" by ${selectedImage.author} - Created with AIMAGICA`

      // 检查是否支持Web Share API
      if (navigator.share) {
        await navigator.share({
          title: selectedImage.title,
          text: shareText,
          url: shareUrl
        })
        toast.success("Shared successfully!")
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      console.error('Error sharing:', error)
             // 如果分享失败，尝试复制链接
       try {
         const shareUrl = `${window.location.origin}/gallery?image=${selectedImage.id}`
         await navigator.clipboard.writeText(shareUrl)
         toast.success("Link copied to clipboard!")
       } catch (clipboardError) {
         toast.error("Failed to share or copy link")
       }
    }
  }

  const handleDownload = async () => {
    if (!selectedImage) return

    try {
      toast.info("Starting download...")
      
      // 获取图片
      const response = await fetch(selectedImage.url)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 生成文件名
      const fileName = `aimagica-${selectedImage.style.toLowerCase().replace(/\s+/g, '-')}-${selectedImage.id}.jpg`
      link.download = fileName
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      window.URL.revokeObjectURL(url)
      
      toast.success("Download completed!")
      
      // 更新下载计数（可选）
      setSelectedImage(prev => prev ? {
        ...prev,
        downloads: prev.downloads + 1
      } : null)
      
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error("Failed to download image")
    }
  }

  const filteredImages = images.filter((img) => {
    const matchesFilter =
      filter === "all" || (filter === "featured" && img.isFeatured) || img.style.toLowerCase() === filter.toLowerCase()

    const matchesSearch = searchQuery
      ? img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    return matchesFilter && matchesSearch
  })

  // 随机生成一个偏移量，用于创造不规则的布局
  const getRandomOffset = () => {
    return Math.floor(Math.random() * 20) - 10
  }

  // 动态获取图片真实比例
  const getImageAspectRatio = (imageUrl: string, imageId: string | number): string => {
    // 如果已经缓存了比例，直接返回
    if (imageAspectRatios[imageId.toString()]) {
      return imageAspectRatios[imageId.toString()]
    }

    // 创建图片对象获取真实尺寸
    const img = new Image()
    img.crossOrigin = "anonymous" // 避免跨域问题
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      let cssAspectRatio: string

      // 更精确的比例判断
      if (aspectRatio > 1.6) {
        // 超宽图：如16:9等
        cssAspectRatio = "16/9"
      } else if (aspectRatio > 1.25) {
        // 横图：如4:3等
        cssAspectRatio = "4/3"
      } else if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
        // 正方形：如1:1等
        cssAspectRatio = "1/1"
      } else if (aspectRatio > 0.75) {
        // 稍高：如4:5等
        cssAspectRatio = "4/5"
      } else if (aspectRatio > 0.5) {
        // 竖图：如3:4等
        cssAspectRatio = "3/4"
      } else {
        // 超高图：如9:16等
        cssAspectRatio = "9/16"
      }

      console.log(`图片 ${imageId} 真实比例: ${aspectRatio.toFixed(2)} -> CSS比例: ${cssAspectRatio}`)
      
      setImageAspectRatios(prev => ({
        ...prev,
        [imageId.toString()]: cssAspectRatio
      }))
    }
    img.onerror = () => {
      console.warn(`图片 ${imageId} 加载失败，使用默认比例`)
    }
    img.src = imageUrl

    // 返回默认比例，等待真实比例加载
    return "4/5"
  }

  return (
    <div className="min-h-screen bg-black">

      {/* 导航栏 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333]">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo和品牌 */}
            <div
              className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <img
                  src="/images/aimagica-logo.png"
                  alt="AIMAGICA"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl font-black text-white transform -rotate-1"
                  style={{
                    fontFamily: "Comic Sans MS, cursive",
                    textShadow: "2px 2px 0px #333",
                  }}
                >
                  AIMAGICA
                </h1>
                <p
                  className="text-xs text-gray-400 transform rotate-1"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  Magic Gallery ✨
                </p>
              </div>
            </div>

            {/* 桌面导航菜单 */}
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                HOME 🏠
              </Button>

              <Button
                variant="ghost"
                className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all border-b-2 border-[#d4a574]"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                GALLERY 🖼️
              </Button>

              <Button
                onClick={() => router.push("/video-creation")}
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                VIDEO STUDIO 🎬
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                LEARN 📚
              </Button>
            </nav>

            {/* PRO按钮和移动菜单 */}
            <div className="flex items-center space-x-3">
              <Button
                className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black px-3 py-2 rounded-xl shadow-lg transform rotate-1 hover:rotate-0 transition-all text-xs md:text-sm"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                PRO
              </Button>

              {/* 移动菜单按钮 */}
              <Button
                onClick={() => setIsMobile(!isMobile)}
                variant="ghost"
                className="md:hidden text-white hover:bg-white/10 p-2 rounded-xl"
              >
                {isMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* 移动导航菜单 */}
          {isMobile && (
            <div className="md:hidden mt-4 p-4 bg-[#1a1a1a] rounded-xl border-2 border-[#333] shadow-lg">
              <nav className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    router.push("/")
                    setIsMobile(false)
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  HOME 🏠
                </Button>

                <Button
                  variant="ghost"
                  className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all border-l-4 border-[#d4a574]"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  GALLERY 🖼️
                </Button>

                <Button
                  onClick={() => {
                    router.push("/video-creation")
                    setIsMobile(false)
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  VIDEO STUDIO 🎬
                </Button>

                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Star className="w-4 h-4 mr-3" />
                  LEARN 📚
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* 搜索和过滤器 - 有意设计得不那么整齐 */}
        <div className="mb-8 flex flex-wrap gap-4 items-start">
          {/* 搜索框 - 稍微倾斜 */}
          <div
            className="relative flex-1 min-w-[200px] max-w-md transform -rotate-1"
            style={{ boxShadow: "3px 3px 0 #333" }}
          >
            <Input
              placeholder="Search magical creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-xl font-bold pl-4 pr-10"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#d4a574]">✨</div>
          </div>

          {/* 过滤器标签 - 每个标签都有不同的旋转角度 */}
          <Tabs value={filter} onValueChange={setFilter} className="flex-1 min-w-[200px]">
            <TabsList className="bg-[#1a1a1a] border-2 border-[#444] rounded-xl p-1 flex flex-wrap gap-1">
              <TabsTrigger
                value="all"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                All Magic
              </TabsTrigger>
              <TabsTrigger
                value="featured"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Featured ⭐
              </TabsTrigger>
              <TabsTrigger
                value="fantasy"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Fantasy 🧙‍♂️
              </TabsTrigger>
              <TabsTrigger
                value="cyberpunk"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Cyberpunk 🤖
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin"></div>
            <p 
              className="text-[#d4a574] font-bold text-lg"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Loading amazing artworks... ✨
            </p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">😞</span>
            </div>
            <p 
              className="text-red-400 font-bold text-lg mb-2"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Oops! Something went wrong
            </p>
            <p 
              className="text-gray-400 text-sm"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              {error}
            </p>
          </div>
        )}

        {/* 无数据状态 */}
        {!loading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4a574]/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <p 
              className="text-[#d4a574] font-bold text-lg mb-2"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              No artworks found
            </p>
            <p 
              className="text-gray-400 text-sm"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Be the first to share your amazing creation!
            </p>
          </div>
        )}

        {/* 画廊 - 瀑布流布局，图片按真实比例显示，边框宽度一致 */}
        {!loading && filteredImages.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-5 xl:columns-5 gap-4 md:gap-6">
            {filteredImages.map((image, index) => {
            // 为每个图片生成随机的旋转角度
            const rotation = image.rotation || Math.random() * 4 - 2

            return (
              <motion.div
                key={image.id}
                className="break-inside-avoid mb-4 relative cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => fetchImageDetails(image.id)}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  zIndex: index % 3 === 0 ? 2 : 1, // 交错的z-index创造层叠感
                }}
                whileHover={{
                  scale: 1.03,
                  zIndex: 10,
                  rotate: 0, // 悬停时回正
                  transition: { duration: 0.2 },
                }}
              >
                {/* 图片卡片 - 不规则的边框和阴影 */}
                <div
                  className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden border-2 border-[#333] hover:border-[#d4a574] transition-all cursor-pointer shadow-lg hover:shadow-xl"
                  onClick={() => fetchImageDetails(image.id)}
                  style={{
                    aspectRatio: getImageAspectRatio(image.url, image.id),
                    width: "100%",
                    height: "auto", // 让高度根据宽高比自动调整
                  }}
                >
                  {/* 图片容器 - 统一白边框宽度 */}
                  <div className="w-full h-full relative bg-white rounded-md p-1">
                    <div className="w-full h-full bg-white rounded-sm overflow-hidden">
                      <MagicImage
                        src={image.url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full"
                        objectFit="contain"
                        loadingMessage="Loading artwork..."
                      />
                    </div>
                  </div>

                  {/* 悬停覆盖层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                    <h3
                      className="text-white font-bold text-sm mb-1 transform rotate-0.5"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      {image.title}
                    </h3>
                    <p
                      className="text-gray-300 text-xs transform -rotate-0.5"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      by {image.author}
                    </p>
                  </div>

                  {/* 装饰元素 - 随机位置的小圆点 */}
                  <div
                    className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#d4a574] z-20"
                    style={{
                      top: `${5 + ((index * 7) % 15)}%`,
                      right: `${5 + ((index * 11) % 15)}%`,
                      opacity: 0.7,
                    }}
                  ></div>

                  {/* 精选标记 - 不规则位置 */}
                  {image.isFeatured && (
                    <div
                      className="absolute top-2 right-2 md:top-3 md:right-3 transform rotate-12 bg-[#d4a574] rounded-full p-1 md:p-1.5 shadow-lg z-20"
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Star className="w-2 h-2 md:w-3 md:h-3 text-black fill-black" />
                    </div>
                  )}

                  {/* 喜欢标记 */}
                  {image.isLiked && (
                    <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 transform -rotate-6 z-20">
                      <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-red-500" />
                    </div>
                  )}

                  {/* 高级标记 */}
                  {image.isPremium && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 transform -rotate-12 z-20">
                      <Crown className="w-3 h-3 md:w-4 md:h-4 text-[#d4a574]" />
                    </div>
                  )}
                </div>

                {/* 图片下方的互动信息 - 稍微倾斜 */}
                <div
                  className="mt-2 flex justify-between items-center px-1"
                  style={{ transform: `rotate(${rotation / 3}deg)` }}
                >
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-0.5" />
                      {image.likes > 1000 ? `${(image.likes / 1000).toFixed(1)}k` : image.likes}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-0.5" />
                      {image.views > 1000 ? `${(image.views / 1000).toFixed(1)}k` : image.views}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                    {image.createdAt}
                  </span>
                </div>
              </motion.div>
            )
          })}
          </div>
        )}

        {/* 加载更多按钮 - 不规则形状 */}
        {!loading && filteredImages.length > 0 && (
          <div className="text-center mt-12">
            <Button
              className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black px-8 py-3 rounded-xl shadow-lg transform rotate-1 hover:rotate-0 transition-all"
              style={{
                fontFamily: "Comic Sans MS, cursive",
                boxShadow: "4px 4px 0 #333",
                clipPath: "polygon(0% 0%, 100% 5%, 98% 100%, 2% 95%)",
              }}
            >
              Load More Magic ✨
            </Button>
          </div>
        )}
      </div>

      {/* 图片详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => {
        if (!open) {
          setSelectedImage(null)
          // 清理URL参数
          const url = new URL(window.location.href)
          url.searchParams.delete('image')
          window.history.replaceState({}, '', url.toString())
        }
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
                  <MagicImage
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.title}
                    className="w-full h-full"
                    objectFit="contain"
                    loadingMessage="Loading masterpiece..."
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2
                      className="text-lg md:text-xl font-black text-white mb-1 transform -rotate-1"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "2px 2px 0px #333",
                      }}
                    >
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <img
                        src={getProxiedAvatarUrl(selectedImage.authorAvatar)}
                        alt={selectedImage.author}
                        className="w-6 h-6 rounded-full border-2 border-[#444]"
                        onError={(e) => {
                          console.error('🖼️ 图片作者头像加载失败:', selectedImage.authorAvatar, selectedImage.author);
                          e.currentTarget.src = getFallbackAvatarUrl(selectedImage.author);
                        }}
                        onLoad={() => {
                          console.log('✅ 图片作者头像加载成功:', selectedImage.authorAvatar, selectedImage.author);
                        }}
                      />
                      <p className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                        by {selectedImage.author}
                      </p>
                      {selectedImage.isPremium && <Crown className="w-4 h-4 text-[#d4a574]" />}
                    </div>
                  </div>

                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#d4a574] opacity-50 transform rotate-12"></div>
                  <div className="absolute bottom-20 left-4 w-4 h-4 rounded-full bg-[#d4a574] opacity-30 transform -rotate-12"></div>
                </>
              )}
            </div>

            {/* 详情侧 */}
            <div className="p-6 overflow-y-auto bg-[#0a0a0a]">
              {selectedImage && (
                <>
                  {/* 统计信息 - 不规则排列 */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => selectedImage && handleLike(selectedImage.id)}
                      className={`flex items-center space-x-1 transform rotate-1 ${
                        selectedImage.isLiked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                      } font-bold rounded-lg border-2 border-[#444]`}
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Heart className="w-4 h-4" fill={selectedImage.isLiked ? "currentColor" : "none"} />
                      <span>{selectedImage.likes}</span>
                    </Button>

                    <span
                      className="flex items-center text-gray-300 font-bold transform -rotate-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "1px 1px 0 #333",
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedImage.comments}
                    </span>

                    <span
                      className="flex items-center text-gray-300 font-bold transform rotate-0.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "1px 1px 0 #333",
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedImage.views}
                    </span>

                    <span
                      className="ml-auto text-gray-400 font-bold text-sm transform -rotate-1"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      {selectedImage.createdAt}
                    </span>
                  </div>

                  {/* 提示词 - 不规则边框 */}
                  <div className="mb-6 transform rotate-0.5">
                    <h3
                      className="text-white font-black mb-3 transform -rotate-1"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
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
                      <p
                        className="text-gray-200 font-bold text-sm leading-relaxed"
                        style={{ fontFamily: "Comic Sans MS, cursive" }}
                      >
                        "{selectedImage.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* 标签 - 不规则排列 */}
                  <div className="mb-6">
                    <h3
                      className="text-white font-black mb-3 transform rotate-0.5"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
                    >
                      Magic Tags 🏷️
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className="bg-[#d4a574] text-black font-black transform rotate-1"
                        style={{
                          fontFamily: "Comic Sans MS, cursive",
                          boxShadow: "1px 1px 0 #333",
                        }}
                      >
                        {selectedImage.style}
                      </Badge>
                      {selectedImage.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#1a1a1a] border-2 border-[#444] text-gray-300 font-bold hover:bg-[#2a2a2a]"
                          style={{
                            fontFamily: "Comic Sans MS, cursive",
                            transform: `rotate(${(index % 3) - 1}deg)`,
                          }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 - 不规则形状 */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={handleShare}
                      className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white font-black rounded-xl flex-1 border-2 border-[#666] transform -rotate-0.5 hover:scale-105 transition-all"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-xl flex-1 transform rotate-0.5 hover:scale-105 transition-all"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* 评论区域 */}
                  <div>
                    <h3
                      className="text-white font-black mb-4 transform -rotate-0.5"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
                    >
                      Magic Comments 💬
                    </h3>

                    {/* 添加评论 */}
                    <div className="flex space-x-3 mb-4">
                      <img
                        src={session?.user?.image || "/placeholder.svg?height=40&width=40&text=A"}
                        alt="Your Avatar"
                        className="w-8 h-8 rounded-full border-2 border-[#444] transform rotate-3"
                      />
                      <div className="flex-1 flex transform -rotate-0.5">
                        <Input
                          placeholder="Add your magical comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-l-xl font-bold"
                          style={{ fontFamily: "Comic Sans MS, cursive" }}
                        />
                        <Button
                          onClick={handleAddComment}
                          className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-r-xl"
                          style={{
                            fontFamily: "Comic Sans MS, cursive",
                            boxShadow: "2px 2px 0 #333",
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    </div>

                    {/* 评论列表 - 每个评论有不同的旋转角度 */}
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {comments.map((comment, index) => {
                        console.log('🔍 渲染评论:', { 
                          id: comment.id, 
                          author: comment.author, 
                          authorAvatar: comment.authorAvatar 
                        });
                        return (
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
                                console.error('🖼️ 评论头像加载失败:', comment.authorAvatar, comment.author);
                                e.currentTarget.src = getFallbackAvatarUrl(comment.author);
                              }}
                              onLoad={() => {
                                console.log('✅ 评论头像加载成功:', comment.authorAvatar, comment.author);
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span
                                    className="text-white font-black text-sm"
                                    style={{ fontFamily: "Comic Sans MS, cursive" }}
                                  >
                                    {comment.author}
                                  </span>
                                  <span
                                    className="text-gray-400 font-bold text-xs ml-2"
                                    style={{ fontFamily: "Comic Sans MS, cursive" }}
                                  >
                                    {comment.createdAt}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCommentLike(comment.id)}
                                  className={`h-6 w-6 p-0 hover:bg-transparent ${
                                    comment.isLiked
                                      ? "text-red-500 hover:text-red-600"
                                      : "text-gray-400 hover:text-red-400"
                                  }`}
                                >
                                  <Heart 
                                    className="w-3 h-3" 
                                    fill={comment.isLiked ? "currentColor" : "none"} 
                                  />
                                </Button>
                              </div>
                              <p
                                className="text-gray-200 font-bold text-sm mt-1"
                                style={{ fontFamily: "Comic Sans MS, cursive" }}
                              >
                                {comment.content}
                              </p>
                              <div className="flex items-center mt-2">
                                <span
                                  className="text-gray-400 font-bold text-xs"
                                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                                >
                                  {comment.likes} likes
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
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
