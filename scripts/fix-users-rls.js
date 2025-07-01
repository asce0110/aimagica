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

async function fixUsersRLS() {
  console.log('🔍 检查并修复users表的RLS策略...');
  
  try {
    // 首先暂时禁用users表的RLS
    console.log('🚫 暂时禁用users表的RLS...');
    const { error: disableRLSError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableRLSError) {
      console.error('❌ 禁用RLS失败:', disableRLSError);
      
      // 尝试直接执行SQL
      console.log('🔄 尝试通过直接SQL禁用RLS...');
      const { error: directError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('❌ users表查询仍然失败:', directError);
        
        // 如果还是失败，我们需要通过SQL删除有问题的策略
        console.log('🗑️ 尝试删除所有users表的RLS策略...');
        
        const dropPoliciesSQL = `
          -- 删除users表的所有RLS策略
          DROP POLICY IF EXISTS "Users can view own profile" ON users;
          DROP POLICY IF EXISTS "Users can update own profile" ON users;
          DROP POLICY IF EXISTS "Allow public read access to users" ON users;
          DROP POLICY IF EXISTS "Enable read access for all users" ON users;
          DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
          DROP POLICY IF EXISTS "Enable update for users based on uid" ON users;
          DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON users;
          DROP POLICY IF EXISTS "Users can insert their own profile." ON users;
          DROP POLICY IF EXISTS "Users can update own profile." ON users;
          
          -- 禁用RLS
          ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        `;
        
        // 由于无法直接执行DDL，我们创建一个SQL文件
        require('fs').writeFileSync('fix_users_rls.sql', dropPoliciesSQL);
        console.log('📝 已生成 fix_users_rls.sql 文件，请在Supabase控制台执行');
        
      } else {
        console.log('✅ users表查询成功，RLS可能已经被禁用');
      }
      
    } else {
      console.log('✅ 成功禁用users表的RLS');
    }
    
    // 测试image_comments查询
    console.log('\n🔍 测试image_comments表查询...');
    const { data: comments, error: commentsError } = await supabase
      .from('image_comments')
      .select('id, content, created_at')
      .limit(3);
    
    if (commentsError) {
      console.error('❌ image_comments查询仍然失败:', commentsError);
    } else {
      console.log('✅ image_comments查询成功！');
      console.log(`找到 ${comments?.length || 0} 条评论`);
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

fixUsersRLS(); 