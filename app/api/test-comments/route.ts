import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageId } = body
    
    console.log('🔍 测试评论表查询，图片ID:', imageId)
    
    const supabase = await createClient()
    
    // 1. 先测试最简单的查询
    console.log('1️⃣ 测试评论表是否存在...')
    const { data: testQuery, error: testError } = await supabase
      .from('image_comments')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ 评论表测试失败:', testError)
      return NextResponse.json({
        error: 'Comments table test failed',
        details: testError.message,
        stage: 'table_existence_check'
      }, { status: 500 })
    }
    
    console.log('✅ 评论表存在')
    
    // 2. 测试查询特定图片的评论
    console.log('2️⃣ 查询特定图片的评论...')
    const { data: comments, error: commentsError } = await supabase
      .from('image_comments')
      .select('id, content, likes_count, created_at, user_id')
      .eq('image_id', imageId)
      .order('created_at', { ascending: false })
    
    if (commentsError) {
      console.error('❌ 评论查询失败:', commentsError)
      return NextResponse.json({
        error: 'Comments query failed',
        details: commentsError.message,
        stage: 'comments_query'
      }, { status: 500 })
    }
    
    console.log('✅ 评论查询成功，找到', comments?.length || 0, '条评论')
    
    // 3. 如果有评论，测试用户信息查询
    let userTestResult = null
    if (comments && comments.length > 0 && comments[0].user_id) {
      console.log('3️⃣ 测试用户信息查询...')
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', comments[0].user_id)
        .single()
      
      if (userError) {
        console.error('❌ 用户查询失败:', userError)
        userTestResult = { error: userError.message }
      } else {
        console.log('✅ 用户查询成功')
        userTestResult = { success: true, user: user }
      }
    }
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      commentsCount: comments?.length || 0,
      comments: comments,
      userTestResult: userTestResult
    })
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 