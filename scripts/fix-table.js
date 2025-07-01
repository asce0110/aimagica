const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixTable() {
  try {
    console.log('🔧 修复表的更新问题...')

    // 获取最新记录
    const { data: latestRecord } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!latestRecord) {
      console.log('❌ 没有找到记录')
      return
    }

    console.log('📝 找到记录:', latestRecord.id)

    // 简化问题：直接测试是否是权限问题
    console.log('\n🧪 测试权限和表访问...')
    
    // 尝试最简单的更新
    const { error } = await supabase
      .from('login_logs')
      .update({ logout_time: new Date().toISOString() })
      .eq('id', latestRecord.id)

    if (error) {
      console.error('❌ 更新失败:', error)
      
      // 尝试不同的方法：使用upsert
      console.log('\n🔄 尝试upsert方法...')
      
      const { error: upsertError } = await supabase
        .from('login_logs')
        .upsert({
          id: latestRecord.id,
          user_id: latestRecord.user_id,
          email: latestRecord.email,
          login_method: latestRecord.login_method,
          success: latestRecord.success,
          login_time: latestRecord.login_time,
          logout_time: new Date().toISOString(),
          session_duration: 300,
          is_admin_login: latestRecord.is_admin_login
        })

      if (upsertError) {
        console.error('❌ Upsert也失败:', upsertError)
      } else {
        console.log('✅ Upsert成功!')
      }
    } else {
      console.log('✅ 更新成功!')
    }

  } catch (error) {
    console.error('❌ 过程中发生错误:', error)
  }
}

fixTable() 