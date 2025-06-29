import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { PayPalPaymentService } from '@/lib/payment/paypal';
import { PaymentSecurityLogger } from '@/lib/payment/security';

export async function POST(request: NextRequest) {
  let rawBody: string;
  
  try {
    // 获取原始请求体用于签名验证
    rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('📨 收到PayPal Webhook:', {
      headers: {
        'paypal-transmission-id': headers['paypal-transmission-id'],
        'paypal-cert-id': headers['paypal-cert-id'],
        'paypal-auth-algo': headers['paypal-auth-algo'],
        'paypal-transmission-sig': headers['paypal-transmission-sig'],
        'paypal-transmission-time': headers['paypal-transmission-time']
      }
    });

    // 解析webhook数据
    const webhookData = JSON.parse(rawBody);
    console.log('PayPal Webhook Event Type:', webhookData.event_type);

    // 获取PayPal配置
    const supabase = createClient();
    const { data: provider, error: providerError } = await supabase
      .from('payment_providers')
      .select('*')
      .eq('type', 'paypal')
      .eq('enabled', true)
      .single();

    if (providerError || !provider) {
      console.error('PayPal provider not found or disabled');
      return NextResponse.json({ error: 'Provider not found' }, { status: 400 });
    }

    // 初始化PayPal服务
    const paypalService = new PayPalPaymentService({
      clientId: provider.config.clientId,
      clientSecret: provider.config.clientSecret,
      environment: provider.config.environment === 'production' ? 'live' : 'sandbox'
    });

    // 🔒 验证Webhook签名
    const webhookId = provider.config.webhookId;
    if (!webhookId) {
      console.error('PayPal webhook ID not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const isValidSignature = await paypalService.verifyWebhookSignature(
      webhookId,
      headers,
      rawBody
    );

    if (!isValidSignature) {
      PaymentSecurityLogger.logSecurityEvent(
        'signature_invalid',
        { 
          provider: 'paypal',
          eventType: webhookData.event_type,
          transmissionId: headers['paypal-transmission-id']
        }
      );
      console.error('❌ PayPal webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('✅ PayPal webhook signature verified');

    // 🔒 处理webhook事件
    const eventResult = await paypalService.handleWebhookEvent(webhookData);
    
    if (!eventResult.success) {
      console.error('PayPal webhook event processing failed');
      return NextResponse.json({ error: 'Event processing failed' }, { status: 400 });
    }

    const { userId, planId, type: eventType } = eventResult;
    
    // 根据事件类型更新用户订阅状态
    switch (webhookData.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(supabase, webhookData, userId!, planId!, provider.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(supabase, webhookData, userId!, planId!);
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(supabase, webhookData, userId!, planId!);
        break;
        
      case 'PAYMENT.CAPTURE.COMPLETED':
        // 处理一次性支付完成（终身订阅）
        await handlePaymentCompleted(supabase, webhookData, userId!, planId!, provider.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(supabase, webhookData, userId!, planId!);
        break;
        
      default:
        console.log(`未处理的PayPal事件: ${webhookData.event_type}`);
    }

    // 记录交易成功
    PaymentSecurityLogger.logPaymentAttempt(true, {
      userId: userId!,
      planId: planId!,
      amount: 0, // 从webhook数据中提取
      provider: 'paypal',
      ip: request.headers.get('x-forwarded-for') || 'paypal-webhook'
    });

    return NextResponse.json({ 
      success: true,
      eventType: webhookData.event_type 
    });

  } catch (error) {
    console.error('❌ PayPal webhook processing error:', error);
    
    PaymentSecurityLogger.logPaymentAttempt(false, {
      userId: 'webhook-error',
      planId: 'unknown',
      amount: 0,
      provider: 'paypal',
      ip: request.headers.get('x-forwarded-for') || 'paypal-webhook'
    });

    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// 🎉 处理订阅激活
async function handleSubscriptionActivated(
  supabase: any,
  webhookData: any,
  userId: string,
  planId: string,
  providerId: string
) {
  try {
    const subscriptionId = webhookData.resource.id;
    const customData = JSON.parse(webhookData.resource.custom_id || '{}');
    
    // 获取订阅计划详情
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    // 计算到期时间
    const startTime = new Date(webhookData.resource.start_time);
    const expiresAt = new Date(startTime);
    
    if (plan.interval === 'year') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // 更新用户订阅状态
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        starts_at: startTime.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_provider_id: providerId,
        external_subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      });

    if (subscriptionError) {
      throw subscriptionError;
    }

    // 更新交易记录
    await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        webhook_data: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('external_transaction_id', subscriptionId);

    console.log(`✅ PayPal订阅激活成功: ${subscriptionId}`);

  } catch (error) {
    console.error('处理PayPal订阅激活失败:', error);
    throw error;
  }
}

// 🚫 处理订阅取消
async function handleSubscriptionCancelled(
  supabase: any,
  webhookData: any,
  userId: string,
  planId: string
) {
  try {
    const subscriptionId = webhookData.resource.id;

    // 更新订阅状态为已取消
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('external_subscription_id', subscriptionId);

    if (error) {
      throw error;
    }

    console.log(`🚫 PayPal订阅取消: ${subscriptionId}`);

  } catch (error) {
    console.error('处理PayPal订阅取消失败:', error);
    throw error;
  }
}

// ⏸️ 处理订阅暂停
async function handleSubscriptionSuspended(
  supabase: any,
  webhookData: any,
  userId: string,
  planId: string
) {
  try {
    const subscriptionId = webhookData.resource.id;

    // 更新订阅状态为暂停
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('external_subscription_id', subscriptionId);

    if (error) {
      throw error;
    }

    console.log(`⏸️ PayPal订阅暂停: ${subscriptionId}`);

  } catch (error) {
    console.error('处理PayPal订阅暂停失败:', error);
    throw error;
  }
}

// 💰 处理一次性支付完成（终身订阅）
async function handlePaymentCompleted(
  supabase: any,
  webhookData: any,
  userId: string,
  planId: string,
  providerId: string
) {
  try {
    const orderId = webhookData.resource.id;
    const customData = JSON.parse(webhookData.resource.purchase_units?.[0]?.custom_id || '{}');
    
    if (customData.type === 'lifetime') {
      // 获取订阅计划详情
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) {
        throw new Error('Plan not found');
      }

      // 创建终身订阅记录
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date('2099-12-31').toISOString(), // 设置为很远的未来
          payment_provider_id: providerId,
          external_subscription_id: orderId,
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      console.log(`💰 PayPal终身订阅支付完成: ${orderId}`);
    }

  } catch (error) {
    console.error('处理PayPal支付完成失败:', error);
    throw error;
  }
}

// ❌ 处理支付失败
async function handlePaymentFailed(
  supabase: any,
  webhookData: any,
  userId: string,
  planId: string
) {
  try {
    const subscriptionId = webhookData.resource.billing_agreement_id;

    // 更新交易记录
    await supabase
      .from('payment_transactions')
      .update({
        status: 'failed',
        webhook_data: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('external_transaction_id', subscriptionId);

    console.log(`❌ PayPal支付失败: ${subscriptionId}`);

  } catch (error) {
    console.error('处理PayPal支付失败失败:', error);
    throw error;
  }
} 