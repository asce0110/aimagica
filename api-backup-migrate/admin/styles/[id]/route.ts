import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getStyleById, updateStyle, deleteStyle } from '@/lib/database/styles'
import { isAdmin as checkIsAdmin } from '@/lib/database/admin'

// 获取单个风格
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const style = await getStyleById(id)
    
    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    return NextResponse.json({ style })
  } catch (error) {
    console.error('Error fetching style:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新风格
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 管理员检查
    const adminCheck = await checkIsAdmin(session.user.email!)
    console.log('🔍 PUT /api/admin/styles/[id] - 管理员检查:', session.user.email, '结果:', adminCheck)

    if (!adminCheck) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    console.log('🔄 更新风格数据:', { id, body })
    
    const updates = {
      name: body.name,
      description: body.description,
      emoji: body.emoji,
      image_url: body.image_url,
      prompt_template: body.prompt_template,
      default_prompt: body.default_prompt,
      type: body.type,
      category: body.category,
      is_premium: body.is_premium,
      is_active: body.is_active,
      sort_order: body.sort_order,
      // 添加缺失的限制条件字段
      requires_image_upload: body.requires_image_upload,
      requires_prompt_description: body.requires_prompt_description,
      prohibits_image_upload: body.prohibits_image_upload, // 新增
      min_prompt_length: body.min_prompt_length,
      max_prompt_length: body.max_prompt_length,
      allowed_image_formats: body.allowed_image_formats,
      requirements_description: body.requirements_description
    }

    // 移除undefined值
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates]
      }
    })

    console.log('🔄 处理后的更新数据:', updates)

    const updatedStyle = await updateStyle(id, updates)
    
    if (!updatedStyle) {
      console.error('❌ 更新风格失败:', id)
      return NextResponse.json({ error: 'Failed to update style or style not found' }, { status: 500 })
    }

    console.log('✅ 风格更新成功:', updatedStyle)
    return NextResponse.json({ style: updatedStyle })
  } catch (error) {
    console.error('❌ Error updating style:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 删除风格（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 管理员检查
    const adminCheck = await checkIsAdmin(session.user.email!)
    console.log('🔍 DELETE /api/admin/styles/[id] - 管理员检查:', session.user.email, '结果:', adminCheck)

    if (!adminCheck) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const success = await deleteStyle(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete style or style not found' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Style deleted successfully' })
  } catch (error) {
    console.error('Error deleting style:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 