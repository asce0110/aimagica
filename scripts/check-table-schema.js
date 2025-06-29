const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTableSchema() {
  try {
    console.log('🔍 检查login_logs表结构...')

    // 尝试查询表结构信息
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ 查询失败:', error)
      return
    }

    console.log('✅ 表可以访问')

    // 查看一条记录来了解字段结构
    if (data && data.length > 0) {
      console.log('\n📋 表字段结构（基于现有记录）:')
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof data[0][key]} (${data[0][key] === null ? 'null' : 'has value'})`)
      })
    } else {
      console.log('⚠️  表中没有数据，无法检查字段结构')
    }

    // 手动测试简单更新
    console.log('\n🧪 测试简单更新操作...')
    
    // 获取最新的一条记录
    const { data: latestRecord } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (latestRecord) {
      console.log('📝 找到测试记录:', latestRecord.id)
      
      // 尝试只更新logout_time字段
      const testLogoutTime = new Date().toISOString()
      
      const { error: simpleUpdateError } = await supabase
        .from('login_logs')
        .update({ logout_time: testLogoutTime })
        .eq('id', latestRecord.id)

      if (simpleUpdateError) {
        console.error('❌ 简单更新失败:', simpleUpdateError)
      } else {
        console.log('✅ 简单更新成功')
        
        // 验证更新
        const { data: updatedRecord } = await supabase
          .from('login_logs')
          .select('logout_time')
          .eq('id', latestRecord.id)
          .single()

        console.log('📅 更新后的登出时间:', updatedRecord?.logout_time)
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error)
  }
}

checkTableSchema() 