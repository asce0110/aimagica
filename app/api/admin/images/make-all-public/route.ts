import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
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

    console.log('🔄 Making all images public...')

    const supabase = await createClient()

    // 首先获取当前私有图片的数量
    const { data: privateImages, error: countError } = await supabase
      .from('generated_images')
      .select('id')
      .eq('is_public', false)

    if (countError) {
      console.error('❌ Error counting private images:', countError)
      return NextResponse.json({ 
        error: 'Failed to count private images',
        details: countError.message
      }, { status: 500 })
    }

    const privateCount = privateImages?.length || 0
    console.log(`📊 Found ${privateCount} private images to update`)

    if (privateCount === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'All images are already public',
        updatedCount: 0
      })
    }

    // 将所有图片设置为公开
    const { data, error } = await supabase
      .from('generated_images')
      .update({ 
        is_public: true,
        updated_at: new Date().toISOString()
      })
      .eq('is_public', false)
      .select('id')

    if (error) {
      console.error('❌ Error updating images to public:', error)
      return NextResponse.json({ 
        error: 'Failed to update images',
        details: error.message
      }, { status: 500 })
    }

    const updatedCount = data?.length || 0
    console.log(`✅ Successfully updated ${updatedCount} images to public`)

    return NextResponse.json({ 
      success: true,
      message: `Successfully updated ${updatedCount} images to public`,
      updatedCount: updatedCount,
      previousPrivateCount: privateCount
    })

  } catch (error) {
    console.error('❌ Error in make all public API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 