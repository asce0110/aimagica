require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAdminAPI() {
  console.log('🔍 调试admin images API逻辑...');
  
  // 模拟API的查询逻辑
  console.log('1. 获取图片数据...');
  const { data: allImages, error: imagesError } = await supabase
    .from('generated_images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (imagesError) {
    console.error('❌ 查询图片失败:', imagesError);
    return;
  }
  
  console.log(`📊 找到 ${allImages.length} 张图片`);
  
  // 获取唯一用户ID
  const userIds = [...new Set(allImages.map(img => img.user_id))];
  console.log('2. 唯一用户ID:', userIds);
  
  // 查询用户信息
  console.log('3. 查询用户信息...');
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds);
  
  if (userError) {
    console.error('❌ 查询用户失败:', userError);
  } else {
    console.log(`✅ 找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`   - ${user.id}: ${user.full_name} (${user.email})`);
    });
  }
  
  // 创建用户映射
  const userMap = (users || []).reduce((acc, user) => {
    acc[user.id] = user.full_name || user.email?.split('@')[0] || 'Unknown User';
    return acc;
  }, {});
  
  console.log('4. 用户映射表:', userMap);
  
  // 测试几个图片的用户名解析
  console.log('5. 前3张图片的用户名解析:');
  allImages.slice(0, 3).forEach((image, i) => {
    const userName = userMap[image.user_id] || 'Unknown User';
    console.log(`   图片 ${i+1}: user_id=${image.user_id} => user_name="${userName}"`);
  });
}

debugAdminAPI().catch(console.error); 