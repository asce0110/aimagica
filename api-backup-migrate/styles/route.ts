import { NextRequest, NextResponse } from 'next/server'
import { getAllStyles } from '@/lib/database/styles'

// 获取公开的风格列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'image' | 'video' | 'both' | null

    const styles = await getAllStyles(type || undefined)
    
    return NextResponse.json({ 
      styles,
      total: styles.length 
    })
  } catch (error) {
    console.error('Error fetching public styles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 