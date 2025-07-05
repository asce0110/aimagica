"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarContent, AvatarImage } from "../../../components/ui/avatar"
import { useSessionCompat as useSession, signOutCompat as signOut } from "../../../components/session-provider"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  Users, 
  ImageIcon, 
  Star, 
  TrendingUp, 
  Crown, 
  Shield, 
  Sparkles, 
  Wand2, 
  Settings, 
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Filter,
  Copy,
  MoreHorizontal,
  Calendar,
  Activity,
  DollarSign,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Palette,
  Mail,
  Bell,
  User,
  Lock,
  Clock,
  CreditCard,
  Coins
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense } from "react"
import ApiConfigForm from "@/components/admin/api-config-form"
import StyleForm from "@/components/admin/style-form"
import UserInfoDebug from "@/components/debug/UserInfoDebug"

// 真实数据状态管理
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  premiumUsers: number
  totalImages: number
  imagesThisMonth: number
  revenue: number
  revenueGrowth: number
  userImages?: number
  userViews?: number
  userLikes?: number
  userFollowers?: number
}

interface DashboardUser {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  created_at: string
  subscription_tier: string
  subscription_status: string
  image_count: number
}

interface DashboardImage {
  id: string
  title: string
  user_name: string
  created_at: string
  view_count: number
  like_count: number
  style: string
  status: string
}

interface ApiConfig {
  id: string
  name: string
  type: 'image_generation' | 'video_generation'
  provider: string
  base_url: string
  api_key: string
  model: string
  endpoint: string
  priority: number
  is_default: boolean
  is_active: boolean
  max_retries: number
  timeout_seconds: number
  rate_limit_per_minute: number
  last_used_at: string | null
  last_success_at: string | null
  last_error_at: string | null
  last_error_message: string | null
  success_count: number
  error_count: number
  config_data: any
  created_at: string
  updated_at: string
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user')
  const [isRoleChecked, setIsRoleChecked] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    premiumUsers: 0,
    totalImages: 0,
    imagesThisMonth: 0,
    revenue: 0,
    revenueGrowth: 0,
    userImages: 0,
    userViews: 0,
    userLikes: 0,
    userFollowers: 0
  })
  const [recentUsers, setRecentUsers] = useState<DashboardUser[]>([])
  const [recentImages, setRecentImages] = useState<DashboardImage[]>([])
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([])
  const [selectedApiType, setSelectedApiType] = useState<'image_generation' | 'video_generation'>('image_generation')
  const [showAddApiForm, setShowAddApiForm] = useState(false)
  const [editingApiConfig, setEditingApiConfig] = useState<ApiConfig | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApiConfigsLoading, setIsApiConfigsLoading] = useState(false)
  const [styles, setStyles] = useState<any[]>([])
  const [isStylesLoading, setIsStylesLoading] = useState(false)
  const [hasInitiallyLoadedStyles, setHasInitiallyLoadedStyles] = useState(false)
  const [showAddStyleForm, setShowAddStyleForm] = useState(false)
  const [editingStyle, setEditingStyle] = useState<any | null>(null)
  
  // 图片管理相关状态
  const [adminImages, setAdminImages] = useState<any[]>([])
  const [isImagesLoading, setIsImagesLoading] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageSearchTerm, setImageSearchTerm] = useState('')
  const [imageFilter, setImageFilter] = useState('all')
  const [imagesOffset, setImagesOffset] = useState(0)
  const [hasMoreImages, setHasMoreImages] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [featuredImages, setFeaturedImages] = useState<Set<string>>(new Set())
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    prompt: '',
    style: '',
    isPublic: false
  })
  
  // 编辑图片相关状态
  const [editingImage, setEditingImage] = useState<any | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({
    prompt: '',
    style: '',
    is_public: false,
    status: 'completed' as 'pending' | 'processing' | 'completed' | 'failed'
  })
  const [isEditing, setIsEditing] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
    
    // 如果加载完成且用户未登录，重定向到登录页
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    

    
    // 检查URL参数设置用户角色
    const role = searchParams.get('role')
    if (role === 'user') {
      setUserRole('user')
      setIsRoleChecked(true)
      return
    }
    
    // 如果用户已登录，直接使用session中的管理员状态
    if (session?.user?.email) {
      console.log('🔍 检查用户session权限:', {
        email: session.user.email,
        isAdmin: session.user.isAdmin
      })
      
      if (session.user.isAdmin) {
        console.log('✅ Session中确认为管理员，设置userRole为admin')
        setUserRole('admin')
      } else {
        console.log('❌ Session中确认为普通用户，设置userRole为user')
        setUserRole('user')
      }
      setIsRoleChecked(true)
    }
  }, [searchParams, session, status, router])

  // 临时管理员覆盖 - 用于调试
  useEffect(() => {
    // 如果URL包含 ?admin=true，强制设置为管理员
    if (searchParams.get('admin') === 'true') {
      console.log('🔧 临时管理员覆盖激活')
      setUserRole('admin')
      setIsRoleChecked(true)
    }
  }, [searchParams])



  // 监听activeTab变化，当切换到styles标签页时自动加载数据
  useEffect(() => {
    if (activeTab === 'styles' && userRole === 'admin' && session?.user?.email) {
      console.log('🎯 切换到styles标签页')
      // 只有在没有加载过或者styles为空时才加载
      if (!hasInitiallyLoadedStyles || styles.length === 0) {
        console.log('🔄 首次加载或数据为空，开始加载styles数据')
        loadStyles()
      } else {
        console.log('✅ Styles数据已存在，跳过重复加载')
      }
    }
  }, [activeTab, userRole, session, hasInitiallyLoadedStyles, styles.length])

  // 监听activeTab变化，当切换到api-configs标签页时自动加载数据
  useEffect(() => {
    if (activeTab === 'api-configs' && userRole === 'admin' && session?.user?.email) {
      console.log('🎯 切换到api-configs标签页')
      // 如果API配置为空，则加载数据
      if (apiConfigs.length === 0 && !isApiConfigsLoading) {
        console.log('🔄 首次加载或数据为空，开始加载API配置数据')
        loadApiConfigs()
      } else {
        console.log('✅ API配置数据已存在，跳过重复加载')
      }
    }
  }, [activeTab, userRole, session, apiConfigs.length, isApiConfigsLoading])

  // 加载API配置数据
  const loadApiConfigs = async () => {
    try {
      setIsApiConfigsLoading(true)
      console.log('🔄 Loading API configurations...')
      
      const apiConfigsResponse = await fetch('/api/admin/api-configs')
      if (apiConfigsResponse.ok) {
        const apiConfigsData = await apiConfigsResponse.json()
        setApiConfigs(apiConfigsData.configs || [])
        console.log('✅ API configurations loaded:', apiConfigsData.configs?.length || 0)
      } else {
        console.error('❌ Failed to load API configurations')
        setApiConfigs([])
      }
    } catch (error) {
      console.error('❌ Error loading API configurations:', error)
      setApiConfigs([])
    } finally {
      setIsApiConfigsLoading(false)
    }
  }

  // 加载风格数据（手动触发，不自动重复）
  const loadStyles = async () => {
    try {
      setIsStylesLoading(true)
      console.log('🔄 Loading styles...')
      console.log('🔍 Session info:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email, 
        userRole 
      })
      
      const stylesResponse = await fetch('/api/admin/styles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('📡 Styles API response:', {
        status: stylesResponse.status,
        statusText: stylesResponse.statusText
      })
      
      if (stylesResponse.ok) {
        const stylesData = await stylesResponse.json()
        console.log('📊 Styles response data:', stylesData)
        setStyles(stylesData.styles || [])
        console.log('✅ Styles loaded successfully:', stylesData.styles?.length || 0)
      } else {
        // 尝试获取错误信息
        let errorData
        try {
          errorData = await stylesResponse.json()
        } catch {
          errorData = await stylesResponse.text()
        }
        
        const errorInfo = {
          status: stylesResponse.status,
          statusText: stylesResponse.statusText,
          error: errorData,
          url: stylesResponse.url
        }
        
        console.error('❌ Failed to load styles:', errorInfo)
        
        // 根据状态码提供具体的错误信息
        if (stylesResponse.status === 401) {
          console.error('🔐 Authentication error: User not logged in')
        } else if (stylesResponse.status === 403) {
          console.error('⛔ Permission error: Admin access required')
        } else if (stylesResponse.status === 500) {
          console.error('💥 Server error: Database or internal error')
        }
        
        setStyles([])
      }
    } catch (error) {
      console.error('❌ Network or parsing error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name
      })
      setStyles([])
    } finally {
      setIsStylesLoading(false)
      setHasInitiallyLoadedStyles(true)
    }
  }

  // 加载仪表板数据
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      console.log('🔄 开始加载Dashboard数据...');
      
      // 加载统计数据 - 添加时间戳防止缓存
      const timestamp = new Date().getTime();
      console.log('🔄 开始请求统计API...');
      
      const statsResponse = await fetch(`/api/dashboard/stats?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log('📊 Stats API响应:', {
        status: statsResponse.status,
        statusText: statsResponse.statusText,
        url: statsResponse.url,
        headers: Object.fromEntries(statsResponse.headers.entries())
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 收到统计数据:', statsData);
        
        // 检查是否是真实数据
        if (statsData.isRealData) {
          console.log('✅ 这是真实数据库数据!');
        } else {
          console.log('⚠️ 这可能是模拟数据!');
        }
        
        if (statsData.stats) {
          console.log('✅ 设置Dashboard统计:', statsData.stats);
          setDashboardStats(statsData.stats)
        } else {
          console.error('⚠️ 统计数据格式错误:', statsData);
        }
      } else {
        // 尝试读取错误响应
        let errorText = '';
        try {
          errorText = await statsResponse.text();
        } catch (e) {
          errorText = '无法读取错误响应';
        }
        console.error('❌ Stats API请求失败:', {
          status: statsResponse.status,
          statusText: statsResponse.statusText,
          errorText: errorText
        });
      }

      // 如果是管理员，加载用户和图片列表
      if (userRole === 'admin') {
        console.log('👤 开始请求用户API...');
        
        // 加载用户列表
        const usersResponse = await fetch('/api/dashboard/users')
        console.log('👤 Users API响应:', {
          status: usersResponse.status,
          statusText: usersResponse.statusText,
          url: usersResponse.url
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          console.log('👤 收到用户数据:', usersData);
          setRecentUsers(usersData.users || [])
        } else {
          let errorText = '';
          try {
            errorText = await usersResponse.text();
          } catch (e) {
            errorText = '无法读取错误响应';
          }
          console.error('❌ Users API请求失败:', {
            status: usersResponse.status,
            statusText: usersResponse.statusText,
            errorText: errorText
          });
        }

        console.log('🖼️ 开始请求图片API...');
        
        // 加载图片列表
        const imagesResponse = await fetch('/api/dashboard/images')
        console.log('🖼️ Images API响应:', {
          status: imagesResponse.status,
          statusText: imagesResponse.statusText,
          url: imagesResponse.url
        });
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json()
          console.log('🖼️ 收到图片数据:', imagesData);
          setRecentImages(imagesData.images || [])
        } else {
          let errorText = '';
          try {
            errorText = await imagesResponse.text();
          } catch (e) {
            errorText = '无法读取错误响应';
          }
          console.error('❌ Images API请求失败:', {
            status: imagesResponse.status,
            statusText: imagesResponse.statusText,
            errorText: errorText
          });
        }

        // 只有在数据为空时才加载API配置和风格数据
        if (apiConfigs.length === 0) {
          loadApiConfigs()
        }
        
        // 注释掉自动加载styles，改为在切换到styles标签页时触发
        // if (styles.length === 0 && !hasInitiallyLoadedStyles) {
        //   loadStyles()
        // }
      }

    } catch (error) {
      console.error('❌ 加载仪表板数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 生成图表数据
  const generateChartData = () => {
    // 使用固定值避免hydration问题
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseUsers = dashboardStats.totalUsers || 0
    const baseImages = dashboardStats.totalImages || 0
    const baseRevenue = dashboardStats.revenue || 0
    
    const chartData = months.map((month, index) => ({
      name: month,
      users: Math.floor(baseUsers * (0.1 + index * 0.05)),
      images: Math.floor(baseImages * (0.08 + index * 0.04)),
      revenue: Math.floor(baseRevenue * (0.12 + index * 0.03))
    }))
    setChartData(chartData)

    // 生成饼图数据
    const pieData = [
      { name: 'Free Users', value: Math.floor(baseUsers * 0.6), color: '#8b7355' },
      { name: 'Pro Users', value: Math.floor(baseUsers * 0.3), color: '#d4a574' },
      { name: 'Wizard Users', value: Math.floor(baseUsers * 0.1), color: '#2d3e2d' },
    ]
    setPieData(pieData)
  }

  // 初始化数据加载 - 只在session和用户角色确定后加载
  useEffect(() => {
    if (session?.user?.email && userRole === 'admin' && isRoleChecked) {
      console.log('✅ 满足条件，开始加载数据');
      console.log('- 用户邮箱:', session.user.email);
      console.log('- 用户角色:', userRole);
      console.log('- 角色检查完成:', isRoleChecked);
      loadDashboardData()
    } else {
      console.log('❌ 不满足数据加载条件:');
      console.log('- 用户邮箱:', session?.user?.email || '无');
      console.log('- 用户角色:', userRole);
      console.log('- 角色检查完成:', isRoleChecked);
    }
  }, [session?.user?.email, userRole, isRoleChecked]) // 使用isRoleChecked而不是isLoading

  // 当dashboardStats更新后生成图表数据
  useEffect(() => {
    if (dashboardStats.totalUsers > 0 || dashboardStats.totalImages > 0) {
      console.log('📈 Dashboard统计数据已更新，生成图表数据:', dashboardStats);
      generateChartData()
    }
  }, [dashboardStats])

  // 当切换到图片管理标签时自动加载图片 - 但只加载一次
  useEffect(() => {
    if (activeTab === 'images' && userRole === 'admin' && adminImages.length === 0 && !isImagesLoading) {
      loadAdminImages(true)
      loadFeaturedStatus()
    }
  }, [activeTab, userRole]) // 保持现有依赖，但增加条件判断

      // Remove auto-refresh to avoid unnecessary loading states
      // Users can update data through manual refresh button

      // Generate fixed decorative elements to avoid hydration issues
  const [magicElements] = useState(() => {
    // Use deterministic values to avoid hydration mismatch
    const fixed = [
      { id: 0, left: 10, top: 20, size: 15, rotation: 45, delay: 0.5 },
      { id: 1, left: 80, top: 10, size: 20, rotation: 90, delay: 1.0 },
      { id: 2, left: 30, top: 70, size: 12, rotation: 180, delay: 1.5 },
      { id: 3, left: 60, top: 40, size: 18, rotation: 270, delay: 0.8 },
      { id: 4, left: 15, top: 85, size: 14, rotation: 30, delay: 1.2 },
      { id: 5, left: 90, top: 60, size: 16, rotation: 120, delay: 0.3 },
      { id: 6, left: 45, top: 15, size: 22, rotation: 200, delay: 1.8 },
      { id: 7, left: 70, top: 90, size: 13, rotation: 315, delay: 0.7 }
    ]
    return fixed
  })

  const handleLogout = async () => {
    try {
      console.log("🚪 开始登出流程...")
      
      // 首先调用我们的登出API来记录登出时间
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("✅ 登出时间记录成功:", result)
      } else {
        console.error("⚠️ 登出时间记录失败，但继续登出")
      }
    } catch (error) {
      console.error("⚠️ 调用登出API失败，但继续登出:", error)
    }
    
    // 然后执行NextAuth的登出
    await signOut({ callbackUrl: '/admin/login' })
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Free': return 'bg-[#8b7355] text-white'
      case 'Pro': return 'bg-[#d4a574] text-[#2d3e2d]'
      case 'Wizard': return 'bg-[#2d3e2d] text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white'
      case 'inactive': return 'bg-gray-500 text-white'
      case 'approved': return 'bg-green-500 text-white'
      case 'pending': return 'bg-yellow-500 text-white'
      case 'rejected': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // 图片管理相关函数
  const loadAdminImages = async (reset = true) => {
    if (reset) {
      setIsImagesLoading(true)
      setImagesOffset(0)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const offset = reset ? 0 : imagesOffset
      const params = new URLSearchParams({
        limit: '12',
        offset: offset.toString(),
        filter: imageFilter,
        search: imageSearchTerm
      })

      const response = await fetch(`/api/admin/images?${params}`)
      const result = await response.json()

      if (result.success) {
        if (reset) {
          setAdminImages(result.data)
        } else {
          setAdminImages(prev => [...prev, ...result.data])
        }
        setHasMoreImages(result.hasMore)
        setImagesOffset(offset + result.data.length)
      } else {
        console.error('Failed to load images:', result.error)
      }
    } catch (error) {
      console.error('Error loading admin images:', error)
    } finally {
      setIsImagesLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleImageSearch = () => {
    loadAdminImages(true)
  }

  const loadMoreImages = () => {
    loadAdminImages(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }))
    }
  }

  const handleImageUpload = async () => {
    if (!uploadForm.file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('title', uploadForm.title)
      formData.append('prompt', uploadForm.prompt)
      formData.append('style', uploadForm.style)
      formData.append('isPublic', uploadForm.isPublic.toString())

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Image uploaded successfully:', result.data)
        // 重置表单
        setUploadForm({
          file: null,
          title: '',
          prompt: '',
          style: 'Admin',
          isPublic: false
        })
        setShowImageUpload(false)
        // 刷新图片列表
        loadAdminImages(true)
      } else {
        console.error('Upload failed:', result.error)
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Upload failed, please try again')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (image: any) => {
    if (!confirm(`Are you sure you want to delete image "${image.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: image.id,
          userId: image.user_id
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Image deleted successfully')
        // 从列表中移除
        setAdminImages(prev => prev.filter(img => img.id !== image.id))
      } else {
        console.error('Delete failed:', result.error)
        alert('Delete failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Delete failed: ${errorMessage}`)
    }
  }

  const handleToggleImagePublic = async (image: any) => {
    try {
      const response = await fetch('/api/admin/images/toggle-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: image.id,
          userId: image.user_id
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Image public status toggled')
        // 更新本地状态
        setAdminImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, is_public: !img.is_public }
            : img
        ))
      } else {
        console.error('Toggle failed:', result.error)
        alert('Toggle status failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error toggling image public status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Operation failed: ${errorMessage}`)
    }
  }

  const handleDownloadImage = async (image: any) => {
    try {
      const response = await fetch(image.generated_image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${image.title}_${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Download failed: ${errorMessage}`)
    }
  }

  // 处理编辑图片
  const handleEditImage = (image: any) => {
    setEditingImage(image)
    setEditForm({
      prompt: image.prompt || '',
      style: image.style || '',
      is_public: image.is_public || false,
      status: image.status || 'completed'
    })
    setShowEditForm(true)
    
    // 如果风格数据未加载，则加载风格数据
    if (styles.length === 0 && userRole === 'admin') {
      console.log('🎨 Loading styles for edit form...')
      loadStyles()
    }
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingImage) return

    setIsEditing(true)
    try {
      const response = await fetch('/api/admin/images/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: editingImage.id,
          ...editForm
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Image updated successfully')
        // 更新本地状态
        setAdminImages(prev => prev.map(img => 
          img.id === editingImage.id 
            ? { ...img, ...editForm, updated_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].split('.')[0] }
            : img
        ))
        // 关闭编辑表单
        setShowEditForm(false)
        setEditingImage(null)
        alert('✅ Image updated successfully!')
      } else {
        console.error('Edit failed:', result.error)
        alert('Edit failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error editing image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Edit failed: ${errorMessage}`)
    } finally {
      setIsEditing(false)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditingImage(null)
    setEditForm({
      prompt: '',
      style: '',
      is_public: false,
      status: 'completed'
    })
  }

  // 批量设置所有图片为公开
  const handleMakeAllPublic = async () => {
    if (!confirm('确定要将所有图片设置为公开状态吗？这个操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch('/api/admin/images/make-all-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ All images made public successfully')
        alert(`✅ 成功将 ${result.updatedCount} 张图片设置为公开状态！`)
        // 刷新图片列表
        loadAdminImages(true)
      } else {
        console.error('Make all public failed:', result.error)
        alert('操作失败: ' + result.error)
      }
    } catch (error) {
      console.error('Error making all images public:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`操作失败: ${errorMessage}`)
    }
  }

  // 诊断图片重复问题
  const handleDiagnoseImages = async () => {
    try {
      const response = await fetch('/api/admin/images/diagnose')
      const result = await response.json()

      if (result.success) {
        const { stats, duplicatesByUrl, duplicatesByIds } = result
        
        let message = `📊 图片诊断结果:\n\n`
        message += `总图片数: ${stats.totalImages}\n`
        message += `公开图片: ${stats.publicImages}\n`
        message += `私有图片: ${stats.privateImages}\n`
        message += `唯一URL数: ${stats.uniqueUrls}\n`
        message += `重复URL数: ${stats.duplicateUrls}\n`
        message += `重复ID数: ${stats.duplicateIds}\n\n`
        
        if (stats.duplicateUrls > 0) {
          message += `⚠️ 发现 ${stats.duplicateUrls} 个重复的图片URL\n`
          message += `这可能导致同一张图片显示多次。\n\n`
          if (duplicatesByUrl.length > 0) {
            message += `示例重复:\n`
            duplicatesByUrl.slice(0, 3).forEach((dup: any, i: number) => {
              message += `${i + 1}. ${dup.count}个相同图片 (${dup.images[0].style})\n`
            })
          }
        } else {
          message += `✅ 没有发现重复的图片URL\n`
        }

        alert(message)
        console.log('📊 诊断结果:', result)
      } else {
        console.error('Diagnose failed:', result.error)
        alert('诊断失败: ' + result.error)
      }
    } catch (error) {
      console.error('Error diagnosing images:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`诊断失败: ${errorMessage}`)
    }
  }

  // 精选功能相关函数
  const handleToggleFeatured = async (image: any) => {
    try {
      const isFeatured = featuredImages.has(image.id)
      
      const response = await fetch('/api/admin/images/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: image.id,
          featured: !isFeatured
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Featured status toggled')
        // 更新本地状态
        setFeaturedImages(prev => {
          const newSet = new Set(prev)
          if (isFeatured) {
            newSet.delete(image.id)
          } else {
            newSet.add(image.id)
          }
          return newSet
        })
      } else {
        console.error('Toggle featured failed:', result.error)
        alert('Toggle featured status failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Operation failed: ${errorMessage}`)
    }
  }

  // 加载精选图片状态
  const loadFeaturedStatus = async () => {
    try {
      const response = await fetch('/api/admin/images/featured')
      const result = await response.json()
      
      if (result.success) {
        setFeaturedImages(new Set(result.data.map((item: any) => item.image_id)))
      }
    } catch (error) {
      console.error('Error loading featured status:', error)
    }
  }

  // 复制API配置功能
  const handleCopyApiConfig = async (config: ApiConfig) => {
    try {
      // 创建复制的配置数据，移除id和一些统计信息
      const copiedConfigData = {
        name: `${config.name} (Copy)`,
        type: config.type,
        provider: config.provider,
        base_url: config.base_url,
        api_key: config.api_key,
        model: config.model,
        endpoint: config.endpoint,
        priority: config.priority + 1, // 优先级降低1
        is_default: false, // 复制的配置不设为默认
        is_active: config.is_active,
        max_retries: config.max_retries,
        timeout_seconds: config.timeout_seconds,
        rate_limit_per_minute: config.rate_limit_per_minute,
        config_data: config.config_data
      }

      const response = await fetch('/api/admin/api-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(copiedConfigData),
      })

      if (response.ok) {
        // 重新加载API配置数据
        await loadApiConfigs()
        alert('✅ API configuration copied successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(`❌ Failed to copy API configuration: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error copying API config:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`❌ Failed to copy API configuration: ${errorMessage}`)
    }
  }

  // 添加调试信息（仅在开发环境）
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔍 Session调试信息:', {
        user: session?.user,
        image: session?.user?.image,
        name: session?.user?.name,
        email: session?.user?.email,
        isAdmin: session?.user?.isAdmin
      })
      console.log('🔍 当前状态:', {
        userRole,
        isRoleChecked,
        isMounted,
        status
      })
    }
  }, [session, userRole, isRoleChecked, isMounted, status])

  // 显示加载状态直到基本信息加载完成
  if (status === 'loading' || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#e8dcc0] to-[#d4a574] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2d3e2d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Loading magical dashboard... ✨
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard min-h-screen bg-[#f5f1e8] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#8b7355]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#2d3e2d]/5 rounded-full blur-2xl"></div>
        
        {/* Floating Magic Elements */}
        {isMounted && magicElements && Array.isArray(magicElements) && magicElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 6 + element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-[#d4a574]/20 to-[#8b7355]/20 rounded-full"
              style={{ transform: `rotate(${element.rotation}deg)` }}
            />
          </motion.div>
        ))}
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10 bg-white/95 backdrop-blur-md border-b-4 border-[#8b7355] p-4 md:p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* 左侧：Logo和标题 */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Home 🏠
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#2d3e2d] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  {userRole === 'admin' ? <Crown className="w-6 h-6 text-[#d4a574]" /> : <User className="w-6 h-6 text-[#d4a574]" />}
                </div>
                <div>
                  <h1
                    className="text-2xl font-black text-[#2d3e2d] transform -rotate-1"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "2px 2px 0px #8b7355",
                    }}
                  >
                    AIMAGICA {userRole === 'admin' ? 'Admin' : 'User'}
                  </h1>
                  <p
                    className="text-sm font-bold text-[#8b7355] transform rotate-1"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {userRole === 'admin' ? 'Master Control Panel 👑' : 'Creative Workspace 🎨'}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧：通知和用户菜单 */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all relative"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              
              {/* User Avatar */}
              {session?.user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-10 h-10 rounded-full border-2 border-[#d4a574] shadow-md"
                        onError={(e) => {
                          console.warn('Avatar loading failed:', session.user.image)
                          e.currentTarget.style.display = 'none'
                          // Show fallback avatar
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                        onLoad={() => {
                          console.log('Avatar loaded successfully:', session.user.image)
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-10 h-10 bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full flex items-center justify-center text-white font-black"
                      style={{ display: session.user.image ? 'none' : 'flex' }}
                    >
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block">
                      <p 
                        className="text-[#2d3e2d] font-black text-sm"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {session.user.name || 'Magic User'}
                      </p>
                      <p 
                        className="text-[#8b7355] font-bold text-xs"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {userRole === 'admin' ? 'Admin' : 'User'} 
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleLogout}
                className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-[#f5f1e8] font-black px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout 👋
              </Button>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#2d3e2d] via-[#8b7355] to-[#d4a574] rounded-3xl border-4 border-[#2d3e2d] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#f5f1e8] rounded-full opacity-80"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4">{userRole === 'admin' ? '👑' : '🎨'}</div>
              <h2
                className="text-3xl md:text-4xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                }}
              >
                Welcome, {session?.user?.name || (userRole === 'admin' ? 'Master Admin' : 'Creative Master')}! ✨
              </h2>
              <p
                className="text-[#f5f1e8] font-bold text-lg opacity-90"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                {userRole === 'admin' 
                  ? 'Manage the magical kingdom of AIMAGICA with your supreme power!' 
                  : 'Track your creative journey and manage your magical artworks!'
                } 🌟
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-8' : 'grid-cols-3'} bg-[#4a5a4a] rounded-2xl p-2 shadow-lg mb-8`}>
            <TabsTrigger
              value="overview"
              className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview 📊
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {userRole === 'admin' ? 'All Images' : 'My Art'} 🎨
            </TabsTrigger>
            {userRole === 'admin' && (
              <>
                <TabsTrigger
                  value="users"
                  className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users 👥
                </TabsTrigger>
                <TabsTrigger
                  value="styles"
                  className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Styles 🎭
                </TabsTrigger>
                <TabsTrigger
                  value="api-configs"
                  className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  API Configs ⚡
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment 💳
                </TabsTrigger>
                <TabsTrigger
                  value="prompts"
                  className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  onClick={() => router.push('/admin/prompts')}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Prompts ✨
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="settings"
              className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings ⚙️
            </TabsTrigger>
          </TabsList>

          {/* Overview Page */}
          <TabsContent value="overview" className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p 
                          className="text-[#8b7355] font-bold text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? 'Total Users' : 'My Images'}
                        </p>
                        <p 
                          className="text-3xl font-black text-[#2d3e2d]"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? (dashboardStats?.totalUsers?.toString() || '0') : (dashboardStats?.userImages?.toString() || '0')}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#8b7355] rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white border-4 border-[#d4a574] rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p 
                          className="text-[#8b7355] font-bold text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? 'Total Images' : 'Total Views'}
                        </p>
                        <p 
                          className="text-3xl font-black text-[#2d3e2d]"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? (dashboardStats?.totalImages || 0).toString() : (dashboardStats?.userViews || 0).toString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#d4a574] rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white border-4 border-[#2d3e2d] rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p 
                          className="text-[#8b7355] font-bold text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? 'Monthly Revenue' : 'Total Likes'}
                        </p>
                        <p 
                          className="text-3xl font-black text-[#2d3e2d]"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? `$${(dashboardStats?.revenue || 0).toString()}` : (dashboardStats?.userLikes || 0).toString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#2d3e2d] rounded-full flex items-center justify-center">
                        {userRole === 'admin' ? (
                          <DollarSign className="w-6 h-6 text-white" />
                        ) : (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white border-4 border-green-500 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p 
                          className="text-[#8b7355] font-bold text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? 'Growth Rate' : 'Followers'}
                        </p>
                        <p 
                          className="text-3xl font-black text-[#2d3e2d]"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {userRole === 'admin' ? `+${dashboardStats.revenueGrowth}%` : dashboardStats.userFollowers?.toString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle 
                      className="text-2xl font-black text-[#2d3e2d] flex items-center"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <BarChart className="w-6 h-6 mr-2" />
                      {userRole === 'admin' ? 'Platform Statistics 📈' : 'My Progress 📊'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey={userRole === 'admin' ? 'users' : 'images'} stroke="#d4a574" strokeWidth={3} />
                        <Line type="monotone" dataKey={userRole === 'admin' ? 'revenue' : 'views'} stroke="#2d3e2d" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 饼图 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white border-4 border-[#d4a574] rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle 
                      className="text-2xl font-black text-[#2d3e2d] flex items-center"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <PieChart className="w-6 h-6 mr-2" />
                      {userRole === 'admin' ? 'User Distribution 🥧' : 'Style Breakdown 🎨'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData && Array.isArray(pieData) && pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* 用户管理页面 - 仅管理员可见 */}
          {userRole === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle 
                        className="text-3xl font-black text-[#2d3e2d] flex items-center"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Users className="w-8 h-8 mr-3" />
                        User Management 👥
                      </CardTitle>
                      <Button
                        className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User ➕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers && Array.isArray(recentUsers) && recentUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-[#f5f1e8] rounded-2xl border-2 border-[#8b7355] hover:border-[#d4a574] transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full flex items-center justify-center text-white font-black">
                              {user.avatar}
                            </div>
                            <div>
                              <h4 
                                className="font-black text-[#2d3e2d]"
                                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                              >
                                {user.name}
                              </h4>
                              <p 
                                className="text-[#8b7355] font-bold text-sm"
                                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                              >
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={getPlanBadgeColor(user.plan)}>
                              {user.plan}
                            </Badge>
                            <Badge className={getStatusBadgeColor(user.status)}>
                              {user.status}
                            </Badge>
                            <span 
                              className="text-[#8b7355] font-bold text-sm"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              {user.images} images
                            </span>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-[#8b7355] hover:text-[#2d3e2d]">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-[#8b7355] hover:text-[#2d3e2d]">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* 图片管理页面 */}
          <TabsContent value="images" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#d4a574] rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle 
                      className="text-3xl font-black text-[#2d3e2d] flex items-center"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <ImageIcon className="w-8 h-8 mr-3" />
                      {userRole === 'admin' ? 'Image Management 🖼️' : 'My Artworks 🎨'}
                    </CardTitle>
                    <div className="flex space-x-3">
                      {userRole === 'admin' && (
                        <>
                          <Button
                            onClick={() => setShowImageUpload(true)}
                            className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-[#f5f1e8] font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image ⬆️
                          </Button>
                          <Button
                            onClick={handleMakeAllPublic}
                            className="bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Make All Public 🌐
                          </Button>
                          <Button
                            onClick={handleDiagnoseImages}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Diagnose 🔍
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={loadAdminImages}
                        variant="outline"
                        className="border-[#8b7355] text-[#8b7355] font-black rounded-2xl"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                                                  Refresh List 🔄
                      </Button>
                    </div>
                  </div>
                  
                  {/* 搜索和筛选 */}
                  <div className="flex space-x-4 mt-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search prompts or styles..."
                        value={imageSearchTerm}
                        onChange={(e) => setImageSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      />
                    </div>
                    <select
                      value={imageFilter}
                      onChange={(e) => setImageFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <option value="all">All Images</option>
                      <option value="public">Public Images</option>
                      <option value="private">Private Images</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="failed">Failed</option>
                    </select>
                    <Button
                      onClick={handleImageSearch}
                      className="bg-[#8b7355] hover:bg-[#6b5a44] text-white font-black rounded-xl px-6"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Search 🔍
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!isMounted ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b7355]"></div>
                      <span className="ml-4 text-[#8b7355] font-bold">Loading...</span>
                    </div>
                  ) : isImagesLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b7355]"></div>
                      <span className="ml-4 text-[#8b7355] font-bold">Loading images...</span>
                    </div>
                  ) : (!adminImages || !Array.isArray(adminImages) || adminImages.length === 0) ? (
                    <div className="text-center py-20">
                      <ImageIcon className="w-16 h-16 text-[#d4a574] mx-auto mb-4" />
                      <p className="text-[#8b7355] font-bold text-lg">No images found</p>
                      <p className="text-[#8b7355] text-sm mt-2">Try adjusting search criteria or upload new images</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {adminImages && Array.isArray(adminImages) && adminImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-[#f5f1e8] rounded-2xl border-2 border-[#d4a574] hover:border-[#8b7355] transition-all overflow-hidden"
                        >
                          {/* 图片预览 */}
                          <div className="relative aspect-square">
                            <img
                              src={image.generated_image_url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png'
                              }}
                            />
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <button
                                onClick={() => handleToggleImagePublic(image)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105 ${
                                  image.is_public 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                                }`}
                                title={`Click to make ${image.is_public ? 'private' : 'public'}`}
                              >
                                {image.is_public ? '🌐 Public' : '🔒 Private'}
                              </button>
                              <Badge className="bg-[#8b7355] text-white text-xs">
                                {image.style}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* 图片信息 */}
                          <div className="p-4">
                            <h4 
                              className="font-black text-[#2d3e2d] text-sm mb-2 line-clamp-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                              title={image.prompt}
                            >
                              {image.title}
                            </h4>
                            <p 
                              className="text-[#8b7355] font-bold text-xs mb-3"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              User: {image.user_name} • {image.created_at}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2 text-[#8b7355] font-bold text-xs">
                                <span className="flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {image.likes_count}
                                </span>
                                {image.render_time && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {image.render_time}s
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(image.generated_image_url, '_blank')}
                                  className="text-[#8b7355] hover:text-[#2d3e2d] p-1 h-8 w-8"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadImage(image)}
                                  className="text-[#8b7355] hover:text-[#2d3e2d] p-1 h-8 w-8"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {userRole === 'admin' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleFeatured(image)}
                                      className={`p-1 h-8 w-8 ${
                                        featuredImages.has(image.id) 
                                          ? 'text-orange-500 hover:text-orange-700' 
                                          : 'text-gray-400 hover:text-orange-500'
                                      }`}
                                      title={featuredImages.has(image.id) ? "Remove from Featured" : "Add to Featured"}
                                    >
                                      <Star className={`w-4 h-4 ${featuredImages.has(image.id) ? 'fill-current' : ''}`} />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditImage(image)}
                                      className="text-yellow-500 hover:text-yellow-700 p-1 h-8 w-8"
                                      title="Edit Image"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteImage(image)}
                                      className="text-red-500 hover:text-red-700 p-1 h-8 w-8"
                                      title="Delete Image"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* 加载更多按钮 */}
                  {adminImages && Array.isArray(adminImages) && adminImages.length > 0 && hasMoreImages && (
                    <div className="text-center mt-6">
                      <Button
                        onClick={loadMoreImages}
                        disabled={isLoadingMore}
                        className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl px-8"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {isLoadingMore ? 'Loading...' : 'Load More 📸'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 图片上传弹窗 */}
            {showImageUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border-4 border-[#d4a574]"
                >
                  <h3 
                    className="text-2xl font-black text-[#2d3e2d] mb-4"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Upload Image 📸
                  </h3>
                  
                  <div className="space-y-4">
                    {/* 文件选择 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Select Image File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      />
                    </div>
                    
                    {/* 标题 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Image Title
                      </label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        placeholder="Enter image title..."
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      />
                    </div>
                    
                    {/* 描述 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Image Description
                      </label>
                      <textarea
                        value={uploadForm.prompt}
                        onChange={(e) => setUploadForm({...uploadForm, prompt: e.target.value})}
                        placeholder="Enter image description..."
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none resize-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      />
                    </div>
                    
                    {/* 样式 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Image Style
                      </label>
                      <select
                        value={uploadForm.style}
                        onChange={(e) => setUploadForm({...uploadForm, style: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Realistic">Realistic</option>
                        <option value="Anime">Anime</option>
                        <option value="Cartoon">Cartoon</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Abstract">Abstract</option>
                      </select>
                    </div>
                    
                    {/* 公开状态 */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={uploadForm.isPublic}
                        onChange={(e) => setUploadForm({...uploadForm, isPublic: e.target.checked})}
                        className="w-4 h-4 text-[#8b7355] border-2 border-[#d4a574] rounded focus:ring-[#8b7355]"
                      />
                      <label
                        htmlFor="isPublic"
                        className="text-sm font-bold text-[#8b7355]"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Share to Gallery
                      </label>
                    </div>
                  </div>
                  
                                              {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      onClick={() => setShowImageUpload(false)}
                      variant="outline"
                      className="border-[#8b7355] text-[#8b7355] font-black rounded-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImageUpload}
                      disabled={isUploading || !uploadForm.file}
                      className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-white font-black rounded-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {isUploading ? 'Uploading...' : 'Upload 📤'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* 图片编辑弹窗 */}
            {showEditForm && editingImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 border-4 border-[#d4a574] max-h-[90vh] overflow-y-auto"
                >
                  <h3 
                    className="text-2xl font-black text-[#2d3e2d] mb-4 flex items-center"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Edit className="w-6 h-6 mr-2" />
                    Edit Image Metadata ✏️
                  </h3>
                  
                  {/* 图片预览 */}
                  <div className="mb-6">
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={editingImage.generated_image_url}
                        alt={editingImage.title}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge className={`${editingImage.is_public ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs`}>
                          {editingImage.is_public ? 'Public' : 'Private'}
                        </Badge>
                        <Badge className="bg-[#8b7355] text-white text-xs">
                          {editingImage.style}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-[#2d3e2d] mt-2">
                      <strong>ID:</strong> {editingImage.id} | 
                      <strong> User:</strong> {editingImage.user_name} | 
                      <strong> Created:</strong> {editingImage.created_at}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* 提示词 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Prompt / Description
                      </label>
                      <textarea
                        value={editForm.prompt}
                        onChange={(e) => setEditForm({...editForm, prompt: e.target.value})}
                        placeholder="Enter image description or prompt..."
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none resize-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      />
                    </div>
                    
                    {/* 风格 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Style
                      </label>
                      <select
                        value={editForm.style}
                        onChange={(e) => setEditForm({...editForm, style: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {/* 数据库风格选项 */}
                        {styles && Array.isArray(styles) && styles.length > 0 ? (
                          styles.map(style => (
                            <option key={style.id} value={style.name}>
                              {style.emoji} {style.name}
                            </option>
                          ))
                        ) : (
                          <>
                            {/* 回退选项，如果数据库风格未加载 */}
                            <option value="Photorealistic">Photorealistic</option>
                            <option value="Art Toy Style">Art Toy Style</option>
                            <option value="Chibi Diorama">Chibi Diorama</option>
                            <option value="Photo Dump Aesthetic">Photo Dump Aesthetic</option>
                            <option value="Hyperrealistic Fur">Hyperrealistic Fur</option>
                            <option value="3D Street Art">3D Street Art</option>
                            <option value="Cyberpunk">Cyberpunk</option>
                            <option value="Realistic">Realistic</option>
                            <option value="Anime">Anime</option>
                            <option value="Cartoon">Cartoon</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Abstract">Abstract</option>
                            <option value="Admin">Admin</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    {/* 状态 */}
                    <div>
                      <label className="block text-sm font-bold text-[#8b7355] mb-2">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                        className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-xl focus:border-[#8b7355] outline-none"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    
                    {/* 公开状态 */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="editIsPublic"
                        checked={editForm.is_public}
                        onChange={(e) => setEditForm({...editForm, is_public: e.target.checked})}
                        className="w-4 h-4 text-[#8b7355] border-2 border-[#d4a574] rounded focus:ring-[#8b7355]"
                      />
                      <label
                        htmlFor="editIsPublic"
                        className="text-sm font-bold text-[#8b7355]"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Public Gallery Visibility
                      </label>
                      {editForm.is_public && (
                        <Badge className="bg-green-500 text-white text-xs">
                          🌐 Public
                        </Badge>
                      )}
                      {!editForm.is_public && (
                        <Badge className="bg-gray-500 text-white text-xs">
                          🔒 Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-[#8b7355] text-[#8b7355] font-black rounded-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isEditing}
                      className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-white font-black rounded-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {isEditing ? 'Saving...' : 'Save Changes 💾'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </TabsContent>

          {/* API Configuration Management - Admin Only */}
          {userRole === 'admin' && (
            <TabsContent value="api-configs" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {!showAddApiForm ? (
                  <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle 
                          className="text-3xl font-black text-[#2d3e2d] flex items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Zap className="w-8 h-8 mr-3" />
                          API Configuration Management ⚡
                        </CardTitle>
                        <div className="flex space-x-3">
                          <Button
                            onClick={loadApiConfigs}
                            variant="outline"
                            className="border-[#8b7355] text-[#8b7355] font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Refresh 🔄
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingApiConfig(null)
                              setShowAddApiForm(true)
                            }}
                            className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add API Config ➕
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-4 mt-4">
                        <Button
                          onClick={() => setSelectedApiType('image_generation')}
                          variant={selectedApiType === 'image_generation' ? 'default' : 'outline'}
                          className="rounded-xl font-black"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                                                      Image Generation 🎨
                        </Button>
                        <Button
                          onClick={() => setSelectedApiType('video_generation')}
                          variant={selectedApiType === 'video_generation' ? 'default' : 'outline'}
                          className="rounded-xl font-black"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                                                      Video Generation 🎬
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 配置列表 - 只有在没有加载时显示 */}
                        {!isApiConfigsLoading && apiConfigs && Array.isArray(apiConfigs) && apiConfigs
                          .filter(config => config.type === selectedApiType)
                          .map((config, index) => (
                          <motion.div
                            key={config.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border-2 border-[#8b7355] rounded-xl bg-[#f5f1e8]/30 hover:bg-[#f5f1e8]/50 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 
                                    className="text-xl font-black text-[#2d3e2d]"
                                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                                  >
                                    {config.name}
                                  </h3>
                                  <Badge 
                                    className={`${config.is_default ? 'bg-[#d4a574]' : 'bg-[#8b7355]'} text-white font-bold`}
                                  >
                                    {config.is_default ? '默认' : `优先级 ${config.priority}`}
                                  </Badge>
                                  <Badge 
                                    className={`${config.is_active ? 'bg-green-500' : 'bg-red-500'} text-white font-bold`}
                                  >
                                    {config.is_active ? '启用' : '禁用'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-bold text-[#8b7355]">Provider:</span>
                                    <p className="text-[#2d3e2d]">{config.provider}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#8b7355]">Model:</span>
                                                                          <p className="text-[#2d3e2d]">{config.model || 'None'}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#8b7355]">Success Rate:</span>
                                    <p className="text-[#2d3e2d]">
                                      {config.success_count + config.error_count > 0 
                                        ? Math.round((config.success_count / (config.success_count + config.error_count)) * 100)
                                        : 0
                                      }% ({config.success_count}/{config.success_count + config.error_count})
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#8b7355]">Last Used:</span>
                                    <p className="text-[#2d3e2d]">
                                      {config.last_used_at 
                                        ? new Date(config.last_used_at).toLocaleDateString()
                                                                                  : 'Never'
                                      }
                                    </p>
                                  </div>
                                </div>

                                {config.last_error_message && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <span className="font-bold text-red-600">Last Error:</span>
                                    <p className="text-red-700 text-sm">{config.last_error_message}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex space-x-2 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[#8b7355] hover:text-[#2d3e2d]"
                                  onClick={() => {
                                    setEditingApiConfig(config)
                                    setShowAddApiForm(true)
                                  }}
                                  title="Edit API Configuration"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={async (e) => {
                                    e.preventDefault()
                                    if (confirm('Are you sure you want to copy this API configuration?')) {
                                      await handleCopyApiConfig(config)
                                    }
                                  }}
                                  title="Copy API Configuration"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={async (e) => {
                                    e.preventDefault()
                                    if (confirm('Are you sure you want to delete this API configuration?')) {
                                      try {
                                        const response = await fetch(`/api/admin/api-configs/${config.id}`, {
                                          method: 'DELETE'
                                        })
                                        if (response.ok) {
                                          // 重新加载配置
                                          await loadApiConfigs()
                                        } else {
                                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                          alert(errorData.error || 'Failed to delete API configuration')
                                        }
                                      } catch (error) {
                                        console.error('Error deleting API config:', error)
                                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                        alert(`Failed to delete API configuration: ${errorMessage}`)
                                      }
                                    }
                                  }}
                                  title="Delete API Configuration"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                                                {/* Loading State */}
                        {isApiConfigsLoading && (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b7355] mx-auto mb-4"></div>
                            <p 
                              className="text-lg font-black text-[#8b7355]"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              Loading API configurations... 🔄
                            </p>
                          </div>
                        )}

                        {/* Empty State - only show when not loading and no data */}
                        {!isApiConfigsLoading && apiConfigs && Array.isArray(apiConfigs) && apiConfigs.filter(config => config.type === selectedApiType).length === 0 && (
                          <div className="text-center py-8">
                            <p 
                              className="text-xl font-black text-[#8b7355] mb-4"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              No {selectedApiType === 'image_generation' ? 'Image' : 'Video'} Generation APIs configured yet! 🚀
                            </p>
                            <p className="text-[#8b7355] mb-4">
                              Add your first API configuration to start generating amazing content.
                            </p>
                            <Button
                              onClick={() => {
                                setEditingApiConfig(null)
                                setShowAddApiForm(true)
                              }}
                              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First API Config ✨
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // 使用API配置表单组件
                  <ApiConfigForm
                    config={editingApiConfig}
                    onSave={async (configData) => {
                      try {
                        const url = editingApiConfig 
                          ? `/api/admin/api-configs/${editingApiConfig.id}`
                          : '/api/admin/api-configs'
                        const method = editingApiConfig ? 'PUT' : 'POST'
                        
                        const response = await fetch(url, {
                          method,
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(configData),
                        })
                        
                        if (response.ok) {
                          // 重新加载API配置数据
                          await loadApiConfigs()
                          // 关闭表单
                          setShowAddApiForm(false)
                          setEditingApiConfig(null)
                          alert(editingApiConfig ? '✅ API configuration updated successfully!' : '✅ API configuration created successfully!')
                        } else {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          alert(`❌ Failed to ${editingApiConfig ? 'update' : 'create'} API configuration: ${errorData.error || 'Unknown error'}`)
                        }
                      } catch (error) {
                        console.error('Error saving API config:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                        alert(`❌ Failed to ${editingApiConfig ? 'update' : 'create'} API configuration: ${errorMessage}`)
                      }
                    }}
                    onCancel={() => {
                      setShowAddApiForm(false)
                      setEditingApiConfig(null)
                    }}
                    isLoading={false}
                  />
                )}
              </motion.div>
            </TabsContent>
          )}

          {/* Style Management - Admin Only */}
          {userRole === 'admin' && (
            <TabsContent value="styles" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {!showAddStyleForm ? (
                  <Card className="bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle 
                          className="text-3xl font-black text-[#2d3e2d] flex items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Palette className="w-8 h-8 mr-3" />
                          Style Management 🎭
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={async () => {
                              // 检查有问题的风格
                              const checkResponse = await fetch('/api/admin/styles/fix-templates')
                              const checkData = await checkResponse.json()
                              
                              if (checkData.problematicCount > 0) {
                                if (confirm(`发现 ${checkData.problematicCount} 个风格缺少 {prompt} 占位符。是否自动修复？`)) {
                                  const fixResponse = await fetch('/api/admin/styles/fix-templates', { method: 'POST' })
                                  const fixData = await fixResponse.json()
                                  
                                  if (fixData.success) {
                                    alert(`✅ 成功修复了 ${fixData.fixedCount} 个风格模板！`)
                                    loadStyles() // 重新加载风格列表
                                  } else {
                                    alert(`❌ 修复失败: ${fixData.error}`)
                                  }
                                }
                              } else {
                                alert('✅ 所有风格模板都正常，包含 {prompt} 占位符！')
                              }
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2 rounded-xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Fix Templates
                          </Button>
                          <Button
                            onClick={() => {
                              console.log('🔄 Manual refresh triggered')
                              loadStyles()
                            }}
                            variant="outline"
                            size="sm"
                            className="border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white font-black rounded-xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            disabled={isStylesLoading}
                          >
                            <Activity className="w-4 h-4 mr-1" />
                            Refresh
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingStyle(null)
                              setShowAddStyleForm(true)
                            }}
                            className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Style ✨
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Style List - only show when not loading */}
                        {!isStylesLoading && styles && Array.isArray(styles) && styles.map((style, index) => (
                          <motion.div
                            key={style.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border-2 border-[#8b7355] rounded-xl bg-[#f5f1e8]/30 hover:bg-[#f5f1e8]/50 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Style Preview */}
                                <div className="flex-shrink-0">
                                  {style.image_url ? (
                                    <img 
                                      src={style.image_url} 
                                      alt={style.name}
                                      className="w-16 h-16 object-cover rounded-xl border-2 border-[#8b7355]"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#8b7355] to-[#2d3e2d] rounded-xl flex items-center justify-center text-2xl">
                                      {style.emoji || '🎨'}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Style Information */}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 
                                      className="text-xl font-black text-[#2d3e2d]"
                                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                                    >
                                      {style.emoji} {style.name}
                                    </h3>
                                    <div className="flex gap-1">
                                      <Badge className="text-xs bg-red-500 text-black border-2 border-black font-black px-2 py-1">
                                        {style.type}
                                      </Badge>
                                      <Badge className="text-xs bg-yellow-400 text-black border-2 border-black font-black px-2 py-1">
                                        {style.category}
                                      </Badge>
                                      {style.is_premium && (
                                        <Badge className="text-xs bg-[#d4a574] text-[#2d3e2d]">
                                          Premium
                                        </Badge>
                                      )}
                                      <Badge 
                                        className={`text-xs ${style.is_active ? 'bg-green-500' : 'bg-red-500'} text-white`}
                                      >
                                        {style.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <p 
                                    className="text-[#8b7355] font-bold text-sm mb-2"
                                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                                  >
                                    {style.description}
                                  </p>
                                  
                                  <div className="text-xs text-[#2d3e2d]">
                                    <strong>Prompt Template:</strong> {style.prompt_template && style.prompt_template.length > 100 
                                      ? style.prompt_template.substring(0, 100) + '...' 
                                      : style.prompt_template || 'No template'
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[#8b7355] hover:text-[#2d3e2d]"
                                  onClick={() => {
                                    setEditingStyle(style)
                                    setShowAddStyleForm(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={async (e) => {
                                    e.preventDefault()
                                    if (confirm('Are you sure you want to delete this style?')) {
                                      try {
                                        const response = await fetch(`/api/admin/styles/${style.id}`, {
                                          method: 'DELETE'
                                        })
                                        if (response.ok) {
                                          // 重新加载风格
                                          await loadStyles()
                                        } else {
                                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                          alert(errorData.error || 'Failed to delete style')
                                        }
                                      } catch (error) {
                                        console.error('Error deleting style:', error)
                                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                        alert(`Failed to delete style: ${errorMessage}`)
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Loading State */}
                        {isStylesLoading && (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b7355] mx-auto mb-4"></div>
                            <p 
                              className="text-lg font-black text-[#8b7355] mb-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              Loading styles... 🔄
                            </p>
                            <p 
                              className="text-sm text-[#8b7355] opacity-75"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              This may take a few seconds...
                            </p>
                            {/* Timeout Hint */}
                            <div className="mt-4">
                              <p 
                                className="text-xs text-[#8b7355]"
                                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                              >
                                If loading takes too long, try refreshing the page
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Empty State - only show when initial loading is complete and no data */}
                        {!isStylesLoading && hasInitiallyLoadedStyles && styles && Array.isArray(styles) && styles.length === 0 && (
                          <div className="text-center py-8">
                            <p 
                              className="text-xl font-black text-[#8b7355] mb-4"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              No styles configured yet! 🎨
                            </p>
                            <p className="text-[#8b7355] mb-6">
                              Create your first style to get started.
                            </p>
                            <Button
                              onClick={() => {
                                setEditingStyle(null)
                                setShowAddStyleForm(true)
                              }}
                              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-6 py-3 rounded-2xl transform hover:scale-105 transition-all text-lg"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Add Your First Style ✨
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // 使用风格表单组件
                  <StyleForm
                    style={editingStyle}
                    onSave={async (styleData) => {
                      try {
                        const url = editingStyle 
                          ? `/api/admin/styles/${editingStyle.id}`
                          : '/api/admin/styles'
                        const method = editingStyle ? 'PUT' : 'POST'
                        
                        const response = await fetch(url, {
                          method,
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(styleData),
                        })
                        
                        if (response.ok) {
                          // 重新加载风格数据
                          await loadStyles()
                          // 关闭表单
                          setShowAddStyleForm(false)
                          setEditingStyle(null)
                          alert(editingStyle ? '✅ Style updated successfully!' : '✅ Style created successfully!')
                        } else {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          alert(`❌ Failed to ${editingStyle ? 'update' : 'create'} style: ${errorData.error || 'Unknown error'}`)
                        }
                      } catch (error) {
                        console.error('Error saving style:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                        alert(`❌ Failed to ${editingStyle ? 'update' : 'create'} style: ${errorMessage}`)
                      }
                    }}
                    onCancel={() => {
                      setShowAddStyleForm(false)
                      setEditingStyle(null)
                    }}
                    isLoading={false}
                  />
                )}
              </motion.div>
            </TabsContent>
          )}

          {/* 支付管理页面 */}
          {userRole === 'admin' && (
            <TabsContent value="payment" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white border-4 border-[#2d3e2d] rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle 
                      className="text-3xl font-black text-[#2d3e2d] flex items-center"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <CreditCard className="w-8 h-8 mr-3" />
                      Payment System Management 💳
                    </CardTitle>
                    <CardDescription className="text-[#8b7355] text-lg">
                      管理支付提供商、订阅计划和交易配置
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <CreditCard className="w-16 h-16 text-[#d4a574] mx-auto mb-4" />
                        <h3 
                          className="text-2xl font-black text-[#2d3e2d] mb-2"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          Payment Configuration Required 🔧
                        </h3>
                        <p className="text-[#8b7355] mb-6">
                          Configure your payment providers and subscription plans to enable payment processing.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Button
                          onClick={() => {
                            window.open('/admin/payment', '_blank')
                          }}
                          className="w-full bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-6 py-4 rounded-2xl transform hover:scale-105 transition-all text-lg"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          Open Payment Management 🚀
                        </Button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-2 border-[#8b7355] rounded-xl p-4">
                            <h4 className="font-bold text-[#2d3e2d] mb-2">📋 Setup Steps:</h4>
                            <ul className="text-sm text-[#8b7355] space-y-1 text-left">
                              <li>• Configure database migration</li>
                              <li>• Add payment providers (Stripe/PayPal)</li>
                              <li>• Create subscription plans</li>
                              <li>• Test payment integration</li>
                            </ul>
                          </Card>
                          
                          <Card className="border-2 border-[#d4a574] rounded-xl p-4">
                            <h4 className="font-bold text-[#2d3e2d] mb-2">🔒 Security Features:</h4>
                            <ul className="text-sm text-[#8b7355] space-y-1 text-left">
                              <li>• Amount tampering prevention</li>
                              <li>• Webhook signature verification</li>
                              <li>• Encrypted payment sessions</li>
                              <li>• Audit logging</li>
                            </ul>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* Settings Page - Streamlined */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white border-4 border-[#2d3e2d] rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle 
                    className="text-3xl font-black text-[#2d3e2d] flex items-center"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Settings className="w-8 h-8 mr-3" />
                    Settings & Quick Actions ⚙️
                  </CardTitle>
                  <CardDescription className="text-[#8b7355] text-lg">
                    Manage your account and access platform features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Access Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userRole === 'admin' && (
                      <>
                        <Button 
                          onClick={() => window.open('/admin/payment', '_blank')}
                          className="w-full bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <CreditCard className="w-8 h-8 mb-2" />
                          <span>Payment Management</span>
                          <span className="text-xs opacity-75">Configure payment providers</span>
                        </Button>

                        <Button 
                          onClick={() => setActiveTab('api-configs')}
                          className="w-full bg-[#8b7355] hover:bg-[#6d5a42] text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Zap className="w-8 h-8 mb-2" />
                          <span>API Configurations</span>
                          <span className="text-xs opacity-75">Manage AI service providers</span>
                        </Button>

                        <Button 
                          onClick={() => setActiveTab('styles')}
                          className="w-full bg-[#2d3e2d] hover:bg-[#1a2a1a] text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Palette className="w-8 h-8 mb-2" />
                          <span>Style Management</span>
                          <span className="text-xs opacity-75">Create and edit art styles</span>
                        </Button>

                        <Button 
                          onClick={() => window.open('/admin/magic-coins', '_blank')}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Coins className="w-8 h-8 mb-2" />
                          <span>Magic Coins</span>
                          <span className="text-xs opacity-75">Manage magic coin system</span>
                        </Button>

                        <Button 
                          onClick={() => setActiveTab('users')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Users className="w-8 h-8 mb-2" />
                          <span>User Management</span>
                          <span className="text-xs opacity-75">View and manage users</span>
                        </Button>

                        <Button 
                          onClick={() => setActiveTab('images')}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span>Image Gallery</span>
                          <span className="text-xs opacity-75">Browse all user images</span>
                        </Button>
                      </>
                    )}

                    <Button 
                      onClick={() => setActiveTab('overview')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl p-4 h-auto flex flex-col items-center"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <Activity className="w-8 h-8 mb-2" />
                      <span>Dashboard Overview</span>
                      <span className="text-xs opacity-75">View platform statistics</span>
                    </Button>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t-2 border-[#8b7355] pt-6">
                    <h4 
                      className="text-xl font-black text-[#2d3e2d] mb-4"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Account Actions 👤
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl p-3"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out 🚪
                      </Button>

                      <Button 
                        onClick={() => window.open('/', '_blank')}
                        className="w-full bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-2xl p-3"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Main Site 🌐
                      </Button>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="border-t-2 border-[#8b7355] pt-6">
                    <h4 
                      className="text-xl font-black text-[#2d3e2d] mb-4"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      System Information ℹ️
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-[#f5f1e8] p-4 rounded-xl border border-[#8b7355]">
                        <div className="font-bold text-[#2d3e2d] mb-2">Account Details</div>
                        <div className="text-[#8b7355] space-y-1">
                          <div>Email: {session?.user?.email || 'Not available'}</div>
                          <div>Role: {userRole === 'admin' ? 'Administrator 👑' : 'User 👤'}</div>
                          <div>Status: {session ? 'Authenticated ✅' : 'Not logged in ❌'}</div>
                        </div>
                      </div>

                      <div className="bg-[#f5f1e8] p-4 rounded-xl border border-[#8b7355]">
                        <div className="font-bold text-[#2d3e2d] mb-2">Platform Stats</div>
                        <div className="text-[#8b7355] space-y-1">
                          <div>Total Users: {dashboardStats.totalUsers}</div>
                          <div>Total Images: {dashboardStats.totalImages}</div>
                          <div>Revenue: ${dashboardStats.revenue}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* 开发环境调试组件 */}
      <UserInfoDebug />
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#ede7d3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d4a574] mx-auto mb-4"></div>
          <p className="text-[#2d3e2d] font-black text-xl" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Loading Admin Dashboard... ⚡
          </p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
} 