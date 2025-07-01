-- ===============================================
-- 安全的Category数据迁移脚本
-- 请在运行 fix-category-length.sql 之后执行
-- ===============================================

-- 1. 备份现有数据（可选）
-- CREATE TABLE styles_backup AS SELECT * FROM styles;

-- 2. 将现有数据映射到新分类
UPDATE styles SET category = 'photographic-realism' WHERE category = 'photography';
UPDATE styles SET category = 'illustration-digital-painting' WHERE category = 'art';
UPDATE styles SET category = 'anime-comics' WHERE category = 'anime';
UPDATE styles SET category = 'vintage-retro' WHERE category = 'vintage';
UPDATE styles SET category = 'concept-art' WHERE category = 'modern';
-- abstract 保持不变

-- 3. 显示迁移后的数据
SELECT 
  category,
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY sort_order) as style_names
FROM styles 
GROUP BY category 
ORDER BY category;

-- 4. 如果需要插入新的示例数据，先清空表
-- DELETE FROM styles;

-- 5. 插入完整的12种分类示例数据
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
('Vintage Retro', 'Classic vintage and retro aesthetic', '📻', '{prompt}, vintage style, retro aesthetic, classic design, nostalgic', 'image', 'vintage-retro', false, true, 12)
ON CONFLICT (id) DO NOTHING;

-- 6. 验证最终结果
SELECT 
  category,
  COUNT(*) as total_styles,
  COUNT(CASE WHEN is_premium = false THEN 1 END) as free_styles,
  COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_styles
FROM styles 
WHERE is_active = true
GROUP BY category 
ORDER BY category;

-- 7. 显示所有样式
SELECT id, name, category, emoji, is_premium, is_active, sort_order 
FROM styles 
ORDER BY sort_order; 