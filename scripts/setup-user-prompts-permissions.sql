-- ===============================================
-- 第二步：设置权限和策略
-- 在第一步成功后执行此文件
-- ===============================================

-- 启用行级安全
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_uses ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "view_approved_prompts" ON user_prompts;
DROP POLICY IF EXISTS "view_own_prompts" ON user_prompts;
DROP POLICY IF EXISTS "insert_own_prompts" ON user_prompts;
DROP POLICY IF EXISTS "update_own_prompts" ON user_prompts;
DROP POLICY IF EXISTS "admin_manage_prompts" ON user_prompts;

-- 用户提示词的基础策略
CREATE POLICY "view_approved_prompts" ON user_prompts
    FOR SELECT 
    USING (status = 'approved');

CREATE POLICY "view_own_prompts" ON user_prompts
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "insert_own_prompts" ON user_prompts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_prompts" ON user_prompts
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 点赞表策略
DROP POLICY IF EXISTS "manage_own_likes" ON user_prompt_likes;
DROP POLICY IF EXISTS "view_likes" ON user_prompt_likes;

CREATE POLICY "manage_own_likes" ON user_prompt_likes
    FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "view_likes" ON user_prompt_likes
    FOR SELECT 
    USING (true);

-- 使用记录策略
DROP POLICY IF EXISTS "insert_own_uses" ON user_prompt_uses;
DROP POLICY IF EXISTS "view_uses" ON user_prompt_uses;

CREATE POLICY "insert_own_uses" ON user_prompt_uses
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "view_uses" ON user_prompt_uses
    FOR SELECT 
    USING (true);

SELECT 'Permissions set successfully!' as message; 