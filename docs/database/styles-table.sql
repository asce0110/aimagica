-- 创建风格表
CREATE TABLE IF NOT EXISTS styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    emoji VARCHAR(10) DEFAULT '🎨',
    image_url TEXT,
    prompt_template TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'both')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('photographic-realism', 'illustration-digital-painting', 'anime-comics', 'concept-art', '3d-render', 'abstract', 'fine-art-movements', 'technical-scientific', 'architecture-interior', 'design-commercial', 'genre-driven', 'vintage-retro')),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_styles_type ON styles(type);
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_active ON styles(is_active);
CREATE INDEX IF NOT EXISTS idx_styles_sort_order ON styles(sort_order);

-- 插入一些示例数据
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

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER styles_updated_at_trigger
    BEFORE UPDATE ON styles
    FOR EACH ROW
    EXECUTE FUNCTION update_styles_updated_at(); 