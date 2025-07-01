import { NextRequest, NextResponse } from 'next/server';
import { createClient, createFastServiceRoleClient } from '@/lib/supabase-server';

// GET - 获取所有订阅计划（简化版本，暂时跳过认证）
export async function GET() {
  try {
    console.log('=== GET 订阅计划开始 ===');
    
    // 暂时跳过用户认证，直接使用服务角色客户端
    console.log('⚠️ 临时跳过认证检查（仅开发环境）');
    
    const serviceSupabase = createFastServiceRoleClient();

    // 获取订阅计划列表
    const { data: plans, error } = await serviceSupabase
      .from('subscription_plans')
      .select('*')
      .order('type', { ascending: true });

    if (error) {
      console.error('获取订阅计划失败:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    console.log('✅ 获取到订阅计划数量:', plans?.length || 0);

    return NextResponse.json(plans);

  } catch (error) {
    console.error('订阅计划API错误:', error);
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - 创建新的订阅计划
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 检查管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminCheck } = await supabase
      .from('admin_config')
      .select('email')
      .eq('email', user.email)
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type, price, currency, interval, features, enabled, popular } = body;

    // 验证必填字段
    if (!name || !type || price === undefined || !currency || !interval || !features) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 验证价格
    if (price < 0) {
      return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 });
    }

    // 验证功能配置
    if (!features.imageGenerations || features.imageGenerations < 0) {
      return NextResponse.json({ error: 'Invalid features configuration' }, { status: 400 });
    }

    // 插入新的订阅计划
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        description: description || '',
        type,
        price,
        currency,
        interval,
        features,
        enabled: enabled ?? true,
        popular: popular ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('创建订阅计划失败:', error);
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }

    // 记录审计日志
    await supabase
      .from('payment_config_audit')
      .insert({
        admin_user_id: user.id,
        action: 'create',
        table_name: 'subscription_plans',
        record_id: plan.id,
        new_data: plan,
        created_at: new Date().toISOString()
      });

    return NextResponse.json(plan, { status: 201 });

  } catch (error) {
    console.error('创建订阅计划API错误:', error);
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 