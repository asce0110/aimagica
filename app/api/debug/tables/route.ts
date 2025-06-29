import { NextRequest, NextResponse } from 'next/server'
import { createFastServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== 检查数据库表结构 ===');
    
    const supabase = createFastServiceRoleClient();

    // 直接尝试查询一些常见表来验证存在性
      const tableChecks = [];
      
      const tablesToCheck = [
        'users',
        'generated_images', 
        'admin_config',
        'payment_providers',
        'subscription_plans',
        'user_subscriptions',
        'image_likes',
        'profiles',
        'auth.users', // Supabase内置用户表
        'public.users', // 可能的用户表
        'user_profiles',
        'images',
        'user_images'
      ];

      for (const tableName of tablesToCheck) {
        try {
          console.log(`检查表: ${tableName}`);
          
          // 对于auth.users，需要特殊处理
          if (tableName === 'auth.users') {
            try {
              const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
              tableChecks.push({
                table: tableName,
                exists: !authError,
                count: authUsers?.users?.length || 0,
                error: authError?.message || null,
                data: authUsers?.users?.slice(0, 3) || [] // 前3个用户的信息
              });
            } catch (authErr) {
              tableChecks.push({
                table: tableName,
                exists: false,
                count: 0,
                error: 'Auth admin access failed'
              });
            }
          } else {
            const { count, error, data } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .limit(3); // 获取前3条记录作为示例
            
            tableChecks.push({
              table: tableName,
              exists: !error,
              count: count || 0,
              error: error?.message || null,
              sampleData: data || []
            });
          }
        } catch (e) {
          tableChecks.push({
            table: tableName,
            exists: false,
            count: 0,
            error: `Exception: ${e instanceof Error ? e.message : 'Unknown error'}`
          });
        }
      }

      return NextResponse.json({
        method: 'direct_table_check',
        tableChecks: tableChecks,
        summary: {
          totalTablesChecked: tablesToCheck.length,
          existingTables: tableChecks.filter(t => t.exists).length,
          tablesWithData: tableChecks.filter(t => t.count > 0).length
        },
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error("❌ 检查数据库表失败:", error);
    
    return NextResponse.json({
      error: 'Failed to check tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 