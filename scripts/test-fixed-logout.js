const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testFixedLogout() {
  try {
    console.log('🧪 测试修复后的登出功能...')

    // 1. 找到一个现有的登录记录
    const testEmail = 'sakami55@gmail.com'
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (!user) {
      console.error('❌ 用户不存在')
      return
    }

    console.log('✅ 找到用户:', user.email)

    // 2. 创建一个新的登录记录
    console.log('\n📝 创建新的登录记录...')
    const loginData = {
      user_id: user.id,
      email: user.email,
      login_method: 'google',
      success: true,
      is_admin_login: false,
      login_time: new Date().toISOString()
    }

    const { data: loginLog, error: loginError } = await supabase
      .from('login_logs')
      .insert(loginData)
      .select()
      .single()

    if (loginError) {
      console.error('❌ 创建登录记录失败:', loginError)
      return
    }

    console.log('✅ 登录记录创建成功:', loginLog.id)

    // 3. 等待几秒钟
    console.log('\n⏰ 等待3秒钟（模拟用户会话）...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 4. 测试修复后的updateLogoutTime函数
    console.log('\n🚪 测试登出功能...')
    
    // 导入并测试updateLogoutTime函数
    const { updateLogoutTime } = require('../lib/database/auth-logs')
    
    const logoutSuccess = await updateLogoutTime(user.id)
    
    if (logoutSuccess) {
      console.log('✅ 登出功能测试成功!')
    } else {
      console.log('❌ 登出功能测试失败')
    }

    // 5. 检查结果
    console.log('\n📋 检查登出记录...')
    const { data: allLogs } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log(`📊 用户 ${user.email} 的最近登录记录:`)
    allLogs?.forEach((log, index) => {
      const time = new Date(log.created_at).toLocaleString()
      console.log(`  ${index + 1}. ${log.login_method} - ${log.success ? '成功' : '失败'} - ${time}`)
      if (log.logout_time) {
        console.log(`     登出时间: ${new Date(log.logout_time).toLocaleString()}`)
        console.log(`     会话时长: ${log.session_duration} 秒`)
      }
    })

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testFixedLogout() 