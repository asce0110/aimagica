const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugLoginLogs() {
  try {
    console.log('🔍 检查登录日志表状态...')

    // 1. 检查表是否存在
    console.log('\n1. 检查login_logs表数据:')
    const { data: logs, error: logsError } = await supabase
      .from('login_logs')
      .select('*')
      .limit(10)

    if (logsError) {
      console.error('❌ 查询login_logs表失败:', logsError)
      return
    }

    console.log(`📊 login_logs表有 ${logs?.length || 0} 条记录`)
    if (logs && logs.length > 0) {
      console.log('最近的记录:', JSON.stringify(logs[0], null, 2))
    }

    // 2. 测试手动创建一条登录日志
    console.log('\n2. 测试手动创建登录日志...')
    
    // 先获取一个用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'asce3801@gmail.com')
      .single()

    if (!user) {
      console.error('❌ 找不到测试用户')
      return
    }

    console.log('📝 找到测试用户:', user.email)

    // 尝试插入一条测试日志
    const testLog = {
      user_id: user.id,
      email: user.email,
      login_method: 'google',
      success: true,
      login_time: new Date().toISOString(),
      is_admin_login: true
    }

    console.log('🧪 尝试插入测试日志:', JSON.stringify(testLog, null, 2))

    const { data: insertedLog, error: insertError } = await supabase
      .from('login_logs')
      .insert(testLog)
      .select()
      .single()

    if (insertError) {
      console.error('❌ 插入测试日志失败:', insertError)
      
      // 检查是否是字段问题
      if (insertError.code === '42703') {
        console.log('🔍 可能是字段不匹配，让我检查表结构...')
        
        // 尝试只插入基本字段
        const basicLog = {
          user_id: user.id,
          email: user.email,
          login_method: 'google',
          success: true,
          created_at: new Date().toISOString()
        }

        const { data: basicInsert, error: basicError } = await supabase
          .from('login_logs')
          .insert(basicLog)
          .select()
          .single()

        if (basicError) {
          console.error('❌ 基本字段插入也失败:', basicError)
        } else {
          console.log('✅ 基本字段插入成功:', basicInsert)
        }
      }
    } else {
      console.log('✅ 测试日志插入成功:', insertedLog)
    }

    // 3. 检查用户表中是否有对应的用户
    console.log('\n3. 检查用户表状态:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .limit(5)

    if (usersError) {
      console.error('❌ 查询用户表失败:', usersError)
    } else {
      console.log('📊 用户表样例数据:')
      users?.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u.id})`)
      })
    }

    // 4. 再次检查login_logs表
    console.log('\n4. 再次检查login_logs表:')
    const { data: finalLogs, error: finalError } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (finalError) {
      console.error('❌ 最终查询失败:', finalError)
    } else {
      console.log(`📊 最终login_logs表有 ${finalLogs?.length || 0} 条记录`)
      if (finalLogs && finalLogs.length > 0) {
        finalLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.email} - ${log.login_method} - ${log.success ? '成功' : '失败'}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error)
  }
}

debugLoginLogs() 