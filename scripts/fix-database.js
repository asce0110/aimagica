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

async function fixDatabase() {
  try {
    console.log('🔧 开始修复数据库...')

    // 1. 检查并创建管理员配置
    console.log('👑 设置管理员权限...')
    
    // 先检查管理员是否已存在
    const { data: existingAdmin } = await supabase
      .from('admin_config')
      .select('*')
      .eq('email', 'asce3801@gmail.com')
      .single()

    if (!existingAdmin) {
      const { error: adminError } = await supabase
        .from('admin_config')
        .insert({
          email: 'asce3801@gmail.com',
          is_admin: true,
          created_at: new Date().toISOString()
        })

      if (adminError) {
        console.error('❌ 创建管理员配置失败:', adminError)
      } else {
        console.log('✅ 管理员配置创建成功: asce3801@gmail.com')
      }
    } else {
      console.log('⏭️ 管理员配置已存在: asce3801@gmail.com')
    }

    // 2. 检查当前登录的用户是否在数据库中
    console.log('👤 检查当前用户...')
    
    const testEmails = ['asce3801@gmail.com', 'sakami55@gmail.com']
    
    for (const email of testEmails) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (!user) {
        console.log(`🆕 创建用户: ${email}`)
        
        const { error: userError } = await supabase
          .from('users')
          .insert({
            email: email,
            full_name: email === 'asce3801@gmail.com' ? 'Asce Admin' : 'Test User',
            created_at: new Date().toISOString()
          })

        if (userError) {
          console.error(`❌ 创建用户失败 ${email}:`, userError.message)
        } else {
          console.log(`✅ 用户创建成功: ${email}`)
        }
      } else {
        console.log(`⏭️ 用户已存在: ${email}`)
      }
    }

    // 3. 检查数据库状态
    console.log('📊 检查数据库状态...')
    
    const tables = ['users', 'admin_config', 'generated_images', 'user_subscriptions']
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        console.log(`- ${table}: ${count || 0} 条记录`)
      } catch (error) {
        console.error(`❌ 查询 ${table} 失败:`, error.message)
      }
    }

    // 4. 修复图片API字段问题
    console.log('🖼️ 检查图片表字段...')
    
    try {
      const { data: imageFields } = await supabase
        .from('generated_images')
        .select('id, prompt, style, status, view_count, created_at, user_id')
        .limit(1)
      
      console.log('✅ 图片表字段检查正常')
    } catch (error) {
      console.error('❌ 图片表字段问题:', error.message)
    }

    console.log('\n🎉 数据库修复完成！')
    console.log('\n📝 后续步骤:')
    console.log('1. 重新登录以测试用户同步')
    console.log('2. 检查Dashboard是否显示真实数据')
    console.log('3. 确认管理员权限正常工作')

  } catch (error) {
    console.error('❌ 数据库修复失败:', error)
  }
}

// 运行脚本
fixDatabase() 