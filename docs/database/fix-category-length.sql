-- ===============================================
-- 修复Category字段长度问题
-- 请在 Supabase SQL Editor 中按顺序运行
-- ===============================================

-- 1. 首先删除现有的CHECK约束（如果存在）
ALTER TABLE styles DROP CONSTRAINT IF EXISTS styles_category_check;

-- 2. 扩展category字段长度
ALTER TABLE styles ALTER COLUMN category TYPE VARCHAR(50);

-- 3. 添加新的CHECK约束（包含所有12种新分类）
ALTER TABLE styles ADD CONSTRAINT styles_category_check 
CHECK (category IN (
  'photographic-realism', 
  'illustration-digital-painting', 
  'anime-comics', 
  'concept-art', 
  '3d-render', 
  'abstract', 
  'fine-art-movements', 
  'technical-scientific', 
  'architecture-interior', 
  'design-commercial', 
  'genre-driven', 
  'vintage-retro',
  -- 保留旧分类以防万一
  'art', 
  'photography', 
  'anime', 
  'vintage', 
  'modern'
));

-- 4. 验证字段修改成功
SELECT 
  column_name, 
  data_type, 
  character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'styles' AND column_name = 'category';

-- 5. 显示当前表中的数据（如果有的话）
SELECT id, name, category, is_active FROM styles ORDER BY sort_order; 