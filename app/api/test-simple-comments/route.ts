import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 测试最简单的评论表查询...')
    
    const supabase = await createClient()
    
    // 最简单的查询：获取所有评论，不涉及用户表
    const { data: comments, error } = await supabase
      .from('image_comments')
      .select('id, content, created_at')
      .limit(5)
    
    if (error) {
      console.error('❌ 评论表查询失败:', error)
      return NextResponse.json({
        error: 'Comments table query failed',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('✅ 评论表查询成功，找到', comments?.length || 0, '条评论')
    
    return NextResponse.json({
      success: true,
      commentsCount: comments?.length || 0,
      comments: comments || []
    })
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 