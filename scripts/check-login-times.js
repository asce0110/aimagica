const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLoginTimes() {
  try {
    console.log('🕐 检查登录日志时间字段...')

    const { data: logs, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ 查询失败:', error)
      return
    }

    console.log(`\n📊 最近5条登录日志的时间详情:`)
    
    logs?.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.email}`)
      console.log(`   ID: ${log.id}`)
      console.log(`   登录时间 (login_time): ${log.login_time || '未设置'}`)
      console.log(`   登出时间 (logout_time): ${log.logout_time || '未设置'}`)
      console.log(`   会话时长 (session_duration): ${log.session_duration || '未设置'} 秒`)
      console.log(`   创建时间 (created_at): ${log.created_at}`)
      console.log(`   是否管理员: ${log.is_admin_login}`)
      
      // 检查时间是否有效
      if (log.login_time) {
        const loginTime = new Date(log.login_time)
        const createdTime = new Date(log.created_at)
        const timeDiff = Math.abs(loginTime.getTime() - createdTime.getTime()) / 1000
        console.log(`   登录时间与创建时间差: ${timeDiff} 秒`)
      }
    })

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error)
  }
}

checkLoginTimes() 