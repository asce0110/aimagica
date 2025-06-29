const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testLogoutFlow() {
  try {
    console.log('🧪 测试登出流程和时间记录...')

    // 1. 创建一个测试登录记录
    const testEmail = 'sakami55@gmail.com'
    
    console.log(`\n1. 查找用户: ${testEmail}`)
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

    // 2. 创建一个测试登录记录
    console.log('\n2. 创建测试登录记录...')
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
    console.log('📅 登录时间:', loginLog.login_time)

    // 3. 等待几秒钟（模拟用户使用时间）
    console.log('\n3. 等待5秒钟（模拟用户会话）...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 4. 测试更新登出时间
    console.log('\n4. 测试更新登出时间...')
    
    const logoutTime = new Date().toISOString()
    const loginTime = new Date(loginLog.login_time)
    const sessionDuration = Math.floor(
      (new Date(logoutTime).getTime() - loginTime.getTime()) / 1000
    )

    const { error: updateError } = await supabase
      .from('login_logs')
      .update({
        logout_time: logoutTime,
        session_duration: sessionDuration
      })
      .eq('id', loginLog.id)

    if (!updateError) {
      // 获取更新后的记录
      const { data: updatedLog } = await supabase
        .from('login_logs')
        .select('*')
        .eq('id', loginLog.id)
        .single()
      
      if (updatedLog) {
        console.log('✅ 登出时间更新成功!')
        console.log('📅 登出时间:', updatedLog.logout_time)
        console.log('⏱️ 会话时长:', updatedLog.session_duration, '秒')
      }
    }

    if (updateError) {
      console.error('❌ 更新登出时间失败:', updateError)
    }

    // 5. 验证结果
    console.log('\n5. 验证最终结果...')
    const { data: finalLog } = await supabase
      .from('login_logs')
      .select('*')
      .eq('id', loginLog.id)
      .single()

    if (finalLog) {
      console.log('📋 最终日志记录:')
      console.log(`   用户: ${finalLog.email}`)
      console.log(`   登录时间: ${finalLog.login_time}`)
      console.log(`   登出时间: ${finalLog.logout_time || '未设置'}`)
      console.log(`   会话时长: ${finalLog.session_duration || '未计算'} 秒`)
      console.log(`   成功: ${finalLog.success}`)

      if (finalLog.logout_time && finalLog.session_duration) {
        console.log('🎉 登出时间记录功能正常工作!')
      } else {
        console.log('❌ 登出时间记录有问题')
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testLogoutFlow() 