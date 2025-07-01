require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('🔍 检查用户表数据...');
  
  // 检查用户表
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, google_id')
    .limit(5);
  
  if (error) {
    console.error('❌ 查询用户失败:', error);
  } else {
    console.log('👥 用户表数据:');
    users.forEach((user, i) => {
      console.log(`  ${i+1}. ID: ${user.id}`);
      console.log(`     Email: ${user.email}`);  
      console.log(`     Name: ${user.full_name}`);
      console.log(`     Google ID: ${user.google_id}`);
      console.log('');
    });
  }
  
  // 检查图片表的用户ID
  const { data: images, error: imgError } = await supabase
    .from('generated_images')
    .select('id, user_id, prompt')
    .limit(5);
    
  if (imgError) {
    console.error('❌ 查询图片失败:', imgError);
  } else {
    console.log('🖼️ 图片表数据:');
    images.forEach((img, i) => {
      console.log(`  ${i+1}. Image ID: ${img.id}`);
      console.log(`     User ID: ${img.user_id}`);
      console.log(`     Prompt: ${img.prompt?.substring(0, 50)}...`);
      console.log('');
    });
  }
  
  // 检查两个表的关联
  if (users.length > 0 && images.length > 0) {
    console.log('🔗 检查用户ID匹配:');
    const userIds = users.map(u => u.id);
    const imageUserIds = images.map(i => i.user_id);
    
    console.log('用户表ID:', userIds);
    console.log('图片表用户ID:', imageUserIds);
    
    const matches = imageUserIds.filter(id => userIds.includes(id));
    console.log('匹配的ID:', matches);
  }
}

checkUsers().catch(console.error); 