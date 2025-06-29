import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 检查管理员权限
    const adminStatus = await isAdmin(session.user.email)
    
    if (!supabase) {
      return NextResponse.json({
        images: [],
        message: 'Database not configured'
      })
    }

    try {
      let imagesQuery = supabase
        .from('generated_images')
        .select(`
          id,
          prompt,
          image_url,
          style,
          status,
          view_count,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      // 如果不是管理员，只查询自己的图片
      if (!adminStatus) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()

        if (!userData) {
          return NextResponse.json({ images: [] })
        }

        imagesQuery = imagesQuery.eq('user_id', userData.id)
      }

      const { data: images, error: imagesError } = await imagesQuery

      if (imagesError) {
        console.error('❌ 查询图片失败:', imagesError)
        return NextResponse.json({ images: [] })
      }

      // 为每个图片获取用户信息和点赞统计
      const imagesWithStats = await Promise.all(
        (images || []).map(async (image) => {
          try {
            // 获取用户信息
            const { data: user } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', image.user_id)
              .single()

            // 获取点赞数
            const { count: likeCount } = await supabase
              .from('image_likes')
              .select('*', { count: 'exact', head: true })
              .eq('image_id', image.id)

            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: user?.full_name || user?.email || 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: likeCount || 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          } catch (error) {
            console.error(`❌ 获取图片 ${image.id} 统计失败:`, error)
            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          }
        })
      )

      return NextResponse.json({
        images: imagesWithStats,
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return NextResponse.json({ images: [] })
    }
    
  } catch (error) {
    console.error("❌ 获取图片列表失败:", error)
    return NextResponse.json({ 
      error: 'Failed to fetch images',
      images: []
    }, { status: 500 })
  }
} 