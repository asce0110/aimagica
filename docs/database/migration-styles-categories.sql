-- ===============================================
-- Styles Category Migration Script
-- 将现有的styles表从旧分类迁移到新分类
-- 请在 Supabase SQL Editor 中运行
-- ===============================================

-- 1. 首先删除现有的CHECK约束
ALTER TABLE styles DROP CONSTRAINT IF EXISTS styles_category_check;

-- 2. 修改category字段长度以支持更长的分类名称
ALTER TABLE styles ALTER COLUMN category TYPE VARCHAR(50);

-- 3. 添加新的CHECK约束
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
  'vintage-retro'
));

-- 4. 迁移现有数据的分类映射
UPDATE styles SET category = 'photographic-realism' WHERE category = 'photography';
UPDATE styles SET category = 'illustration-digital-painting' WHERE category = 'art';
UPDATE styles SET category = 'anime-comics' WHERE category = 'anime';
UPDATE styles SET category = 'vintage-retro' WHERE category = 'vintage';
UPDATE styles SET category = 'concept-art' WHERE category = 'modern';
-- abstract 保持不变

-- 5. 清空现有示例数据并插入新的分类示例
DELETE FROM styles;

-- 6. 插入新的示例数据
INSERT INTO styles (name, description, emoji, prompt_template, type, category, is_premium, is_active, sort_order) VALUES
('Photorealistic Portrait', 'Ultra-realistic photographic style with professional lighting', '📸', '{prompt}, photorealistic, professional photography, high quality, detailed, studio lighting', 'image', 'photographic-realism', false, true, 1),
('Digital Painting', 'Modern digital artwork with painterly textures', '🎨', '{prompt}, digital painting, artistic, detailed brushwork, vibrant colors', 'image', 'illustration-digital-painting', false, true, 2),
('Anime Style', 'Japanese anime artwork with vibrant colors and detailed characters', '🌸', '{prompt}, anime style, vibrant colors, detailed artwork, manga inspired', 'image', 'anime-comics', false, true, 3),
('Game Concept Art', 'Professional concept art for games and films', '🎭', '{prompt}, concept art, game design, cinematic, professional artwork', 'image', 'concept-art', true, true, 4),
('3D Rendered', 'High-quality 3D rendered artwork with realistic materials', '🧊', '{prompt}, 3d render, octane render, realistic materials, high quality', 'image', '3d-render', true, true, 5),
('Abstract Modern', 'Contemporary abstract art with bold forms and colors', '🌀', '{prompt}, abstract art, modern, contemporary, bold colors, geometric forms', 'image', 'abstract', false, true, 6),
('Impressionist', 'Classic impressionist painting style', '🖼️', '{prompt}, impressionist style, oil painting, soft brushstrokes, classic art', 'image', 'fine-art-movements', false, true, 7),
('Technical Illustration', 'Precise technical and scientific illustration', '🔬', '{prompt}, technical illustration, scientific diagram, precise, detailed, clean lines', 'image', 'technical-scientific', true, true, 8),
('Architectural Visualization', 'Professional architectural and interior design visualization', '🏗️', '{prompt}, architectural visualization, interior design, professional rendering', 'image', 'architecture-interior', true, true, 9),
('Commercial Design', 'Professional commercial and advertising artwork', '💼', '{prompt}, commercial design, advertising, professional, clean, modern', 'image', 'design-commercial', true, true, 10),
('Fantasy Art', 'Fantasy and genre-driven artistic style', '🎪', '{prompt}, fantasy art, magical, mystical, detailed fantasy illustration', 'image', 'genre-driven', false, true, 11),
('Vintage Retro', 'Classic vintage and retro aesthetic', '📻', '{prompt}, vintage style, retro aesthetic, classic design, nostalgic', 'image', 'vintage-retro', false, true, 12);

-- 7. 验证迁移结果
SELECT 
  category, 
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY sort_order) as style_names
FROM styles 
WHERE is_active = true
GROUP BY category 
ORDER BY category; 