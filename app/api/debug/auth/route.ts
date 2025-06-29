import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('=== 认证调试信息 ===');
    console.log('用户:', user);
    console.log('认证错误:', authError);
    console.log('环境变量检查:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
    
    // 如果用户存在，检查管理员权限
    let adminCheck = null;
    let adminError = null;
    
    if (user) {
      try {
        const { data, error } = await supabase
          .from('admin_config')
          .select('*')
          .eq('email', user.email)
          .single();
          
        adminCheck = data;
        adminError = error;
        
        console.log('管理员检查:', data);
        console.log('管理员检查错误:', error);
      } catch (err) {
        adminError = err;
        console.log('管理员检查异常:', err);
      }
    }
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      authError,
      adminCheck,
      adminError,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
  } catch (error) {
    console.error('调试API错误:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 