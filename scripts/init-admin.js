// 管理员账户初始化脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// 调试环境变量
console.log('🔍 检查环境变量...')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置')
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase 环境变量未正确配置！')
  console.log('\n请确保 .env.local 文件包含以下变量：')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function initAdmin() {
  console.log('🚀 开始初始化管理员账号...')
  
  try {
    // 管理员账号信息
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000001', // 固定UUID，方便识别
      email: 'admin@aimagica.com',
      full_name: 'AIMAGICA 管理员',
      avatar_url: null,
      subscription_tier: 'wizard',
      subscription_status: 'active',
      subscription_end_date: null, // 永久会员
      google_id: null,
      daily_render_count: 0,
      daily_rerender_count: 0,
      last_reset_date: new Date().toISOString().split('T')[0]
    }

    // 检查管理员是否已存在
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('email')
      .eq('email', adminUser.email)
      .single()

    if (existingAdmin) {
      console.log('✅ 管理员账号已存在:', adminUser.email)
      return
    }

    // 插入管理员账号
    const { data, error } = await supabase
      .from('users')
      .insert([adminUser])
      .select()

    if (error) {
      console.error('❌ 创建管理员账号失败:', error.message)
      return
    }

    console.log('✅ 管理员账号创建成功!')
    console.log('📧 邮箱:', adminUser.email)
    console.log('👑 权限等级:', adminUser.subscription_tier)
    console.log('🆔 UUID:', adminUser.id)

    // 初始化管理员统计数据
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert([{
        user_id: adminUser.id,
        total_renders: 0,
        total_rerenders: 0,
        total_downloads: 0,
        last_active: new Date().toISOString()
      }])

    if (statsError) {
      console.warn('⚠️ 创建管理员统计数据失败:', statsError.message)
    } else {
      console.log('📊 管理员统计数据初始化完成')
    }

    // 创建几个测试用户
    const testUsers = [
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'test1@aimagica.com',
        full_name: '测试用户 Pro',
        subscription_tier: 'pro',
        subscription_status: 'active'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'test2@aimagica.com', 
        full_name: '测试用户 Free',
        subscription_tier: 'free',
        subscription_status: 'active'
      }
    ]

    console.log('\n🧪 创建测试用户...')
    
    for (const testUser of testUsers) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', testUser.email)
        .single()

      if (!existingUser) {
        const { error: testError } = await supabase
          .from('users')
          .insert([{
            ...testUser,
            daily_render_count: 0,
            daily_rerender_count: 0,
            last_reset_date: new Date().toISOString().split('T')[0]
          }])

        if (testError) {
          console.warn(`⚠️ 创建测试用户失败 ${testUser.email}:`, testError.message)
        } else {
          console.log(`✅ 测试用户创建成功: ${testUser.email} (${testUser.subscription_tier})`)
          
          // 为测试用户创建统计数据
          await supabase
            .from('user_stats')
            .insert([{
              user_id: testUser.id,
              total_renders: Math.floor(Math.random() * 50),
              total_rerenders: Math.floor(Math.random() * 20),
              total_downloads: Math.floor(Math.random() * 30),
              last_active: new Date().toISOString()
            }])
        }
      } else {
        console.log(`✅ 测试用户已存在: ${testUser.email}`)
      }
    }

    console.log('\n🎉 初始化完成！')
    console.log('')
    console.log('🔐 管理员登录信息:')
    console.log('   邮箱: admin@aimagica.com')
    console.log('   权限: 最高管理员权限')
    console.log('   功能: 可访问所有管理后台功能')
    console.log('')
    console.log('🧪 测试账号:')
    console.log('   test1@aimagica.com (Pro会员)')
    console.log('   test2@aimagica.com (免费用户)')
    console.log('')

  } catch (error) {
    console.error('❌ 初始化过程出错:', error.message)
  }
}

// 执行初始化
initAdmin().catch(console.error) 