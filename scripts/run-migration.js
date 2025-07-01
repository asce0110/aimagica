const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 使用service role key创建客户端以执行管理操作
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('🚀 开始执行数据库迁移...')
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../lib/database/migrations/add_comments_and_views.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 读取迁移文件:', migrationPath)
    
    // 执行SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    })
    
    if (error) {
      console.error('❌ 迁移执行失败:', error)
      return
    }
    
    console.log('✅ 数据库迁移执行成功!')
    console.log('📊 结果:', data)
    
  } catch (err) {
    console.error('❌ 迁移过程中发生错误:', err)
  }
}

// 如果没有exec_sql函数，我们分步执行
async function runMigrationStepByStep() {
  try {
    console.log('🚀 开始分步执行数据库迁移...')
    
    // 1. 添加view_count字段
    console.log('1️⃣ 添加view_count字段...')
    let { error } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE generated_images ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;'
    })
    
    if (error) {
      console.error('❌ 添加view_count字段失败:', error)
      // 继续执行其他步骤
    } else {
      console.log('✅ view_count字段添加成功')
    }
    
    // 由于Supabase限制，我们使用更简单的方法
    console.log('📝 请手动在Supabase Dashboard中执行以下SQL:')
    console.log('---')
    
    const migrationPath = path.join(__dirname, '../lib/database/migrations/add_comments_and_views.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    console.log(sqlContent)
    console.log('---')
    
  } catch (err) {
    console.error('❌ 迁移过程中发生错误:', err)
  }
}

runMigrationStepByStep() 