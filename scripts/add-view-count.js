const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function addViewCountColumn() {
  try {
    console.log('🚀 尝试添加view_count字段...')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ 环境变量未找到，请确保.env.local文件存在')
      console.log('📝 请手动在Supabase Dashboard中执行以下SQL:')
      console.log('ALTER TABLE generated_images ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 尝试查询以测试连接
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, view_count')
      .limit(1)
    
    if (error && error.message.includes('column "view_count" does not exist')) {
      console.log('❌ view_count字段不存在')
      console.log('📝 请在Supabase Dashboard的SQL Editor中执行以下命令:')
      console.log('')
      console.log('ALTER TABLE generated_images ADD COLUMN view_count INTEGER DEFAULT 0;')
      console.log('')
    } else if (error) {
      console.log('❌ 数据库连接错误:', error.message)
    } else {
      console.log('✅ view_count字段已存在')
      console.log('📊 测试数据:', data)
    }
    
  } catch (err) {
    console.error('❌ 执行过程中发生错误:', err.message)
    console.log('📝 请手动在Supabase Dashboard中执行以下SQL:')
    console.log('ALTER TABLE generated_images ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;')
  }
}

addViewCountColumn() 