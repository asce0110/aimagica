require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkApiConfigs() {
  console.log('🔍 检查API配置...')
  
  try {
    const { data: configs, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('type', 'image_generation')
      .order('priority', { ascending: true })

    if (error) {
      console.error('❌ 查询错误:', error)
      return
    }

    console.log('✅ 找到', configs.length, '个图片生成API配置:')
    configs.forEach((config, index) => {
      console.log(`\n${index + 1}. ${config.name}`)
      console.log(`   ID: ${config.id}`)
      console.log(`   Provider: ${config.provider}`)
      console.log(`   Model: ${config.model || 'N/A'}`)
      console.log(`   Active: ${config.is_active}`)
      console.log(`   Default: ${config.is_default}`)
      console.log(`   Priority: ${config.priority}`)
    })

    console.log('\n🎯 特别关注 Kie.ai 模型:')
    const kieModels = configs.filter(c => 
      c.provider?.toLowerCase().includes('kie') ||
      c.provider?.toLowerCase().includes('flux') ||
      c.model?.toLowerCase().includes('flux') ||
      c.name?.toLowerCase().includes('flux')
    )
    
    if (kieModels.length > 0) {
      kieModels.forEach(model => {
        console.log(`   - ${model.name}: ${model.provider} (model: ${model.model})`)
      })
    } else {
      console.log('   没有找到 Kie.ai 相关模型')
    }

  } catch (error) {
    console.error('❌ 检查失败:', error)
  }
}

checkApiConfigs() 