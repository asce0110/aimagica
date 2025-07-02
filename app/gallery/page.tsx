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
import { useSessionCompat } from "@/components/session-provider"
import { toast } from "sonner"

import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import MagicImage from "@/components/ui/magic-image"
import { getApiEndpoint } from "@/lib/api-config"


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
    url: "/images/examples/magic-forest.svg",
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
    url: "/images/examples/cyber-city.svg",
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
    url: "/images/examples/cat-wizard.svg",
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
  const { data: session, status } = useSessionCompat()
  const [images, setImages] = useState<GalleryImage[]>(galleryImages)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [imageAspectRatios, setImageAspectRatios] = useState<{[key: string]: string}>({})

  // 响应式检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 过滤和搜索逻辑
  const filteredImages = images.filter((image) => {
    const matchesFilter = filter === "all" || image.style.toLowerCase() === filter.toLowerCase()
    const matchesSearch = !searchQuery || 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const handleLike = (imageId: string | number) => {
    setImages(images.map(image => 
      image.id === imageId 
        ? { ...image, isLiked: !image.isLiked, likes: image.isLiked ? image.likes - 1 : image.likes + 1 }
        : image
    ))
    toast.success(images.find(img => img.id === imageId)?.isLiked ? "Removed from favorites" : "Added to favorites!")
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    setImages(images.map(img => 
      img.id === image.id ? { ...img, views: img.views + 1 } : img
    ))
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return
    
    if (status !== "authenticated") {
      toast.error("Please login to comment")
      router.push("/auth/login")
      return
    }

    const comment: Comment = {
      id: comments.length + 1,
      author: session?.user?.name || "Anonymous",
      authorAvatar: getProxiedAvatarUrl(session?.user?.image) || getFallbackAvatarUrl(),
      content: newComment,
      createdAt: "Just now",
      likes: 0,
    }

    setComments([comment, ...comments])
    setNewComment("")
    toast.success("Comment added!")
  }

  const getImageSize = (size: string) => {
    switch (size) {
      case "small": return "col-span-1 row-span-1"
      case "medium": return "col-span-1 row-span-2"
      case "large": return "col-span-2 row-span-2"
      case "vertical": return "col-span-1 row-span-2"
      case "horizontal": return "col-span-2 row-span-1"
      default: return "col-span-1 row-span-1"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎨 AIMAGICA Gallery
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {status === "authenticated" ? (
                <div className="flex items-center space-x-2">
                  <img 
                    src={getProxiedAvatarUrl(session?.user?.image) || getFallbackAvatarUrl()} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border-2 border-purple-300"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {session?.user?.name}
                  </span>
                </div>
              ) : (
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search artworks, artists, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-5 sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
              <TabsTrigger value="cyberpunk">Cyberpunk</TabsTrigger>
              <TabsTrigger value="sci-fi">Sci-Fi</TabsTrigger>
              <TabsTrigger value="watercolor">Art</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Image Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`${getImageSize(image.size)} group cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleImageClick(image)}
              style={{
                transform: `rotate(${image.rotation || 0}deg)`,
              }}
            >
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                {/* Premium Badge */}
                {image.isPremium && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}

                {/* Featured Badge */}
                {image.isFeatured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <MagicImage
                    src={image.url}
                    alt={image.title}
                    fallbackSrc="/placeholder.svg"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(image.id)
                            }}
                          >
                            <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img 
                      src={image.authorAvatar} 
                      alt={image.author}
                      className="w-8 h-8 rounded-full object-cover border-2 border-purple-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                      <p className="text-sm text-gray-500 truncate">by {image.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {image.likes}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {image.views}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {image.comments}
                      </span>
                    </div>
                    <span className="text-xs">{image.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {image.style}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {image.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No artworks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0">
          {selectedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Image */}
              <div className="relative bg-gray-100">
                <MagicImage
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fallbackSrc="/placeholder.svg"
                  className="w-full h-64 lg:h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col max-h-[90vh] lg:max-h-full">
                <DialogTitle className="sr-only">{selectedImage.title}</DialogTitle>
                
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src={selectedImage.authorAvatar} 
                    alt={selectedImage.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedImage.title}</h2>
                    <p className="text-gray-600">by {selectedImage.author}</p>
                    <p className="text-sm text-gray-500">{selectedImage.createdAt}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="text-center">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-sm font-semibold">{selectedImage.likes}</p>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-semibold">{selectedImage.views}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <Download className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-sm font-semibold">{selectedImage.downloads}</p>
                    <p className="text-xs text-gray-500">Downloads</p>
                  </div>
                  <div className="text-center">
                    <MessageCircle className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-sm font-semibold">{selectedImage.comments}</p>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                </div>

                {/* Prompt */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Prompt</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                    "{selectedImage.prompt}"
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mb-6">
                  <Button
                    onClick={() => handleLike(selectedImage.id)}
                    variant={selectedImage.isLiked ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${selectedImage.isLiked ? 'fill-current' : ''}`} />
                    {selectedImage.isLiked ? 'Liked' : 'Like'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
                  
                  {/* Add Comment */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                      />
                      <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 overflow-y-auto max-h-64">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <img 
                          src={comment.authorAvatar} 
                          alt={comment.author}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.createdAt}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button size="sm" variant="ghost" className="p-0 h-auto">
                              <Heart className="w-3 h-3 mr-1" />
                              {comment.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}