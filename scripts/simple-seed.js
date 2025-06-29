const { createClient } = require('@supabase/supabase-js')

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleSeed() {
  try {
    console.log('🌱 开始简单数据填充...')

    // 1. 创建基本用户数据
    console.log('👥 创建示例用户...')
    const users = [
      {
        email: 'sarah.chen@example.com',
        full_name: 'Sarah Chen',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'mike.johnson@example.com',
        full_name: 'Mike Johnson',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'emma.wilson@example.com',
        full_name: 'Emma Wilson',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'alex.zhang@example.com',
        full_name: 'Alex Zhang',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'lisa.park@example.com',
        full_name: 'Lisa Park',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // 只有在用户不存在时才创建
    for (const user of users) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', user.email)
        .single()

      if (!existingUser) {
        const { error } = await supabase
          .from('users')
          .insert([user])

        if (error) {
          console.error(`❌ 创建用户 ${user.email} 失败:`, error.message)
        } else {
          console.log(`✅ 创建用户: ${user.full_name}`)
        }
      } else {
        console.log(`⏭️ 用户已存在: ${user.full_name}`)
      }
    }

    // 2. 检查当前数据
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: imageCount } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true })

    console.log('\n📊 当前数据库状态:')
    console.log(`- 用户总数: ${userCount || 0}`)
    console.log(`- 图片总数: ${imageCount || 0}`)

    console.log('🎉 数据填充完成！现在Dashboard将显示真实数据。')

  } catch (error) {
    console.error('❌ 简单填充失败:', error)
  }
}

// 运行脚本
simpleSeed() 