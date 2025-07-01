require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端（使用service role key）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('🔍 检查魔法币系统表...');
    
    const tables = [
      'user_magic_coins',
      'magic_coin_transactions', 
      'magic_coin_packages',
      'user_subscriptions',
      'user_monthly_usage',
      'magic_coin_settings'
    ];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' });
        
        if (error) {
          console.log(`❌ 表 ${table}: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table}: ${count || 0} 条记录`);
          if (data && data.length > 0) {
            console.log(`   示例数据:`, data[0]);
          }
        }
      } catch (err) {
        console.log(`❌ 表 ${table}: ${err.message}`);
      }
    }
    
    // 尝试手动插入一个魔法币包
    console.log('\n🧪 测试插入魔法币包...');
    try {
      const { data, error } = await supabase
        .from('magic_coin_packages')
        .insert({
          name: 'Test Pack',
          description: 'Test package',
          coins_amount: 10,
          price_usd: 1.99,
          bonus_coins: 0,
          sort_order: 999
        })
        .select();
      
      if (error) {
        console.log('❌ 插入测试包失败:', error);
      } else {
        console.log('✅ 插入测试包成功:', data);
      }
    } catch (err) {
      console.log('❌ 插入测试包异常:', err.message);
    }
    
    // 尝试手动插入一个系统配置
    console.log('\n🧪 测试插入系统配置...');
    try {
      const { data, error } = await supabase
        .from('magic_coin_settings')
        .insert({
          setting_key: 'test_setting',
          setting_value: 'test_value',
          description: 'Test setting'
        })
        .select();
      
      if (error) {
        console.log('❌ 插入测试配置失败:', error);
      } else {
        console.log('✅ 插入测试配置成功:', data);
      }
    } catch (err) {
      console.log('❌ 插入测试配置异常:', err.message);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkTables(); 