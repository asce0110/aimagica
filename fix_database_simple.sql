-- 简化的数据库修复脚本
-- 先查看表结构，然后逐步修复

-- 1. 查看当前表结构和user_id字段类型
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'generated_images'
ORDER BY ordinal_position;

-- 2. 查看当前的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'generated_images';

-- 3. 添加缺失的列（如果不存在）
DO $$
BEGIN
  -- Add r2_key column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'generated_images' AND column_name = 'r2_key') THEN
    ALTER TABLE generated_images ADD COLUMN r2_key VARCHAR(500);
    RAISE NOTICE 'Added r2_key column';
  END IF;
  
  -- Add original_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'generated_images' AND column_name = 'original_url') THEN
    ALTER TABLE generated_images ADD COLUMN original_url TEXT;
    RAISE NOTICE 'Added original_url column';
  END IF;
  
  -- Ensure generated_image_url column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'generated_images' AND column_name = 'generated_image_url') THEN
    ALTER TABLE generated_images ADD COLUMN generated_image_url TEXT;
    RAISE NOTICE 'Added generated_image_url column';
  END IF;
END $$;

-- 4. 暂时禁用RLS来简化问题排查
ALTER TABLE generated_images DISABLE ROW LEVEL SECURITY;

-- 5. 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert own images" ON generated_images;
DROP POLICY IF EXISTS "Users can update own images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete own images" ON generated_images;
DROP POLICY IF EXISTS "Allow all for service role" ON generated_images;
DROP POLICY IF EXISTS "Public images are viewable" ON generated_images;
DROP POLICY IF EXISTS "Users can manage own images" ON generated_images;

-- 6. 重新启用RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- 7. 创建最基本的策略先测试
CREATE POLICY "Allow all for service role" ON generated_images
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. 创建公共图片查看策略（简单版）
CREATE POLICY "Public images are viewable" ON generated_images
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- 9. 最后再查看表结构确认
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_images'
ORDER BY ordinal_position; 