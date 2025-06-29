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

async function checkLikeTable() {
  console.log('🔍 检查image_likes表...');
  
  try {
    // 检查表是否存在
    const { data, error } = await supabase
      .from('image_likes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ image_likes表不存在或无法访问:', error);
      console.log('🛠️ 需要创建image_likes表');
      
      // 尝试创建表
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.image_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, image_id)
        );
        
        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON public.image_likes(user_id);
        CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON public.image_likes(image_id);
        
        -- 设置RLS
        ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;
        
        -- 创建RLS策略
        CREATE POLICY "Users can read all image likes" ON public.image_likes FOR SELECT USING (true);
        CREATE POLICY "Users can manage their own image likes" ON public.image_likes FOR ALL USING (user_id = auth.uid());
      `;
      
      console.log('🛠️ 执行创建表SQL...');
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
      
      if (createError) {
        console.error('❌ 创建表失败:', createError);
      } else {
        console.log('✅ image_likes表创建成功');
      }
      
    } else {
      console.log('✅ image_likes表存在，当前记录数:', data?.length || 0);
    }
    
    // 检查表结构
    console.log('\n🔍 检查表结构...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'image_likes');
    
    if (columnsError) {
      console.error('❌ 无法获取表结构:', columnsError);
    } else {
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkLikeTable(); 