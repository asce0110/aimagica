const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function showMigrationSQL() {
  const sql = `
-- ===============================================
-- 添加评论功能和浏览量统计
-- ===============================================

-- 1. 为 generated_images 表添加浏览量字段
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. 创建图片评论表
CREATE TABLE IF NOT EXISTS public.image_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建评论点赞表
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.image_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_generated_images_view_count ON generated_images(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_image_comments_image_id ON public.image_comments(image_id);
CREATE INDEX IF NOT EXISTS idx_image_comments_created_at ON public.image_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- 5. 创建更新评论点赞数的函数
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON public.comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

DROP TRIGGER IF EXISTS trigger_image_comments_updated_at ON public.image_comments;
CREATE TRIGGER trigger_image_comments_updated_at
    BEFORE UPDATE ON public.image_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 设置行级安全策略
ALTER TABLE public.image_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "comments_select_all" ON public.image_comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.image_comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.image_comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.image_comments;
DROP POLICY IF EXISTS "comment_likes_select_all" ON public.comment_likes;
DROP POLICY IF EXISTS "comment_likes_insert_own" ON public.comment_likes;
DROP POLICY IF EXISTS "comment_likes_delete_own" ON public.comment_likes;

-- 评论表安全策略
CREATE POLICY "comments_select_all" ON public.image_comments
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON public.image_comments
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "comments_update_own" ON public.image_comments
    FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "comments_delete_own" ON public.image_comments
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 评论点赞表安全策略
CREATE POLICY "comment_likes_select_all" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert_own" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "comment_likes_delete_own" ON public.comment_likes
    FOR DELETE USING (auth.uid()::uuid = user_id);

-- 管理员策略
CREATE POLICY "admin_select_all_comments" ON public.image_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'asce3801@gmail.com')
        )
    );

CREATE POLICY "admin_select_all_comment_likes" ON public.comment_likes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()::uuid 
            AND u.email IN ('admin@aimagica.com', 'asce3801@gmail.com')
        )
    );
`;
  
  console.log(sql)
}

async function executeMigration() {
  try {
    console.log('🚀 开始数据库迁移检查...')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ 环境变量未找到')
      console.log('\n请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
      console.log('\n=== 数据库迁移SQL ===')
      showMigrationSQL()
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // 检查连接
    const { data: testData, error: testError } = await supabase
      .from('generated_images')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message)
      console.log('\n请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
      console.log('\n=== 数据库迁移SQL ===')
      showMigrationSQL()
      return
    }
    
    console.log('✅ 数据库连接成功')
    console.log('\n📝 请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
    console.log('\n=== 数据库迁移SQL ===')
    showMigrationSQL()
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message)
    console.log('\n请在Supabase Dashboard的SQL Editor中手动执行以下SQL:')
    console.log('\n=== 数据库迁移SQL ===')
    showMigrationSQL()
  }
}

executeMigration()