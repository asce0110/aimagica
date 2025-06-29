
-- 魔法币系统表创建SQL
-- 请在Supabase SQL编辑器中执行

-- 1. 用户魔法币余额表
CREATE TABLE IF NOT EXISTS user_magic_coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 NOT NULL,
    total_earned INTEGER DEFAULT 0 NOT NULL,
    total_spent INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. 魔法币交易记录表
CREATE TABLE IF NOT EXISTS magic_coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 魔法币购买包配置表
CREATE TABLE IF NOT EXISTS magic_coin_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coins_amount INTEGER NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    bonus_coins INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户月度使用配额表
CREATE TABLE IF NOT EXISTS user_monthly_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    images_generated INTEGER DEFAULT 0,
    videos_generated INTEGER DEFAULT 0,
    coins_granted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year_month)
);

-- 5. 魔法币系统配置表
CREATE TABLE IF NOT EXISTS magic_coin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 扩展现有表
ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS coins_per_image INTEGER DEFAULT 1;
ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS coins_per_video INTEGER DEFAULT 5;

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_image_quota INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_video_quota INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthly_coins_grant INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- 7. 插入默认数据
INSERT INTO magic_coin_packages (name, description, coins_amount, price_usd, bonus_coins, sort_order) VALUES
('Starter Pack', 'Perfect for trying out our services', 50, 4.99, 5, 1),
('Popular Pack', 'Most popular choice for regular users', 120, 9.99, 15, 2),
('Power Pack', 'Great value for heavy users', 300, 19.99, 50, 3),
('Ultimate Pack', 'Maximum value for professionals', 600, 39.99, 120, 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO magic_coin_settings (setting_key, setting_value, description) VALUES
('new_user_coins', '10', '新用户注册赠送的魔法币数量'),
('default_image_cost', '1', '默认生图消耗魔法币数量'),
('default_video_cost', '5', '默认生视频消耗魔法币数量'),
('min_purchase_amount', '1.00', '最小购买金额（美元）'),
('max_purchase_amount', '500.00', '最大购买金额（美元）')
ON CONFLICT (setting_key) DO NOTHING;

-- 8. 为现有用户初始化魔法币余额
INSERT INTO user_magic_coins (user_id, balance, total_earned)
SELECT id, 10, 10 FROM users 
WHERE id NOT IN (SELECT user_id FROM user_magic_coins)
ON CONFLICT (user_id) DO NOTHING;

-- 9. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_magic_coins_user_id ON user_magic_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_coin_transactions_user_id ON magic_coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_coin_transactions_created_at ON magic_coin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_month ON user_monthly_usage(user_id, year_month);
