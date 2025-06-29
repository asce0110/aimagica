"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Heart,
  Copy,
  MoreHorizontal,
  RefreshCw,
  ArrowLeft,
  Home
} from "lucide-react"

interface UserPrompt {
  id: number
  prompt: string
  title: string
  description: string
  category: string
  tags: string[]
  likes_count: number
  uses_count: number
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  created_at: string
  updated_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  user_id: string
  users: {
    id: string
    name: string
    email: string
    image: string
  }
  reviewed_user?: {
    id: string
    name: string
    email: string
  }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

const categories = [
  { id: "all", name: "All", emoji: "🎨" },
  { id: "fantasy", name: "Fantasy", emoji: "🧙‍♂️" },
  { id: "anime", name: "Anime", emoji: "🌸" },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "🌃" },
  { id: "nature", name: "Nature", emoji: "🌿" },
  { id: "portrait", name: "Portrait", emoji: "👤" },
  { id: "abstract", name: "Abstract", emoji: "🎭" },
  { id: "cute", name: "Cute", emoji: "🐱" },
  { id: "general", name: "General", emoji: "✨" },
]

export default function AdminPromptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPrompts, setSelectedPrompts] = useState<Set<number>>(new Set())
  const [dbNotInitialized, setDbNotInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  
  // 筛选和搜索
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // 页面
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // 对话框
  const [viewPrompt, setViewPrompt] = useState<UserPrompt | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectingPromptId, setRejectingPromptId] = useState<number | null>(null)

  // 检查管理员权限
  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/admin/login")
      return
    }

    // 这里可以添加额外的管理员权限检查
    fetchPrompts(1, true)
  }, [session, status, activeTab, searchTerm, selectedCategory, sortBy, sortOrder])

  // 获取提示词列表
  const fetchPrompts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        status: activeTab === 'all' ? 'all' : activeTab,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        search: searchTerm,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/user-prompts?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (reset || pageNum === 1) {
          setPrompts(data.prompts)
        } else {
          setPrompts(prev => [...prev, ...data.prompts])
        }
        setHasMore(pageNum < data.pagination.totalPages)
        setStats(data.stats)
        
        // 检查是否有数据库未初始化的提示
        if (data.notice) {
          setDbNotInitialized(true)
          toast({
            title: "Database Not Initialized",
            description: data.notice,
            variant: "destructive"
          })
        } else {
          setDbNotInitialized(false)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch prompts",
          variant: "destructive"
        })
        
        if (response.status === 403) {
          router.push("/admin/login")
        }
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 批量操作
  const handleBatchAction = async (action: string, promptIds?: number[]) => {
    const targetIds = promptIds || Array.from(selectedPrompts)
    
    if (targetIds.length === 0) {
      toast({
        title: "No prompts selected",
        description: "Please select prompts to perform the action",
        variant: "destructive"
      })
      return
    }

    let requestData: any = {
      action,
      promptIds: targetIds
    }

    if (action === 'reject' && rejectReason) {
      requestData.data = { rejectionReason: rejectReason }
    }

    try {
      const response = await fetch('/api/admin/user-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message
        })
        
        // 重新获取数据
        setPage(1)
        fetchPrompts(1, true)
        setSelectedPrompts(new Set())
        setRejectReason("")
        setShowRejectDialog(false)
        setRejectingPromptId(null)
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} prompts`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing prompts:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} prompts`,
        variant: "destructive"
      })
    }
  }

  // 单个操作
  const handleSingleAction = (action: string, promptId: number) => {
    if (action === 'reject') {
      setRejectingPromptId(promptId)
      setShowRejectDialog(true)
    } else {
      handleBatchAction(action, [promptId])
    }
  }

  // 选择/取消选择
  const toggleSelect = (promptId: number) => {
    const newSelected = new Set(selectedPrompts)
    if (newSelected.has(promptId)) {
      newSelected.delete(promptId)
    } else {
      newSelected.add(promptId)
    }
    setSelectedPrompts(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedPrompts.size === prompts.length) {
      setSelectedPrompts(new Set())
    } else {
      setSelectedPrompts(new Set(prompts.map(p => p.id)))
    }
  }

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPrompts(nextPage, false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return null
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prompts Management
          </h1>
          <p className="text-gray-600">
            Review and manage user-submitted prompts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Not Initialized Warning */}
        {dbNotInitialized && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="p-2 bg-red-100 rounded-lg mr-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Database Not Initialized
                  </h3>
                  <p className="text-red-700 mb-4">
                    The user prompts database tables have not been created yet. Please run the SQL migration script first.
                  </p>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">To fix this issue:</p>
                    <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
                      <li>Open your Supabase project dashboard</li>
                      <li>Go to SQL Editor</li>
                      <li>Run the migration script: <code className="bg-red-200 px-1 rounded">scripts/create-user-prompts-basic.sql</code></li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Date Updated</SelectItem>
                  <SelectItem value="likes_count">Likes</SelectItem>
                  <SelectItem value="uses_count">Uses</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Batch Actions */}
        {selectedPrompts.size > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedPrompts.size} prompt(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBatchAction('approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBatchAction('feature')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Feature
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBatchAction('delete')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Prompts List */}
        {loading && prompts.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading prompts...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Select All */}
              {prompts.length > 0 && (
                <div className="flex items-center space-x-2 p-4 bg-white rounded-lg border">
                  <Checkbox
                    checked={selectedPrompts.size === prompts.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
              )}

              {/* Prompts */}
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedPrompts.has(prompt.id)}
                        onCheckedChange={() => toggleSelect(prompt.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {prompt.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {prompt.users.name || prompt.users.email}
                              </span>
                              <span>
                                {new Date(prompt.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                {categories.find(c => c.id === prompt.category)?.emoji} {categories.find(c => c.id === prompt.category)?.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(prompt.status)}
                            {prompt.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-700 line-clamp-2 mb-2">
                            "{prompt.prompt}"
                          </p>
                          {prompt.description && (
                            <p className="text-sm text-gray-500 italic">
                              {prompt.description}
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        {prompt.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {prompt.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1 text-red-500" />
                              {prompt.likes_count} likes
                            </span>
                            <span className="flex items-center">
                              <Copy className="w-4 h-4 mr-1 text-blue-500" />
                              {prompt.uses_count} uses
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewPrompt(prompt)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            
                            {prompt.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSingleAction('approve', prompt.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSingleAction('reject', prompt.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {prompt.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleSingleAction(prompt.is_featured ? 'unfeature' : 'feature', prompt.id)}
                                className={prompt.is_featured ? "bg-gray-600 hover:bg-gray-700" : "bg-yellow-600 hover:bg-yellow-700"}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                {prompt.is_featured ? 'Unfeature' : 'Feature'}
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSingleAction('delete', prompt.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Rejection reason */}
                        {prompt.status === 'rejected' && prompt.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Rejection reason:</strong> {prompt.rejection_reason}
                            </p>
                          </div>
                        )}

                        {/* Review info */}
                        {prompt.reviewed_at && prompt.reviewed_user && (
                          <div className="mt-3 text-xs text-gray-500">
                            Reviewed by {prompt.reviewed_user.name || prompt.reviewed_user.email} on {new Date(prompt.reviewed_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {/* No Results */}
            {prompts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No prompts found.</p>
              </div>
            )}
          </>
        )}

        {/* View Prompt Dialog */}
        <Dialog open={!!viewPrompt} onOpenChange={() => setViewPrompt(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {viewPrompt?.title}
              </DialogTitle>
            </DialogHeader>
            
            {viewPrompt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Author:</strong> {viewPrompt.users.name || viewPrompt.users.email}
                  </div>
                  <div>
                    <strong>Category:</strong> {categories.find(c => c.id === viewPrompt.category)?.name}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(viewPrompt.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong> {getStatusBadge(viewPrompt.status)}
                  </div>
                  <div>
                    <strong>Likes:</strong> {viewPrompt.likes_count}
                  </div>
                  <div>
                    <strong>Uses:</strong> {viewPrompt.uses_count}
                  </div>
                </div>

                <div>
                  <strong>Prompt:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    {viewPrompt.prompt}
                  </div>
                </div>

                {viewPrompt.description && (
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-gray-600">{viewPrompt.description}</p>
                  </div>
                )}

                {viewPrompt.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {viewPrompt.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewPrompt.rejection_reason && (
                  <div>
                    <strong>Rejection Reason:</strong>
                    <p className="mt-1 text-red-600">{viewPrompt.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Prompt(s)</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rejection Reason (Optional)</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this prompt is being rejected..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectReason("")
                    setRejectingPromptId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (rejectingPromptId) {
                      handleBatchAction('reject', [rejectingPromptId])
                    } else {
                      handleBatchAction('reject')
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 