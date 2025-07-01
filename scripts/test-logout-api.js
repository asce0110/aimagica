const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testLogoutAPI() {
  try {
    console.log('🧪 测试登出API端点...')

    // 1. 创建一个测试登录记录
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

    // 2. 创建登录记录
    console.log('\n📝 创建登录记录...')
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

    // 4. 直接测试登出记录创建（模拟API逻辑）
    console.log('\n🚪 模拟登出API逻辑...')
    
    // 找到最近的登录记录
    const { data: latestLog } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('success', true)
      .is('logout_time', null)
      .order('login_time', { ascending: false })
      .limit(1)
      .single()

    if (latestLog) {
      const logoutTime = new Date().toISOString()
      const sessionDuration = Math.floor(
        (new Date(logoutTime).getTime() - new Date(latestLog.login_time).getTime()) / 1000
      )

      console.log(`📝 准备记录登出: 会话时长 ${sessionDuration} 秒`)

      // 创建登出记录
      const { data: logoutRecord, error: logoutError } = await supabase
        .from('login_logs')
        .insert({
          user_id: latestLog.user_id,
          email: latestLog.email,
          login_method: latestLog.login_method, // 使用原来的登录方法
          success: false, // 使用false来标记这是登出记录
          login_time: latestLog.login_time,
          logout_time: logoutTime,
          session_duration: sessionDuration,
          is_admin_login: latestLog.is_admin_login,
          error_message: 'LOGOUT_RECORD' // 用error_message字段标记这是登出记录
        })
        .select()
        .single()

      if (logoutError) {
        console.error('❌ 创建登出记录失败:', logoutError)
      } else {
        console.log('✅ 登出记录创建成功!')
        console.log('📋 登出记录详情:')
        console.log(`   ID: ${logoutRecord.id}`)
        console.log(`   用户: ${logoutRecord.email}`)
        console.log(`   登录时间: ${new Date(logoutRecord.login_time).toLocaleString()}`)
        console.log(`   登出时间: ${new Date(logoutRecord.logout_time).toLocaleString()}`)
        console.log(`   会话时长: ${logoutRecord.session_duration} 秒`)
      }
    }

    // 5. 检查所有记录
    console.log('\n📊 检查用户的所有登录记录:')
    const { data: allLogs } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    allLogs?.forEach((log, index) => {
      const time = new Date(log.created_at).toLocaleString()
      const isLogout = log.error_message === 'LOGOUT_RECORD'
      const method = isLogout ? '🚪 登出' : '🔐 登录'
      console.log(`  ${index + 1}. ${method} (${log.login_method}) - ${time}`)
      if (log.logout_time && log.session_duration) {
        console.log(`     会话时长: ${log.session_duration} 秒`)
      }
    })

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testLogoutAPI() 