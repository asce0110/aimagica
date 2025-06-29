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

async function checkUsersStructure() {
  console.log('检查users表结构...');
  
  try {
    // 查看users表的一条记录来了解字段
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('查询users表失败:', userError);
    } else {
      console.log('users表示例记录:', userData);
      if (userData.length > 0) {
        console.log('users表字段:', Object.keys(userData[0]));
      }
    }
    
    // 尝试一些常见的用户名字段
    const possibleFields = ['username', 'name', 'display_name', 'email'];
    
    for (const field of possibleFields) {
      console.log(`\n测试字段: ${field}`);
      const { data, error } = await supabase
        .from('users')
        .select(`id, ${field}`)
        .limit(1);
      
      if (error) {
        console.log(`字段 ${field} 不存在:`, error.message);
      } else {
        console.log(`字段 ${field} 存在，示例数据:`, data);
      }
    }
    
  } catch (error) {
    console.error('脚本执行失败:', error);
  }
}

checkUsersStructure(); 