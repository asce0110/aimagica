import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { createFastServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createFastServiceRoleClient()
    const { data: packages, error } = await supabase
      .from('magic_coin_packages')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('获取魔法币购买包失败:', error)
      return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('获取魔法币购买包失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, coins_amount, price_usd, bonus_coins, sort_order } = body

    if (!name || !coins_amount || !price_usd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createFastServiceRoleClient()
    const { data, error } = await supabase
      .from('magic_coin_packages')
      .insert({
        name,
        description,
        coins_amount: parseInt(coins_amount),
        price_usd: parseFloat(price_usd),
        bonus_coins: parseInt(bonus_coins) || 0,
        sort_order: parseInt(sort_order) || 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('创建魔法币购买包失败:', error)
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }

    return NextResponse.json({ package: data })
  } catch (error) {
    console.error('创建魔法币购买包失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, coins_amount, price_usd, bonus_coins, sort_order, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const supabase = createFastServiceRoleClient()
    const { data, error } = await supabase
      .from('magic_coin_packages')
      .update({
        name,
        description,
        coins_amount: parseInt(coins_amount),
        price_usd: parseFloat(price_usd),
        bonus_coins: parseInt(bonus_coins) || 0,
        sort_order: parseInt(sort_order) || 0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新魔法币购买包失败:', error)
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }

    return NextResponse.json({ package: data })
  } catch (error) {
    console.error('更新魔法币购买包失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const supabase = createFastServiceRoleClient()
    const { error } = await supabase
      .from('magic_coin_packages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除魔法币购买包失败:', error)
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除魔法币购买包失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 