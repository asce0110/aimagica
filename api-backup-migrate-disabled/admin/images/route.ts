import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getImagesWithR2Info, deleteImageWithCleanup } from "@/lib/database/images"
import { isAdmin } from "@/lib/database/admin"
import { createServiceRoleClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    // 验证管理员登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 验证管理员权限
    const isAdminUser = await isAdmin(session.user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') || 'all' // all, public, private
    const search = searchParams.get('search') || ''

    console.log(`🔍 Admin fetching images (limit: ${limit}, offset: ${offset}, filter: ${filter})`)

    // 获取图片数据
    const allImages = await getImagesWithR2Info(limit + 50, 0) // 获取更多数据用于筛选

    // 应用筛选器
    let filteredImages = allImages
    
    if (filter === 'public') {
      filteredImages = allImages.filter(img => img.is_public)
    } else if (filter === 'private') {
      filteredImages = allImages.filter(img => !img.is_public)
    } else if (filter === 'completed') {
      filteredImages = allImages.filter(img => img.status === 'completed')
    } else if (filter === 'processing') {
      filteredImages = allImages.filter(img => img.status === 'processing')
    } else if (filter === 'failed') {
      filteredImages = allImages.filter(img => img.status === 'failed')
    }

    // 应用搜索
    if (search) {
      filteredImages = filteredImages.filter(img => 
        img.prompt?.toLowerCase().includes(search.toLowerCase()) ||
        img.style?.toLowerCase().includes(search.toLowerCase()) ||
        img.user_id?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 分页
    const paginatedImages = filteredImages.slice(offset, offset + limit)

    // 去重：确保每张图片只显示一次（按ID去重）
    const uniqueImages = paginatedImages.reduce((acc: any[], current) => {
      const existingImageIndex = acc.findIndex(img => img.id === current.id)
      if (existingImageIndex === -1) {
        acc.push(current)
      } else {
        // 如果发现重复，保留最新的记录
        if (new Date(current.updated_at) > new Date(acc[existingImageIndex].updated_at)) {
          acc[existingImageIndex] = current
        }
      }
      return acc
    }, [])

    // 获取用户信息来显示真实用户名（使用service role绕过RLS）
    const supabase = await createServiceRoleClient()
    const userIds = [...new Set(uniqueImages.map(img => img.user_id))] // 去重用户ID
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds)

    if (userError) {
      console.warn('⚠️ Failed to fetch user names:', userError)
    }

    // 创建用户ID到用户名的映射
    const userMap = (users || []).reduce((acc: any, user) => {
      acc[user.id] = user.full_name || user.email?.split('@')[0] || 'Unknown User'
      return acc
    }, {})

    // 转换数据格式，适配前端
    const adminImages = uniqueImages.map(image => ({
      id: image.id,
      title: image.prompt?.substring(0, 50) + '...' || 'Untitled',
      prompt: image.prompt || '',
      user_id: image.user_id,
      user_name: userMap[image.user_id] || 'Unknown User',
      created_at: new Date(image.created_at).toISOString().split('T')[0] + ' ' + new Date(image.created_at).toISOString().split('T')[1].split('.')[0],
      generated_image_url: image.generated_image_url,
      r2_key: image.r2_key,
      original_url: image.original_url,
      style: image.style,
      is_public: image.is_public,
      likes_count: image.likes_count || 0,
      status: image.status,
      render_time: image.render_time_seconds,
    }))

    console.log(`📊 原始图片数: ${paginatedImages.length}, 去重后: ${uniqueImages.length}`)

    return NextResponse.json({ 
      success: true,
      data: adminImages,
      total: filteredImages.length,
      hasMore: filteredImages.length > offset + limit,
      message: `Found ${adminImages.length} images`
    })

  } catch (error) {
    console.error('❌ Error fetching admin images:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 验证管理员权限
    const isAdminUser = await isAdmin(session.user.email)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { imageId, userId } = body

    if (!imageId) {
      return NextResponse.json({ 
        error: 'Missing required field: imageId' 
      }, { status: 400 })
    }

    console.log(`🗑️ Admin deleting image ${imageId} for user ${userId}`)

    // 删除图片（包含R2清理）
    const success = await deleteImageWithCleanup(imageId, userId)

    if (!success) {
      throw new Error('Failed to delete image')
    }

    console.log(`✅ Image ${imageId} deleted successfully`)

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 