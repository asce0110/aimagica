/**
 * 测试管理员配置脚本
 * 用于验证环境变量和数据库配置是否正确
 */

require('dotenv').config({ path: '.env.local' })

// 检查必需的环境变量
function checkEnvVars() {
  console.log('🔍 检查环境变量...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET'
  ]
  
  let allOk = true
  
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      console.log(`❌ 缺少环境变量: ${varName}`)
      allOk = false
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`)
    }
  })
  
  return allOk
}

// 测试Supabase连接
async function testSupabaseConnection() {
  console.log('\n🔍 测试Supabase连接...')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase环境变量缺失')
      return false
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 测试连接
    const { data, error } = await supabase
      .from('admin_config')
      .select('email, role')
      .limit(5)
    
    if (error) {
      console.log('❌ Supabase连接失败:', error.message)
      return false
    }
    
    console.log('✅ Supabase连接成功')
    console.log('📋 当前管理员配置:', data)
    
    return true
  } catch (error) {
    console.log('❌ Supabase测试异常:', error.message)
    return false
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试管理员配置...\n')
  
  // 1. 检查环境变量
  const envOk = checkEnvVars()
  
  if (!envOk) {
    console.log('\n❌ 环境变量配置不完整')
    console.log('请参考 URGENT_ENV_SETUP.md 配置缺失的环境变量')
    process.exit(1)
  }
  
  // 2. 测试Supabase连接
  const supabaseOk = await testSupabaseConnection()
  
  if (!supabaseOk) {
    console.log('\n❌ Supabase连接失败')
    console.log('请检查：')
    console.log('1. Supabase项目是否正常运行')
    console.log('2. admin_config表是否已创建')
    console.log('3. 环境变量值是否正确')
    process.exit(1)
  }
  
  console.log('\n🎉 所有配置验证通过！')
  console.log('现在可以重启项目测试管理员功能了。')
}

// 执行测试
main().catch(error => {
  console.error('❌ 测试过程中发生错误:', error)
  process.exit(1)
}) 