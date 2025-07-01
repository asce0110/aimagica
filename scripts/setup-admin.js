const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupAdmin() {
  console.log('🔧 Setting up admin permissions...')
  console.log('📁 Working directory:', process.cwd())
  
  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('🔍 Environment check:')
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
  console.log('SERVICE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    console.error('Please check your .env.local file')
    return
  }
  
  console.log('✅ Environment variables found')
  
  // 创建Supabase客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // 检查admin_config表是否存在
    console.log('🔍 Checking admin_config table...')
    const { data: tables, error: tablesError } = await supabase
      .from('admin_config')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      console.error('❌ admin_config table error:', tablesError.message)
      console.log('💡 Please run the database migration first')
      return
    }
    
    console.log('✅ admin_config table exists')
    
    // 清空现有配置
    console.log('🧹 Clearing existing admin config...')
    const { error: deleteError } = await supabase
      .from('admin_config')
      .delete()
      .neq('email', 'dummy') // 删除所有记录
    
    if (deleteError) {
      console.warn('⚠️ Could not clear existing config:', deleteError.message)
    }
    
    // 设置管理员
    console.log('👑 Setting up admin: asce3801@gmail.com')
    const { data, error } = await supabase
      .from('admin_config')
      .insert({ email: 'asce3801@gmail.com', role: 'admin' })
      .select()
    
    if (error) {
      console.error('❌ Failed to insert admin:', error.message)
      return
    }
    
    console.log('✅ Admin setup successful:', data)
    
    // 验证配置
    console.log('🔍 Verifying admin config...')
    const { data: verification, error: verifyError } = await supabase
      .from('admin_config')
      .select('*')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
      return
    }
    
    console.log('📋 Current admin config:', verification)
    console.log('🎉 Admin setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// 立即执行
setupAdmin().catch(console.error) 