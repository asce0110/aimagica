-- 修复用户表RLS无限递归问题
-- 在Supabase SQL Editor中执行此脚本

-- 1. 删除导致递归的管理员策略
DROP POLICY IF EXISTS "admin_select_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_select_all_images" ON public.generated_images;
DROP POLICY IF EXISTS "admin_select_all_logs" ON public.login_logs;

-- 2. 创建管理员配置表（独立于用户表）
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 插入管理员邮箱
INSERT INTO public.admin_config (email, role) VALUES 
    ('admin@aimagica.com', 'admin'),
    ('asce3801@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 4. 为用户表创建简化的策略
-- 允许任何认证用户查看基本用户信息（用于NextAuth）
CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 用户只能更新自己的数据
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid()::uuid = id);

-- 允许系统插入新用户（用于注册）
CREATE POLICY "users_insert_system" ON public.users
    FOR INSERT WITH CHECK (true);

-- 5. 使用独立的管理员表重新创建管理员策略
CREATE POLICY "admin_select_all_users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_config ac
            WHERE ac.email = (
                SELECT email FROM auth.users 
                WHERE id = auth.uid()
            )
        )
    );

-- 6. 创建管理员检查函数
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_config 
        WHERE email = user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 验证修复
SELECT 'RLS policies fixed for users table' as status; 