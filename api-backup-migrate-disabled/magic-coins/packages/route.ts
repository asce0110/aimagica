import { NextRequest, NextResponse } from 'next/server'
import { magicCoinService } from '@/lib/magic-coins'

export async function GET(request: NextRequest) {
  try {
    const packages = await magicCoinService.getPackages()
    return NextResponse.json({ packages })
  } catch (error) {
    console.error('获取魔法币购买包失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 