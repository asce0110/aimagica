require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端（使用service role key）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 环境变量检查:');
console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('- SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');

async function runMigration() {
  try {
    console.log('🚀 开始运行魔法币系统迁移...');
    
    // 1. 创建用户魔法币余额表
    console.log('📝 创建用户魔法币余额表...');
    const createUserMagicCoinsSQL = `
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
    `;
    
    // 2. 创建魔法币交易记录表
    console.log('📝 创建魔法币交易记录表...');
    const createTransactionsSQL = `
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
    `;
    
    // 3. 创建魔法币购买包配置表
    console.log('📝 创建魔法币购买包配置表...');
    const createPackagesSQL = `
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
    `;
    
    // 4. 创建用户订阅记录表
    console.log('📝 创建用户订阅记录表...');
    const createSubscriptionsSQL = `
      CREATE TABLE IF NOT EXISTS user_subscriptions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'active',
          start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_date TIMESTAMP WITH TIME ZONE,
          auto_renew BOOLEAN DEFAULT true,
          payment_provider VARCHAR(50),
          external_subscription_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 5. 创建用户月度使用配额表
    console.log('📝 创建用户月度使用配额表...');
    const createUsageSQL = `
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
    `;
    
    // 6. 创建系统配置表
    console.log('📝 创建系统配置表...');
    const createSettingsSQL = `
      CREATE TABLE IF NOT EXISTS magic_coin_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 执行创建表的SQL
    const createTableSQLs = [
      createUserMagicCoinsSQL,
      createTransactionsSQL,
      createPackagesSQL,
      createSubscriptionsSQL,
      createUsageSQL,
      createSettingsSQL
    ];
    
    for (const sql of createTableSQLs) {
      try {
        await supabase.rpc('exec_sql', { sql_query: sql });
        console.log('✅ 表创建成功');
      } catch (error) {
        console.log('⚠️ 表可能已存在，跳过...');
      }
    }
    
    // 插入默认数据
    console.log('📦 插入默认魔法币购买包...');
    const packages = [
      { name: 'Starter Pack', description: 'Perfect for trying out our services', coins_amount: 50, price_usd: 4.99, bonus_coins: 5, sort_order: 1 },
      { name: 'Popular Pack', description: 'Most popular choice for regular users', coins_amount: 120, price_usd: 9.99, bonus_coins: 15, sort_order: 2 },
      { name: 'Power Pack', description: 'Great value for heavy users', coins_amount: 300, price_usd: 19.99, bonus_coins: 50, sort_order: 3 },
      { name: 'Ultimate Pack', description: 'Maximum value for professionals', coins_amount: 600, price_usd: 39.99, bonus_coins: 120, sort_order: 4 }
    ];
    
    for (const pkg of packages) {
      try {
        const { data, error } = await supabase
          .from('magic_coin_packages')
          .insert(pkg);
        
        if (error) {
          if (error.message && error.message.includes('duplicate')) {
            console.log(`⚠️ 包 ${pkg.name} 已存在，跳过`);
          } else {
            console.log(`⚠️ 插入包 ${pkg.name} 失败:`, error.message || error);
          }
        } else {
          console.log(`✅ 插入包 ${pkg.name} 成功`);
        }
      } catch (err) {
        console.log(`⚠️ 插入包 ${pkg.name} 异常:`, err.message);
      }
    }
    
    // 插入系统配置
    console.log('⚙️ 插入系统配置...');
    const settings = [
      { setting_key: 'new_user_coins', setting_value: '10', description: '新用户注册赠送的魔法币数量' },
      { setting_key: 'default_image_cost', setting_value: '1', description: '默认生图消耗魔法币数量' },
      { setting_key: 'default_video_cost', setting_value: '5', description: '默认生视频消耗魔法币数量' },
      { setting_key: 'min_purchase_amount', setting_value: '1.00', description: '最小购买金额（美元）' },
      { setting_key: 'max_purchase_amount', setting_value: '500.00', description: '最大购买金额（美元）' }
    ];
    
    for (const setting of settings) {
      try {
        const { data, error } = await supabase
          .from('magic_coin_settings')
          .insert(setting);
        
        if (error) {
          if (error.message && error.message.includes('duplicate')) {
            console.log(`⚠️ 配置 ${setting.setting_key} 已存在，跳过`);
          } else {
            console.log(`⚠️ 插入配置 ${setting.setting_key} 失败:`, error.message || error);
          }
        } else {
          console.log(`✅ 插入配置 ${setting.setting_key} 成功`);
        }
      } catch (err) {
        console.log(`⚠️ 插入配置 ${setting.setting_key} 异常:`, err.message);
      }
    }
    
    // 为现有用户初始化魔法币余额
    console.log('👥 为现有用户初始化魔法币余额...');
    try {
      const { data: users, error: usersError } = await supabase.from('users').select('id');
      
      if (usersError) {
        console.log('⚠️ 获取用户列表失败:', usersError.message);
      } else if (users && users.length > 0) {
        let successCount = 0;
        for (const user of users) {
          try {
            const { error } = await supabase
              .from('user_magic_coins')
              .insert({
                user_id: user.id,
                balance: 10,
                total_earned: 10
              });
            
            if (error) {
              if (error.message && error.message.includes('duplicate')) {
                // 用户已有魔法币记录，跳过
              } else {
                console.log(`⚠️ 初始化用户 ${user.id} 魔法币失败:`, error.message);
              }
            } else {
              successCount++;
            }
          } catch (err) {
            console.log(`⚠️ 初始化用户 ${user.id} 魔法币异常:`, err.message);
          }
        }
        console.log(`✅ 为 ${successCount} 个用户初始化魔法币余额`);
      }
    } catch (err) {
      console.log('⚠️ 用户魔法币初始化异常:', err.message);
    }
    
    // 验证迁移结果
    console.log('\n🔍 验证迁移结果...');
    
    try {
      const { data: packagesData } = await supabase.from('magic_coin_packages').select('*');
      console.log(`📦 魔法币购买包数量: ${packagesData?.length || 0}`);
      
      const { data: settingsData } = await supabase.from('magic_coin_settings').select('*');
      console.log(`⚙️ 系统配置数量: ${settingsData?.length || 0}`);
      
      const { data: coinsData } = await supabase.from('user_magic_coins').select('*');
      console.log(`💰 用户魔法币记录数量: ${coinsData?.length || 0}`);
    } catch (err) {
      console.log('⚠️ 验证结果时出错:', err.message);
    }
    
    console.log('\n🎉 魔法币系统迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  }
}

runMigration(); 