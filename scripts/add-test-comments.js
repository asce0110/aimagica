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

async function addTestComments() {
  console.log('🔍 添加测试评论数据...');
  
  try {
    // 获取一个用户ID和图片ID
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ 获取用户失败:', usersError);
      return;
    }
    
    const { data: images, error: imagesError } = await supabase
      .from('generated_images')
      .select('id, generated_image_url')
      .eq('is_public', true)
      .limit(1);
    
    if (imagesError || !images || images.length === 0) {
      console.error('❌ 获取图片失败:', imagesError);
      return;
    }
    
    const userId = users[0].id;
    const imageId = images[0].id;
    
    console.log(`📝 为用户 ${users[0].email} 在图片 ${imageId} 上添加评论...`);
    
    // 添加几条测试评论
    const testComments = [
      'This is an amazing artwork! Love the style and composition.',
      'The color palette is fantastic. Really inspiring work!',
      'Great job on this piece. The details are incredible.',
      'Beautiful creation! This gives me so many ideas.',
      'Wow, the lighting in this image is perfect!'
    ];
    
    for (let i = 0; i < testComments.length; i++) {
      const { data: comment, error: commentError } = await supabase
        .from('image_comments')
        .insert({
          user_id: userId,
          image_id: imageId,
          content: testComments[i],
          likes_count: Math.floor(Math.random() * 10) // 随机点赞数
        })
        .select('id, content, likes_count')
        .single();
      
      if (commentError) {
        console.error(`❌ 添加评论 ${i + 1} 失败:`, commentError);
      } else {
        console.log(`✅ 添加评论 ${i + 1}:`, comment.content.substring(0, 30) + '...');
      }
      
      // 添加小延迟以确保created_at时间不同
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 查询添加的评论
    console.log('\n🔍 查询添加的评论...');
    const { data: allComments, error: queryError } = await supabase
      .from('image_comments')
      .select('id, content, likes_count, created_at')
      .eq('image_id', imageId)
      .order('created_at', { ascending: false });
    
    if (queryError) {
      console.error('❌ 查询评论失败:', queryError);
    } else {
      console.log(`✅ 成功添加 ${allComments?.length || 0} 条评论:`);
      allComments?.forEach((comment, index) => {
        console.log(`  ${index + 1}. ${comment.content.substring(0, 50)}... (${comment.likes_count} likes)`);
      });
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

addTestComments(); 