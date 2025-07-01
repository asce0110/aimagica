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

async function testLike() {
  console.log('🔍 测试点赞功能...');
  
  const testImageId = '0511fe1d-84ed-4fe2-b7c3-ac45ec825920';
  const testUserId = 'cb3f3db6-fbce-4d13-8a6d-b202b9a98c12'; // Asce Admin的用户ID
  
  try {
    // 1. 检查现有点赞
    console.log('1️⃣ 检查现有点赞...');
    const { data: existingLike, error: checkError } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', testImageId)
      .eq('user_id', testUserId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查点赞失败:', checkError);
      return;
    }
    
    console.log('现有点赞状态:', existingLike ? '已点赞' : '未点赞');
    
    // 2. 尝试添加点赞
    if (!existingLike) {
      console.log('2️⃣ 添加点赞...');
      const { data: insertData, error: insertError } = await supabase
        .from('image_likes')
        .insert({
          image_id: testImageId,
          user_id: testUserId
        })
        .select();
      
      if (insertError) {
        console.error('❌ 添加点赞失败:', insertError);
      } else {
        console.log('✅ 添加点赞成功:', insertData);
      }
    } else {
      console.log('2️⃣ 删除已有点赞...');
      const { error: deleteError } = await supabase
        .from('image_likes')
        .delete()
        .eq('image_id', testImageId)
        .eq('user_id', testUserId);
      
      if (deleteError) {
        console.error('❌ 删除点赞失败:', deleteError);
      } else {
        console.log('✅ 删除点赞成功');
      }
    }
    
    // 3. 检查最终状态
    console.log('3️⃣ 检查最终状态...');
    const { data: finalLike, error: finalError } = await supabase
      .from('image_likes')
      .select('id')
      .eq('image_id', testImageId)
      .eq('user_id', testUserId)
      .single();
    
    if (finalError && finalError.code !== 'PGRST116') {
      console.error('❌ 最终检查失败:', finalError);
    } else {
      console.log('最终点赞状态:', finalLike ? '已点赞' : '未点赞');
    }
    
    // 4. 检查图片的总点赞数
    console.log('4️⃣ 检查图片总点赞数...');
    const { count: totalLikes, error: countError } = await supabase
      .from('image_likes')
      .select('*', { count: 'exact', head: true })
      .eq('image_id', testImageId);
    
    if (countError) {
      console.error('❌ 获取总点赞数失败:', countError);
    } else {
      console.log('图片总点赞数:', totalLikes);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testLike(); 