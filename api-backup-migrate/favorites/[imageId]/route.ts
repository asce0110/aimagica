import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

// 添加收藏
export async function POST(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId } = params

    // 获取用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 检查图片是否存在
    const { data: image } = await supabase
      .from('generated_images')
      .select('id')
      .eq('id', imageId)
      .single()

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // 添加收藏（如果已存在会因为UNIQUE约束而失败，这是正常的）
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        image_id: imageId
      })
      .select()

    if (error) {
      if (error.code === '23505') { // UNIQUE constraint violation
        return NextResponse.json({ message: 'Already favorited' }, { status: 200 })
      }
      console.error('Error adding favorite:', error)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Added to favorites', data })
  } catch (error) {
    console.error('Error in favorites POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除收藏
export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId } = params

    // 获取用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 删除收藏
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('image_id', imageId)

    if (error) {
      console.error('Error removing favorite:', error)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Error in favorites DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 检查是否已收藏
export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ isFavorited: false })
    }

    const { imageId } = params

    // 获取用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ isFavorited: false })
    }

    // 检查是否已收藏
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('image_id', imageId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking favorite:', error)
      return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 500 })
    }

    return NextResponse.json({ isFavorited: !!data })
  } catch (error) {
    console.error('Error in favorites GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 