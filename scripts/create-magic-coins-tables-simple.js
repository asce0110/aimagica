require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端（使用service role key）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  try {
    console.log('🚀 开始创建魔法币系统表...');
    
    // 由于无法直接执行DDL，我们先手动插入一些数据到现有表中
    // 然后在Supabase Dashboard中手动创建表
    
    console.log('📝 检查现有表结构...');
    
    // 检查 subscription_plans 表是否需要添加新字段
    const { data: plans } = await supabase.from('subscription_plans').select('*').limit(1);
    if (plans && plans.length > 0) {
      console.log('✅ subscription_plans 表存在');
      console.log('示例数据:', plans[0]);
    }
    
    // 检查 api_configs 表是否需要添加新字段
    const { data: configs } = await supabase.from('api_configs').select('*').limit(1);
    if (configs && configs.length > 0) {
      console.log('✅ api_configs 表存在');
      console.log('示例数据:', configs[0]);
    }
    
    console.log('\n📋 需要在Supabase Dashboard中手动创建以下表:');
    console.log('1. user_magic_coins - 用户魔法币余额表');
    console.log('2. magic_coin_transactions - 魔法币交易记录表');
    console.log('3. magic_coin_packages - 魔法币购买包配置表');
    console.log('4. user_monthly_usage - 用户月度使用配额表');
    console.log('5. magic_coin_settings - 魔法币系统配置表');
    
    console.log('\n📋 需要在现有表中添加以下字段:');
    console.log('api_configs 表:');
    console.log('- coins_per_image INTEGER DEFAULT 1');
    console.log('- coins_per_video INTEGER DEFAULT 5');
    
    console.log('\nsubscription_plans 表:');
    console.log('- monthly_image_quota INTEGER DEFAULT 0');
    console.log('- monthly_video_quota INTEGER DEFAULT 0');
    console.log('- monthly_coins_grant INTEGER DEFAULT 0');
    console.log('- is_unlimited BOOLEAN DEFAULT false');
    
    // 创建SQL文件供手动执行
    const sqlContent = `
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
`;

    require('fs').writeFileSync('magic_coins_setup.sql', sqlContent);
    console.log('\n📄 已生成 magic_coins_setup.sql 文件');
    console.log('请将此文件内容复制到Supabase Dashboard的SQL编辑器中执行');
    
  } catch (error) {
    console.error('❌ 创建失败:', error);
  }
}

createTables(); 