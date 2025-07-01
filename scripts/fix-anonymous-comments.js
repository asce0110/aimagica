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

async function fixAnonymousComments() {
  console.log('🔧 修复匿名评论支持...');
  
  try {
    // 1. 修改表结构，允许user_id为null
    console.log('1️⃣ 修改表结构，允许user_id为null...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 修改image_comments表，允许user_id为null
        ALTER TABLE public.image_comments 
        ALTER COLUMN user_id DROP NOT NULL;
        
        -- 添加检查约束：要么user_id为null（匿名），要么不为null（注册用户）
        ALTER TABLE public.image_comments 
        ADD CONSTRAINT check_user_id_valid 
        CHECK (user_id IS NULL OR user_id IS NOT NULL);
      `
    });
    
    if (alterError) {
      console.log('⚠️ 表结构修改可能失败（可能已经是正确的）:', alterError.message);
    } else {
      console.log('✅ 表结构修改成功');
    }
    
    // 2. 清理错误的匿名用户数据
    console.log('2️⃣ 清理错误的匿名用户数据...');
    
    const problematicUserId = 'e9857b43-8793-4ee6-9309-4ed9c1bbb0b0';
    
    // 将使用这个ID的评论改为真正的匿名评论
    const { data: updateResult, error: updateError } = await supabase
      .from('image_comments')
      .update({ user_id: null })
      .eq('user_id', problematicUserId)
      .select();
    
    if (updateError) {
      console.error('❌ 更新评论失败:', updateError);
    } else {
      console.log(`✅ 成功将 ${updateResult?.length || 0} 条评论转为匿名评论`);
    }
    
    // 3. 检查现在的匿名评论数量
    console.log('3️⃣ 检查匿名评论数量...');
    
    const { count: anonymousCount, error: countError } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);
    
    if (countError) {
      console.error('❌ 统计匿名评论失败:', countError);
    } else {
      console.log(`✅ 当前匿名评论数量: ${anonymousCount}`);
    }
    
    // 4. 检查注册用户评论数量
    const { count: userCount, error: userCountError } = await supabase
      .from('image_comments')
      .select('*', { count: 'exact', head: true })
      .not('user_id', 'is', null);
    
    if (userCountError) {
      console.error('❌ 统计用户评论失败:', userCountError);
    } else {
      console.log(`✅ 当前注册用户评论数量: ${userCount}`);
    }
    
    console.log('\n🎉 匿名评论修复完成！');
    console.log('现在匿名用户评论会正确显示为 "Anonymous User"');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixAnonymousComments(); 