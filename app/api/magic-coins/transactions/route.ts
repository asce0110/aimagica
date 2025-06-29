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

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const transactions = await magicCoinService.getUserTransactions(session.user.id, limit)
    
    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('获取交易历史失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 