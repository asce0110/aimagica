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

async function createAnonymousUserAndFix() {
  console.log('🔧 创建匿名用户并修复评论...');
  
  const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
  const OLD_PROBLEMATIC_ID = 'e9857b43-8793-4ee6-9309-4ed9c1bbb0b0';
  
  try {
    // 1. 创建匿名用户记录
    console.log('1️⃣ 创建匿名用户记录...');
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', ANONYMOUS_USER_ID)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // 用户不存在，创建匿名用户
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: ANONYMOUS_USER_ID,
          email: 'anonymous@example.com',
          full_name: 'Anonymous User',
          avatar_url: '/placeholder.svg?height=40&width=40&text=A',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (createError) {
        console.error('❌ 创建匿名用户失败:', createError);
        return;
      } else {
        console.log('✅ 匿名用户创建成功:', newUser);
      }
    } else if (existingUser) {
      console.log('✅ 匿名用户已存在');
    } else {
      console.error('❌ 检查匿名用户失败:', checkError);
      return;
    }
    
    // 2. 将问题评论更新为匿名评论
    console.log('2️⃣ 将问题评论更新为匿名评论...');
    
    const { count: problematicComments } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', OLD_PROBLEMATIC_ID);
    
    console.log(`需要修复的评论数: ${problematicComments}`);
    
    if (problematicComments > 0) {
      const { data: updateResult, error: updateError } = await supabase
        .from('image_comments')
        .update({ user_id: ANONYMOUS_USER_ID })
        .eq('user_id', OLD_PROBLEMATIC_ID)
        .select();
      
      if (updateError) {
        console.error('❌ 更新评论失败:', updateError);
      } else {
        console.log(`✅ 成功将 ${updateResult?.length || 0} 条评论转为匿名评论`);
      }
    }
    
    // 3. 验证修复结果
    console.log('3️⃣ 验证修复结果...');
    
    const { count: anonymousCount } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ANONYMOUS_USER_ID);
    
    const { count: realUserComments } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .neq('user_id', ANONYMOUS_USER_ID);
    
    console.log(`✅ 匿名评论数量: ${anonymousCount}`);
    console.log(`✅ 真实用户评论数量: ${realUserComments}`);
    
    // 4. 测试评论查询
    console.log('4️⃣ 测试评论查询...');
    
    const { data: testComments, error: testError } = await supabase
      .from('image_comments')
      .select(`
        id,
        content,
        user_id,
        users!inner(full_name, avatar_url)
      `)
      .eq('user_id', ANONYMOUS_USER_ID)
      .limit(2);
    
    if (testError) {
      console.error('❌ 测试查询失败:', testError);
    } else {
      console.log('✅ 匿名评论测试查询成功:');
      testComments.forEach(comment => {
        console.log(`  - "${comment.content.substring(0, 30)}..." by ${comment.users.full_name}`);
      });
    }
    
    console.log('\n🎉 匿名用户创建和评论修复完成！');
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

createAnonymousUserAndFix(); 