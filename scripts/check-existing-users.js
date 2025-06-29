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

async function checkExistingUsers() {
  console.log('🔍 查看现有用户...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .limit(5);
    
    if (error) {
      console.error('❌ 查询用户失败:', error);
      return;
    }
    
    console.log('现有用户:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.full_name}) - ID: ${user.id}`);
    });
    
    if (users.length > 0) {
      console.log(`\n建议使用第一个用户ID作为匿名用户: ${users[0].id}`);
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

checkExistingUsers(); 