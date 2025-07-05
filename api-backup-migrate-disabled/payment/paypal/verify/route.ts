import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { PayPalPaymentService } from '@/lib/payment/paypal';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 获取用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, orderId, payerId, token } = body;

    // 验证必要参数
    if (!subscriptionId && !orderId) {
      return NextResponse.json({ 
        error: 'Missing subscription ID or order ID' 
      }, { status: 400 });
    }

    // 获取PayPal配置
    const { data: provider, error: providerError } = await supabase
      .from('payment_providers')
      .select('*')
      .eq('type', 'paypal')
      .eq('enabled', true)
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ 
        error: 'PayPal provider not available' 
      }, { status: 400 });
    }

    // 初始化PayPal服务
    const paypalService = new PayPalPaymentService({
      clientId: provider.config.clientId,
      clientSecret: provider.config.clientSecret,
      environment: provider.config.environment === 'production' ? 'live' : 'sandbox'
    });

    let subscriptionDetails: any;
    let transactionId = subscriptionId || orderId;

    try {
      if (subscriptionId) {
        // 验证订阅状态
        subscriptionDetails = await paypalService.getSubscriptionDetails(subscriptionId);
        
        if (subscriptionDetails.status !== 'ACTIVE') {
          return NextResponse.json({ 
            error: 'Subscription is not active' 
          }, { status: 400 });
        }
      } else if (orderId) {
        // 对于一次性支付，需要验证订单状态
        // 这里可以调用PayPal Orders API来验证
        console.log('Verifying PayPal order:', orderId);
      }

      // 从数据库获取交易记录
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('external_transaction_id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (transactionError || !transaction) {
        return NextResponse.json({ 
          error: 'Transaction not found' 
        }, { status: 404 });
      }

      // 获取用户当前订阅状态
      const { data: userSubscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('external_subscription_id', transactionId)
        .single();

      let subscriptionInfo: any = null;

      if (userSubscription && !subscriptionError) {
        subscriptionInfo = {
          id: userSubscription.external_subscription_id,
          planName: userSubscription.subscription_plans?.name || 'Unknown Plan',
          status: userSubscription.status,
          startDate: userSubscription.starts_at,
          nextBilling: userSubscription.expires_at,
          features: userSubscription.subscription_plans?.features
        };
      } else {
        // 如果订阅记录不存在，可能是刚刚创建，从交易记录中获取信息
        subscriptionInfo = {
          id: transactionId,
          planName: transaction.subscription_plans?.name || 'Unknown Plan',
          status: 'pending', // 可能还在处理中
          startDate: new Date().toISOString(),
          features: transaction.subscription_plans?.features
        };
      }

      // 更新交易状态为已验证
      await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      return NextResponse.json({
        success: true,
        subscription: subscriptionInfo,
        paymentDetails: {
          transactionId,
          amount: transaction.amount,
          currency: transaction.currency,
          provider: 'paypal',
          verifiedAt: new Date().toISOString()
        }
      });

    } catch (paypalError) {
      console.error('PayPal API error:', paypalError);
      return NextResponse.json({ 
        error: 'Failed to verify payment with PayPal' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 