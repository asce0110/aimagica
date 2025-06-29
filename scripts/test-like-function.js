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

async function testLikeFunction() {
  console.log('🔍 测试点赞功能...');
  
  try {
    const imageId = '0511fe1d-84ed-4fe2-b7c3-ac45ec825920';
    const userId = 'e9857b43-8793-4ee6-9309-4ed9c1bbb0b0';
    
    console.log(`📝 为用户 ${userId} 在图片 ${imageId} 上测试点赞...`);
    
    // 检查现有点赞
    const { data: existingLike, error: checkError } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查现有点赞失败:', checkError);
      return;
    }
    
    console.log('现有点赞状态:', existingLike ? '已点赞' : '未点赞');
    
    if (existingLike) {
      // 取消点赞
      console.log('🗑️ 取消点赞...');
      const { error: deleteError } = await supabase
        .from('image_likes')
        .delete()
        .eq('image_id', imageId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('❌ 取消点赞失败:', deleteError);
      } else {
        console.log('✅ 成功取消点赞');
      }
    } else {
      // 添加点赞
      console.log('❤️ 添加点赞...');
      const { error: insertError } = await supabase
        .from('image_likes')
        .insert({
          image_id: imageId,
          user_id: userId
        });
      
      if (insertError) {
        console.error('❌ 添加点赞失败:', insertError);
      } else {
        console.log('✅ 成功添加点赞');
      }
    }
    
    // 再次检查状态
    const { data: finalLike, error: finalError } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', userId)
      .single();
    
    if (finalError && finalError.code !== 'PGRST116') {
      console.error('❌ 最终检查失败:', finalError);
    } else {
      console.log('最终点赞状态:', finalLike ? '已点赞' : '未点赞');
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

testLikeFunction(); 