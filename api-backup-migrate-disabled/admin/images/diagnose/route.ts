import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from "@/lib/supabase-server"

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

    const supabase = await createClient()

    // 获取所有图片
    const { data: allImages, error } = await supabase
      .from('generated_images')
      .select('id, generated_image_url, prompt, style, is_public, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching images for diagnosis:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch images',
        details: error.message
      }, { status: 500 })
    }

    // 检查重复的图片URL
    const urlCounts = allImages?.reduce((acc: any, img) => {
      const url = img.generated_image_url
      if (!acc[url]) {
        acc[url] = []
      }
      acc[url].push({
        id: img.id,
        prompt: img.prompt?.substring(0, 30) + '...',
        style: img.style,
        is_public: img.is_public,
        created_at: img.created_at
      })
      return acc
    }, {}) || {}

    // 找出有重复的图片
    const duplicates = Object.entries(urlCounts)
      .filter(([_, images]: [string, any]) => images.length > 1)
      .map(([url, images]) => ({ url, images, count: images.length }))

    // 检查相同ID的重复记录
    const idCounts = allImages?.reduce((acc: any, img) => {
      const id = img.id
      acc[id] = (acc[id] || 0) + 1
      return acc
    }, {}) || {}

    const duplicateIds = Object.entries(idCounts)
      .filter(([_, count]: [string, any]) => count > 1)
      .map(([id, count]) => ({ id, count }))

    // 统计信息
    const stats = {
      totalImages: allImages?.length || 0,
      publicImages: allImages?.filter(img => img.is_public).length || 0,
      privateImages: allImages?.filter(img => !img.is_public).length || 0,
      duplicateUrls: duplicates.length,
      duplicateIds: duplicateIds.length,
      uniqueUrls: Object.keys(urlCounts).length
    }

    console.log(`📊 图片诊断结果:`, stats)

    return NextResponse.json({ 
      success: true,
      stats,
      duplicatesByUrl: duplicates.slice(0, 10), // 只返回前10个重复
      duplicatesByIds: duplicateIds.slice(0, 10),
      message: '图片诊断完成'
    })

  } catch (error) {
    console.error('❌ Error in diagnose API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 