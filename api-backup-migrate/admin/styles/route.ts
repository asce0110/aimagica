import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAllStylesForAdmin, createStyle } from '@/lib/database/styles'

// 获取所有风格（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 临时：允许所有登录用户访问风格管理 (用于调试)
    const isAdmin = true // 临时设置为true
    // const isAdmin = session.user.email === 'admin@example.com' || 
    //                session.user.email?.includes('admin')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const styles = await getAllStylesForAdmin()
    return NextResponse.json({ styles })
  } catch (error) {
    console.error('Error fetching admin styles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建新风格
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 临时：允许所有登录用户访问风格管理 (用于调试)
    const isAdmin = true // 临时设置为true
    // const isAdmin = session.user.email === 'admin@example.com' || 
    //                session.user.email?.includes('admin')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      emoji,
      image_url,
      prompt_template,
      default_prompt,
      type,
      category,
      is_premium = false,
      is_active = true,
      sort_order = 0,
      // 限制条件字段
      requires_image_upload = false,
      requires_prompt_description = false,
      prohibits_image_upload = false, // 新增
      min_prompt_length = 0,
      max_prompt_length = 1000,
      allowed_image_formats = ['jpg', 'jpeg', 'png', 'webp'],
      requirements_description = null
    } = body

    // 验证必填字段
    if (!name || !description || !prompt_template || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, prompt_template, type' 
      }, { status: 400 })
    }

    const styleData = {
      name,
      description,
      emoji: emoji || '🎨',
      image_url: image_url || '',
      prompt_template,
      default_prompt: default_prompt || null,
      type,
      category: category || 'art',
      is_premium,
      is_active,
      sort_order,
      // 限制条件字段
      requires_image_upload,
      requires_prompt_description,
      prohibits_image_upload, // 新增
      min_prompt_length,
      max_prompt_length,
      allowed_image_formats,
      requirements_description
    }

    const newStyle = await createStyle(styleData)
    
    if (!newStyle) {
      return NextResponse.json({ error: 'Failed to create style' }, { status: 500 })
    }

    return NextResponse.json({ style: newStyle }, { status: 201 })
  } catch (error) {
    console.error('Error creating style:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 