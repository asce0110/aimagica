-- ===============================================
-- 用户提示词系统 - 数据库迁移
-- 可以直接在 Supabase SQL Editor 中执行
-- ===============================================

-- 创建用户提示词表
CREATE TABLE IF NOT EXISTS user_prompts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT
);

-- 创建用户提示词点赞表
CREATE TABLE IF NOT EXISTS user_prompt_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES user_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, prompt_id)
);

-- 创建用户提示词使用记录表
CREATE TABLE IF NOT EXISTS user_prompt_uses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES user_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_id ON user_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_category ON user_prompts(category);
CREATE INDEX IF NOT EXISTS idx_user_prompts_status ON user_prompts(status);
CREATE INDEX IF NOT EXISTS idx_user_prompts_created_at ON user_prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_prompts_likes_count ON user_prompts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_prompts_uses_count ON user_prompts(uses_count DESC);

-- 创建更新likes_count的触发器函数
CREATE OR REPLACE FUNCTION update_prompt_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_prompts SET likes_count = likes_count + 1 WHERE id = NEW.prompt_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_prompts SET likes_count = likes_count - 1 WHERE id = OLD.prompt_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建更新uses_count的触发器函数
CREATE OR REPLACE FUNCTION update_prompt_uses_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_prompts SET uses_count = uses_count + 1 WHERE id = NEW.prompt_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新updated_at的触发器函数
CREATE OR REPLACE FUNCTION update_user_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加触发器
DROP TRIGGER IF EXISTS trigger_update_prompt_likes_count_insert ON user_prompt_likes;
CREATE TRIGGER trigger_update_prompt_likes_count_insert
    AFTER INSERT ON user_prompt_likes
    FOR EACH ROW EXECUTE FUNCTION update_prompt_likes_count();

DROP TRIGGER IF EXISTS trigger_update_prompt_likes_count_delete ON user_prompt_likes;
CREATE TRIGGER trigger_update_prompt_likes_count_delete
    AFTER DELETE ON user_prompt_likes
    FOR EACH ROW EXECUTE FUNCTION update_prompt_likes_count();

DROP TRIGGER IF EXISTS trigger_update_prompt_uses_count ON user_prompt_uses;
CREATE TRIGGER trigger_update_prompt_uses_count
    AFTER INSERT ON user_prompt_uses
    FOR EACH ROW EXECUTE FUNCTION update_prompt_uses_count();

DROP TRIGGER IF EXISTS trigger_update_user_prompts_updated_at ON user_prompts;
CREATE TRIGGER trigger_update_user_prompts_updated_at
    BEFORE UPDATE ON user_prompts
    FOR EACH ROW EXECUTE FUNCTION update_user_prompts_updated_at();

-- 启用行级安全策略
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_uses ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Anyone can view approved prompts" ON user_prompts;
DROP POLICY IF EXISTS "Users can view their own prompts" ON user_prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON user_prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON user_prompts;
DROP POLICY IF EXISTS "Admins can manage all prompts" ON user_prompts;
DROP POLICY IF EXISTS "Users can manage their own likes" ON user_prompt_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON user_prompt_likes;
DROP POLICY IF EXISTS "Users can record their own usage" ON user_prompt_uses;
DROP POLICY IF EXISTS "Users can view usage records" ON user_prompt_uses;
DROP POLICY IF EXISTS "Admins can view all usage records" ON user_prompt_uses;

-- 用户提示词策略
-- 所有人都可以查看已批准的提示词
CREATE POLICY "Anyone can view approved prompts" ON user_prompts
    FOR SELECT USING (status = 'approved');

-- 用户可以查看和管理自己的提示词
CREATE POLICY "Users can view their own prompts" ON user_prompts
    FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的提示词
CREATE POLICY "Users can insert their own prompts" ON user_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的提示词
CREATE POLICY "Users can update their own prompts" ON user_prompts
    FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以查看和管理所有提示词
CREATE POLICY "Admins can manage all prompts" ON user_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.is_admin = true
        )
    );

-- 点赞策略
CREATE POLICY "Users can manage their own likes" ON user_prompt_likes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON user_prompt_likes
    FOR SELECT USING (true);

-- 使用记录策略
CREATE POLICY "Users can record their own usage" ON user_prompt_uses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view usage records" ON user_prompt_uses
    FOR SELECT USING (true);

-- 管理员可以查看所有记录
CREATE POLICY "Admins can view all usage records" ON user_prompt_uses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.is_admin = true
        )
    );

-- 插入一些示例数据（如果需要的话）
-- 注意：你需要将 '00000000-0000-0000-0000-000000000001' 替换为实际的用户UUID
/*
INSERT INTO user_prompts (user_id, prompt, title, description, category, tags, status, is_featured, likes_count, uses_count) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'A majestic dragon soaring through stormy clouds with lightning illuminating its scales, epic fantasy scene, cinematic lighting', 'Epic Dragon Storm', 'Perfect for fantasy artwork with dramatic lighting', 'fantasy', ARRAY['dragon', 'fantasy', 'epic', 'storm'], 'approved', true, 1234, 3456),
('00000000-0000-0000-0000-000000000001'::uuid, 'Cute kawaii cat girl with big sparkling eyes, pastel colors, anime style, soft lighting, adorable expression', 'Kawaii Cat Girl', 'Adorable anime-style character prompt', 'anime', ARRAY['anime', 'cute', 'kawaii', 'cat girl'], 'approved', true, 987, 2345),
('00000000-0000-0000-0000-000000000001'::uuid, 'Cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic advertisements, rain, futuristic', 'Neon Cyberpunk City', 'Futuristic city scene with neon aesthetics', 'cyberpunk', ARRAY['cyberpunk', 'neon', 'city', 'futuristic'], 'approved', false, 1567, 4321),
('00000000-0000-0000-0000-000000000001'::uuid, 'Enchanted forest with glowing mushrooms, fairy lights, magical creatures hiding in shadows, moonbeams through trees', 'Magical Forest', 'Mystical forest scene with magical elements', 'fantasy', ARRAY['forest', 'magic', 'fairy', 'enchanted'], 'approved', true, 876, 1987),
('00000000-0000-0000-0000-000000000001'::uuid, 'Beautiful portrait of a woman with flowing hair, soft natural lighting, photorealistic, detailed eyes, elegant pose', 'Elegant Portrait', 'Professional portrait prompt for realistic results', 'portrait', ARRAY['portrait', 'woman', 'realistic', 'elegant'], 'approved', false, 654, 1234);
*/

-- 完成信息
SELECT 'User prompts system tables created successfully! 🎉' as message; 