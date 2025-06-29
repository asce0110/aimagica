require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissingUser() {
  const missingUserId = 'cb3f3db6-fbce-4d13-8a6d-b202b9a98c12';
  
  console.log(`🔍 查找用户ID: ${missingUserId}`);
  
  // 查找这个用户
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', missingUserId)
    .single();
  
  if (error) {
    console.log('❌ 用户不存在:', error.message);
    
    // 查看这个用户下有多少图片
    const { count } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', missingUserId);
    
    console.log(`📊 这个用户ID下有 ${count} 张图片`);
    
    // 检查认证表
    console.log('🔍 检查认证表...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ 查询认证表失败:', authError);
    } else {
      console.log('👥 认证表用户数量:', authUsers.users.length);
      const matchingAuthUser = authUsers.users.find(u => u.id === missingUserId);
      
      if (matchingAuthUser) {
        console.log('✅ 在认证表中找到用户:', {
          id: matchingAuthUser.id,
          email: matchingAuthUser.email,
          name: matchingAuthUser.user_metadata?.full_name || matchingAuthUser.user_metadata?.name
        });
        
        // 创建missing用户记录
        console.log('🔧 尝试创建缺失的用户记录...');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: matchingAuthUser.id,
            email: matchingAuthUser.email,
            full_name: matchingAuthUser.user_metadata?.full_name || matchingAuthUser.user_metadata?.name || 'Google User',
            google_id: matchingAuthUser.user_metadata?.provider_id,
            avatar_url: matchingAuthUser.user_metadata?.avatar_url
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ 创建用户失败:', createError);
        } else {
          console.log('✅ 成功创建用户记录:', newUser);
        }
      } else {
        console.log('❌ 认证表中也没有找到这个用户');
      }
    }
  } else {
    console.log('✅ 找到用户:', user);
  }
}

checkMissingUser().catch(console.error); 