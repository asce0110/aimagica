import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from "@/lib/supabase-server"

export async function PUT(request: NextRequest) {
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
    const { imageId, prompt, style, is_public, status } = body

    if (!imageId) {
      return NextResponse.json({ 
        error: 'Missing required field: imageId' 
      }, { status: 400 })
    }

    console.log(`📝 Admin editing image ${imageId}:`, { prompt, style, is_public, status })

    const supabase = await createClient()

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (prompt !== undefined) updateData.prompt = prompt
    if (style !== undefined) updateData.style = style
    if (is_public !== undefined) updateData.is_public = is_public
    if (status !== undefined) updateData.status = status

    // 更新图片
    const { data, error } = await supabase
      .from('generated_images')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating image:', error)
      return NextResponse.json({ 
        error: 'Failed to update image',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Image ${imageId} updated successfully`)

    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Image updated successfully'
    })

  } catch (error) {
    console.error('❌ Error in edit image API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 