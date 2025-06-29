import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { magicCoinService } from '@/lib/magic-coins'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const balance = await magicCoinService.getUserBalance(session.user.id)
    
    if (!balance) {
      // 如果用户没有魔法币账户，初始化一个
      const newBalance = await magicCoinService.initializeUserBalance(session.user.id)
      if (!newBalance) {
        return NextResponse.json({ error: 'Failed to initialize balance' }, { status: 500 })
      }
      return NextResponse.json({ balance: newBalance })
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('获取魔法币余额失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 