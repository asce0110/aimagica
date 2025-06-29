const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAdminConfig() {
  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
  
  console.log('管理员配置数据:', JSON.stringify(data, null, 2))
  if (error) console.log('错误:', error)
}

checkAdminConfig() 