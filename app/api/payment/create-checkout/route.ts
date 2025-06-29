import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { PaymentSecurity, PaymentSecurityLogger } from '@/lib/payment/security';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 获取用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, paymentProvider } = body;

    // 验证必填字段
    if (!planId || !paymentProvider) {
      return NextResponse.json({ 
        error: 'Missing required fields: planId, paymentProvider' 
      }, { status: 400 });
    }

    // 🔒 从数据库获取真实的订阅计划信息（防止篡改）
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('enabled', true)
      .single();

    if (planError || !plan) {
      PaymentSecurityLogger.logSecurityEvent(
        'amount_mismatch',
        { planId, error: 'Plan not found' },
        user.id
      );
      return NextResponse.json({ 
        error: 'Invalid subscription plan' 
      }, { status: 400 });
    }

    // 🔒 从数据库获取真实的支付提供商信息
    const { data: provider, error: providerError } = await supabase
      .from('payment_providers')
      .select('*')
      .eq('type', paymentProvider)
      .eq('enabled', true)
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ 
        error: 'Payment provider not available' 
      }, { status: 400 });
    }

    // 🔒 使用数据库中的真实金额（绝对防篡改）
    const securePaymentData = {
      userId: user.id,
      planId: plan.id,
      amount: parseFloat(plan.price), // 使用数据库中的真实价格
      currency: plan.currency
    };

    // 🔒 验证支付金额（双重保险）
    const isAmountValid = await PaymentSecurity.validatePaymentAmount(
      plan.id,
      securePaymentData.amount,
      securePaymentData.currency
    );

    if (!isAmountValid) {
      PaymentSecurityLogger.logSecurityEvent(
        'amount_mismatch',
        { 
          planId: plan.id, 
          expectedAmount: plan.price, 
          providedAmount: securePaymentData.amount 
        },
        user.id
      );
      return NextResponse.json({ 
        error: 'Payment amount validation failed' 
      }, { status: 400 });
    }

    // 🔒 创建安全的支付会话
    const paymentSession = PaymentSecurity.createSecurePaymentSession(securePaymentData);

    // 根据支付提供商类型创建相应的支付会话
    let checkoutUrl: string;
    let sessionId: string;

    switch (provider.type) {
      case 'stripe':
        const stripeResult = await createStripeCheckout(
          securePaymentData,
          paymentSession,
          provider.config,
          plan
        );
        checkoutUrl = stripeResult.checkoutUrl;
        sessionId = stripeResult.sessionId;
        break;

      case 'paypal':
        const paypalResult = await createPayPalCheckout(
          securePaymentData,
          paymentSession,
          provider.config,
          plan
        );
        checkoutUrl = paypalResult.checkoutUrl;
        sessionId = paypalResult.sessionId;
        break;

      default:
        return NextResponse.json({ 
          error: 'Payment provider not implemented' 
        }, { status: 400 });
    }

    // 记录支付会话到数据库
    const { error: sessionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        provider_id: provider.id,
        plan_id: plan.id,
        external_transaction_id: sessionId,
        type: 'subscription',
        status: 'pending',
        amount: securePaymentData.amount,
        currency: securePaymentData.currency,
        description: `Subscription to ${plan.name}`,
        metadata: {
          paymentSession: paymentSession.token,
          checkoutUrl,
          secureSignature: paymentSession.signature
        }
      });

    if (sessionError) {
      console.error('Failed to save payment session:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to create payment session' 
      }, { status: 500 });
    }

    // 记录支付尝试
    PaymentSecurityLogger.logPaymentAttempt(true, {
      userId: user.id,
      planId: plan.id,
      amount: securePaymentData.amount,
      provider: provider.type,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      checkoutUrl,
      sessionId,
      paymentToken: paymentSession.token,
      expiresAt: paymentSession.expiresAt,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features
      }
    });

  } catch (error) {
    console.error('❌ Payment checkout error:', error);
    
    PaymentSecurityLogger.logPaymentAttempt(false, {
      userId: 'unknown',
      planId: 'unknown',
      amount: 0,
      provider: 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 🔥 Stripe集成 - 安全创建支付会话
async function createStripeCheckout(
  paymentData: any,
  paymentSession: any,
  providerConfig: any,
  plan: any
) {
  try {
    // 动态导入Stripe（避免在非Stripe环境下加载）
    const { default: Stripe } = await import('stripe');
    
    const stripe = new Stripe(providerConfig.secretKey, {
      apiVersion: '2024-06-20',
    });

    // 🔒 严格的金额验证 - 再次确保金额不被篡改
    const amountInCents = Math.round(paymentData.amount * 100);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: plan.interval === 'lifetime' ? 'payment' : 'subscription',
      line_items: [
        {
          price_data: {
            currency: paymentData.currency.toLowerCase(),
            product_data: {
              name: `${plan.name} - AI Image Generation`,
              description: plan.description || 'Professional AI image generation service',
            },
            unit_amount: amountInCents, // 🔒 使用经过验证的金额
            ...(plan.interval !== 'lifetime' && {
              recurring: {
                interval: plan.interval === 'year' ? 'year' : 'month',
              }
            })
          },
          quantity: 1,
        },
      ],
      // 🔒 关键安全元数据 - 用于webhook验证
      metadata: {
        userId: paymentData.userId,
        planId: paymentData.planId,
        paymentToken: paymentSession.token,
        secureAmount: paymentData.amount.toString(), // 原始金额字符串
        secureCurrency: paymentData.currency,
        secureSignature: paymentSession.signature, // 安全签名
        timestamp: paymentSession.timestamp.toString()
      },
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
      client_reference_id: paymentData.userId,
      // 🔒 自动税计算和发票
      automatic_tax: { enabled: true },
      invoice_creation: { enabled: true },
    });

    return {
      checkoutUrl: session.url!,
      sessionId: session.id
    };

  } catch (error) {
    console.error('Stripe checkout creation failed:', error);
    throw new Error('Failed to create Stripe checkout session');
  }
}

// 🔥 PayPal集成 - 完整实现
async function createPayPalCheckout(
  paymentData: any,
  paymentSession: any,
  providerConfig: any,
  plan: any
) {
  try {
    // 动态导入PayPal服务
    const { PayPalPaymentService } = await import('@/lib/payment/paypal');
    
    const paypalService = new PayPalPaymentService({
      clientId: providerConfig.clientId,
      clientSecret: providerConfig.clientSecret,
      environment: providerConfig.environment === 'production' ? 'live' : 'sandbox'
    });

    // 🔒 使用PayPal安全支付创建
    const result = await paypalService.createSubscription(
      {
        userId: paymentData.userId,
        planId: paymentData.planId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        interval: plan.interval
      },
      {
        name: plan.name,
        description: plan.description || 'AI Image Generation Service'
      },
      paymentSession
    );

    return {
      checkoutUrl: result.approvalUrl,
      sessionId: result.subscriptionId
    };

  } catch (error) {
    console.error('PayPal checkout creation failed:', error);
    throw new Error('Failed to create PayPal checkout session');
  }
} 