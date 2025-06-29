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

async function showDatabaseOverview() {
  try {
    console.log('📊 AI Sketch Platform 数据库结构分析')
    console.log('=' .repeat(60))

    // 定义表结构和关系
    const tables = {
      'users': {
        description: '用户基础信息表',
        purpose: '存储用户的Google账号信息、订阅状态、头像等',
        keyFields: ['id', 'email', 'full_name', 'avatar_url', 'google_id'],
        relationships: [
          'user_subscriptions (一对一)',
          'generated_images (一对多)',
          'image_likes (一对多)', 
          'user_stats (一对一)',
          'login_logs (一对多)'
        ]
      },
             'admin_config': {
         description: '管理员权限配置表',
         purpose: '控制哪些用户具有管理员权限，支持动态管理',
         keyFields: ['email', 'role'],
         relationships: ['独立表，通过email关联users表']
       },
      'login_logs': {
        description: '登录日志表',
        purpose: '记录所有用户登录行为，用于安全审计和统计分析',
        keyFields: ['user_id', 'email', 'login_method', 'success', 'login_time'],
        relationships: ['通过user_id关联users表']
      },
      'user_subscriptions': {
        description: '用户订阅表',
        purpose: '管理用户的付费订阅状态（Free/Pro/Wizard）',
        keyFields: ['user_id', 'subscription_tier', 'subscription_status'],
        relationships: ['通过user_id关联users表 (一对一)']
      },
      'generated_images': {
        description: 'AI生成图片表',
        purpose: '存储用户生成的AI图片及元数据',
        keyFields: ['user_id', 'prompt', 'style', 'status', 'view_count'],
        relationships: ['通过user_id关联users表 (多对一)']
      },
      'image_likes': {
        description: '图片点赞表',
        purpose: '记录用户对图片的点赞行为',
        keyFields: ['user_id', 'image_id'],
        relationships: [
          '通过user_id关联users表',
          '通过image_id关联generated_images表'
        ]
      },
      'user_stats': {
        description: '用户统计表',
        purpose: '统计每个用户的使用数据（生成次数、下载次数等）',
        keyFields: ['user_id', 'total_renders', 'total_downloads'],
        relationships: ['通过user_id关联users表 (一对一)']
      }
    }

    // 显示表信息和数据统计
    for (const [tableName, tableInfo] of Object.entries(tables)) {
      console.log(`\n🗄️  ${tableName.toUpperCase()}`)
      console.log(`📝 ${tableInfo.description}`)
      console.log(`💡 作用: ${tableInfo.purpose}`)
      console.log(`🔑 关键字段: ${tableInfo.keyFields.join(', ')}`)
      console.log(`🔗 关联关系: ${tableInfo.relationships.join('; ')}`)
      
      // 查询数据统计
      try {
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        console.log(`📊 当前数据: ${count || 0} 条记录`)
        
        // 对于某些表，显示样例数据
                 if (tableName === 'admin_config' && count > 0) {
           const { data } = await supabase
             .from('admin_config')
             .select('email, role, created_at')
             .limit(5)
           
           console.log('   样例数据:')
           data?.forEach(item => {
             console.log(`   - ${item.email}: ${item.role === 'admin' ? '✅ 管理员' : '❌ 普通用户'}`)
           })
         }
        
        if (tableName === 'users' && count > 0) {
          const { data } = await supabase
            .from('users')
            .select('email, full_name, created_at')
            .limit(3)
          
          console.log('   样例数据:')
          data?.forEach(item => {
            console.log(`   - ${item.email} (${item.full_name || '无姓名'})`)
          })
        }
        
      } catch (error) {
        console.log(`❌ 无法查询 ${tableName}: ${error.message}`)
      }
      
      console.log('-'.repeat(50))
    }

    // 数据库整体状态
    console.log('\n📈 数据库整体状态')
    console.log('=' .repeat(30))
    
    try {
      // 用户统计
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
             // 管理员数量
       const { count: adminCount } = await supabase
         .from('admin_config')
         .select('*', { count: 'exact', head: true })
         .eq('role', 'admin')
      
      // 登录日志
      const { count: loginCount } = await supabase
        .from('login_logs')
        .select('*', { count: 'exact', head: true })
      
      // 生成图片
      const { count: imageCount } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })

      console.log(`👥 总用户数: ${userCount || 0}`)
      console.log(`👑 管理员数: ${adminCount || 0}`)
      console.log(`📝 登录记录: ${loginCount || 0}`)
      console.log(`🎨 生成图片: ${imageCount || 0}`)
      
      // 检查为什么login_logs为空
      if (loginCount === 0) {
        console.log('\n⚠️  登录日志为空的可能原因:')
        console.log('1. NextAuth配置中的createLoginLog可能没有被正确调用')
        console.log('2. 数据库权限问题导致日志写入失败')
        console.log('3. 登录过程中发生错误，跳过了日志记录')
        console.log('💡 建议: 重新登录一次，观察控制台日志')
      }
      
    } catch (error) {
      console.error('查询统计数据失败:', error)
    }

    console.log('\n🔄 表关系图:')
    console.log('users (核心表)')
    console.log('├── user_subscriptions (订阅信息)')
    console.log('├── generated_images (生成图片)')
    console.log('├── user_stats (使用统计)')
    console.log('├── login_logs (登录日志)')
    console.log('├── image_likes (点赞记录)')
    console.log('└── admin_config (权限配置，通过email关联)')

  } catch (error) {
    console.error('❌ 数据库分析失败:', error)
  }
}

// 运行分析
showDatabaseOverview() 