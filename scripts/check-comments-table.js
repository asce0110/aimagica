// 检查评论表是否存在的脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase环境变量未设置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCommentsTable() {
  console.log('🔍 检查评论表...')
  
  try {
    // 检查image_comments表
    const { data, error } = await supabase
      .from('image_comments')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ image_comments表查询错误:', error.message)
      console.error('详细错误:', error)
    } else {
      console.log('✅ image_comments表存在')
      console.log('数据:', data)
    }
    
    // 尝试查询一些数据
    const { data: comments, error: commentsError } = await supabase
      .from('image_comments')
      .select('*')
      .limit(5)
    
    if (commentsError) {
      console.error('❌ 查询评论数据错误:', commentsError.message)
      console.error('详细错误:', commentsError)
    } else {
      console.log('✅ 评论数据查询成功:', comments?.length || 0, '条记录')
      if (comments && comments.length > 0) {
        console.log('第一条评论:', comments[0])
      }
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message)
  }
}

checkCommentsTable() 