const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDatabaseConnection() {
  console.log('🔗 测试数据库连接...\n')
  
  try {
    // 1. 测试用户查询
    console.log('1️⃣ 查询现有用户...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3)
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError)
    } else {
      console.log('✅ 找到', users?.length || 0, '个用户')
      users?.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
      })
    }
    
    // 2. 测试登录日志查询
    console.log('\n2️⃣ 查询现有登录日志...')
    const { data: logs, error: logsError } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (logsError) {
      console.error('❌ 查询登录日志失败:', logsError)
    } else {
      console.log('✅ 找到', logs?.length || 0, '条登录日志')
      logs?.forEach(log => {
        const time = new Date(log.created_at).toLocaleString()
        console.log(`   - ${log.email} - ${time}`)
      })
    }
    
    // 3. 测试插入登录日志
    console.log('\n3️⃣ 测试插入新登录日志...')
    
    // 先获取一个现有用户
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    
    if (testUserError || !testUser) {
      console.error('❌ 无法获取测试用户:', testUserError)
      return
    }
    
    console.log('📋 使用测试用户:', testUser.email)
    
    const testLogData = {
      user_id: testUser.id,
      email: testUser.email,
      login_method: 'google',
      login_time: new Date().toISOString(),
      success: true,
      is_admin_login: false
    }
    
    console.log('📝 准备插入的日志数据:', testLogData)
    
    const { data: newLog, error: insertError } = await supabase
      .from('login_logs')
      .insert(testLogData)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ 插入登录日志失败:', insertError)
    } else {
      console.log('✅ 登录日志插入成功!')
      console.log('   新日志ID:', newLog.id)
      console.log('   记录时间:', newLog.created_at)
    }
    
    // 4. 再次查询验证
    console.log('\n4️⃣ 再次查询验证...')
    const { data: afterLogs, error: afterError } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (afterError) {
      console.error('❌ 验证查询失败:', afterError)
    } else {
      console.log('✅ 验证查询成功，最新3条记录:')
      afterLogs?.forEach((log, index) => {
        const time = new Date(log.created_at).toLocaleString()
        console.log(`   ${index + 1}. ${log.email} - ${time}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testDatabaseConnection().catch(console.error) 