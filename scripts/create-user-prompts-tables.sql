-- ===============================================
-- 第一步：创建基础表结构
-- 在 Supabase SQL Editor 中执行这个文件
-- ===============================================

-- 创建用户提示词主表
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
    status VARCHAR(20) DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT
);

-- 创建点赞表
CREATE TABLE IF NOT EXISTS user_prompt_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES user_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, prompt_id)
);

-- 创建使用记录表
CREATE TABLE IF NOT EXISTS user_prompt_uses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id INTEGER REFERENCES user_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 添加基础索引
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_id ON user_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_status ON user_prompts(status);
CREATE INDEX IF NOT EXISTS idx_user_prompts_created_at ON user_prompts(created_at DESC);

-- 检查表是否创建成功
SELECT 'Basic tables created successfully!' as message; 