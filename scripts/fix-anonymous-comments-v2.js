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

async function fixAnonymousCommentsV2() {
  console.log('🔧 修复匿名评论支持 - V2...');
  
  const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
  const OLD_PROBLEMATIC_ID = 'e9857b43-8793-4ee6-9309-4ed9c1bbb0b0';
  
  try {
    // 1. 检查当前状态
    console.log('1️⃣ 检查当前评论状态...');
    
    const { count: totalComments } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true });
    
    const { count: problematicComments } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', OLD_PROBLEMATIC_ID);
    
    console.log(`总评论数: ${totalComments}`);
    console.log(`问题评论数 (使用Sarah Chen ID): ${problematicComments}`);
    
    // 2. 将问题评论更新为正确的匿名用户ID
    if (problematicComments > 0) {
      console.log('2️⃣ 更新问题评论为匿名评论...');
      
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
    } else {
      console.log('2️⃣ 没有需要修复的问题评论');
    }
    
    // 3. 验证修复结果
    console.log('3️⃣ 验证修复结果...');
    
    const { count: anonymousCount } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ANONYMOUS_USER_ID);
    
    const { count: remainingProblematic } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', OLD_PROBLEMATIC_ID);
    
    const { count: realUserComments } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .neq('user_id', ANONYMOUS_USER_ID)
      .neq('user_id', OLD_PROBLEMATIC_ID);
    
    console.log(`✅ 匿名评论数量: ${anonymousCount}`);
    console.log(`✅ 真实用户评论数量: ${realUserComments}`);
    console.log(`✅ 剩余问题评论数量: ${remainingProblematic}`);
    
    // 4. 显示一些示例匿名评论
    console.log('4️⃣ 显示匿名评论示例...');
    
    const { data: sampleAnonymous, error: sampleError } = await supabase
      .from('image_comments')
      .select('id, content, created_at')
      .eq('user_id', ANONYMOUS_USER_ID)
      .limit(3);
    
    if (sampleError) {
      console.error('❌ 获取示例评论失败:', sampleError);
    } else {
      console.log('匿名评论示例:');
      sampleAnonymous.forEach(comment => {
        console.log(`  - ${comment.content.substring(0, 50)}...`);
      });
    }
    
    console.log('\n🎉 匿名评论修复完成！');
    console.log('现在匿名用户评论会正确显示为 "Anonymous User"');
    console.log('Google登录用户的评论会显示正确的用户名和头像');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixAnonymousCommentsV2(); 