require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkRLSPolicies() {
  console.log('检查image_comments表的RLS策略...');
  
  try {
    // 查看RLS策略
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'image_comments');
    
    if (policyError) {
      console.error('查询策略失败:', policyError);
    } else {
      console.log('image_comments表的RLS策略:', policies);
    }
    
    // 测试简单查询
    console.log('\n测试简单查询...');
    
    // 首先用服务key查询
    const { data: rawData, error: rawError } = await supabase
      .from('image_comments')
      .select('id, content')
      .limit(1);
    
    if (rawError) {
      console.error('服务key查询失败:', rawError);
    } else {
      console.log('服务key查询成功:', rawData);
    }
    
    // 测试包含user查询
    console.log('\n测试包含user查询...');
    const { data: userData, error: userError } = await supabase
      .from('image_comments')
      .select(`
        id,
        content,
        users (
          id,
          username
        )
      `)
      .limit(1);
    
    if (userError) {
      console.error('包含user查询失败:', userError);
    } else {
      console.log('包含user查询成功:', userData);
    }
    
  } catch (error) {
    console.error('脚本执行失败:', error);
  }
}

checkRLSPolicies(); 