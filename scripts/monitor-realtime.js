const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let lastCount = 0
let lastLogId = null

async function checkForNewLogs() {
  try {
    const { data: logs, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 查询失败:', error)
      return
    }

    const currentCount = logs?.length || 0
    
    if (lastCount === 0) {
      // 第一次运行
      lastCount = currentCount
      if (logs && logs.length > 0) {
        lastLogId = logs[0].id
        console.log(`🔍 开始监控... 当前有 ${currentCount} 条登录记录`)
        console.log(`📋 最新记录: ${logs[0].email} - ${new Date(logs[0].created_at).toLocaleString()}`)
      }
      return
    }

    if (currentCount > lastCount) {
      console.log(`\n🆕 发现新的登录记录！从 ${lastCount} 增加到 ${currentCount}`)
      
      // 显示新记录
      const newLogs = logs?.slice(0, currentCount - lastCount) || []
      newLogs.forEach((log, index) => {
        const time = new Date(log.created_at).toLocaleString()
        const isLogout = log.error_message === 'LOGOUT_RECORD'
        const type = isLogout ? '🚪 登出' : '🔐 登录'
        
        console.log(`  ${index + 1}. ${type} - ${log.email}`)
        console.log(`     时间: ${time}`)
        console.log(`     方法: ${log.login_method}`)
        console.log(`     成功: ${log.success}`)
        if (log.logout_time && log.session_duration) {
          console.log(`     会话时长: ${log.session_duration} 秒`)
        }
        console.log(`     ID: ${log.id}`)
      })
      
      lastCount = currentCount
      lastLogId = logs[0].id
    } else if (currentCount === lastCount && logs && logs.length > 0) {
      // 检查是否有相同数量但不同的记录（比如更新了现有记录）
      if (lastLogId && logs[0].id !== lastLogId) {
        console.log(`\n🔄 记录有变化，最新记录ID从 ${lastLogId} 变为 ${logs[0].id}`)
        lastLogId = logs[0].id
      }
    }
    
  } catch (error) {
    console.error('❌ 监控过程中发生错误:', error)
  }
}

console.log('🚀 开始实时监控登录日志...')
console.log('💡 请在浏览器中进行登录/登出测试')
console.log('⏹️  按 Ctrl+C 停止监控\n')

// 立即检查一次
checkForNewLogs()

// 每2秒检查一次
const interval = setInterval(checkForNewLogs, 2000)

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 停止监控...')
  clearInterval(interval)
  process.exit(0)
}) 