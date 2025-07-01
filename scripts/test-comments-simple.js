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

async function testCommentsSimple() {
  console.log('🔍 测试最简单的评论表查询...');
  
  try {
    // 最简单的查询
    const { data: comments, error } = await supabase
      .from('image_comments')
      .select('id, content, created_at')
      .limit(3);
    
    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }
    
    console.log('✅ 查询成功！');
    console.log(`找到 ${comments?.length || 0} 条评论:`);
    console.log(comments || []);
    
    // 测试计数
    const { count, error: countError } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 计数查询失败:', countError);
    } else {
      console.log(`✅ 总评论数: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

testCommentsSimple(); 