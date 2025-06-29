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

    // 获取图片状态统计
    const { data: stats, error } = await supabase
      .from('generated_images')
      .select('is_public, status')

    if (error) {
      console.error('❌ Error fetching image stats:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch image stats',
        details: error.message
      }, { status: 500 })
    }

    // 统计数据
    const publicCount = stats?.filter(img => img.is_public).length || 0
    const privateCount = stats?.filter(img => !img.is_public).length || 0
    const totalCount = stats?.length || 0

    const statusCounts = stats?.reduce((acc: any, img) => {
      acc[img.status] = (acc[img.status] || 0) + 1
      return acc
    }, {}) || {}

    console.log(`📊 Image stats: Total: ${totalCount}, Public: ${publicCount}, Private: ${privateCount}`)

    return NextResponse.json({ 
      success: true,
      data: {
        total: totalCount,
        public: publicCount,
        private: privateCount,
        statusBreakdown: statusCounts,
        publicPercentage: totalCount > 0 ? Math.round((publicCount / totalCount) * 100) : 0
      },
      message: 'Image statistics retrieved successfully'
    })

  } catch (error) {
    console.error('❌ Error in image stats API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 