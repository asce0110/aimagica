# PayPal支付系统配置指南

## 🚀 PayPal支付集成已完成

瑶瑶已经为您实现了完整的PayPal支付系统，包含以下功能：

### ✅ 已实现功能

1. **🔐 安全支付创建**：防金额篡改的支付会话创建
2. **🔄 订阅管理**：支持月度、年度和终身订阅
3. **📨 Webhook处理**：实时支付状态更新
4. **🛡️ 签名验证**：PayPal webhook签名验证
5. **⚙️ 管理员配置**：可视化PayPal配置管理
6. **🧪 配置测试**：一键测试PayPal连接

---

## 📋 配置步骤

### 第一步：PayPal开发者账户设置

1. **登录PayPal开发者中心**
   ```
   https://developer.paypal.com/
   ```

2. **创建应用**
   - 点击 "Create App"
   - 选择 "Default Application"
   - 环境选择 "Sandbox" (测试) 或 "Live" (生产)

3. **获取API凭证**
   ```
   Client ID: 你的应用客户端ID
   Client Secret: 你的应用客户端密钥
   ```

### 第二步：Webhook配置

1. **创建Webhook**
   - 在PayPal开发者中心选择你的应用
   - 转到 "Webhooks" 选项卡
   - 点击 "Add Webhook"

2. **配置Webhook URL**
   ```
   Webhook URL: https://yourdomain.com/api/payment/webhooks/paypal
   ```

3. **选择事件类型**
   必须包含以下事件：
   ```
   ✓ BILLING.SUBSCRIPTION.ACTIVATED
   ✓ BILLING.SUBSCRIPTION.CANCELLED
   ✓ BILLING.SUBSCRIPTION.SUSPENDED
   ✓ BILLING.SUBSCRIPTION.PAYMENT.FAILED
   ✓ PAYMENT.CAPTURE.COMPLETED
   ✓ CHECKOUT.ORDER.APPROVED
   ```

4. **获取Webhook ID**
   ```
   创建后会生成一个Webhook ID，保存此ID
   ```

### 第三步：环境变量配置

在 `.env.local` 文件中添加：

```bash
# PayPal配置
PAYPAL_CLIENT_ID=你的PayPal客户端ID
PAYPAL_CLIENT_SECRET=你的PayPal客户端密钥
PAYPAL_WEBHOOK_ID=你的Webhook ID

# 安全配置
PAYMENT_SECURITY_SECRET=一个长随机字符串用于签名
```

### 第四步：数据库配置

1. **执行数据库迁移**
   ```sql
   -- 在Supabase SQL Editor中执行
   \i migrations/002_payment_system.sql
   ```

2. **验证表创建**
   确认以下表已创建：
   ```
   ✓ payment_providers
   ✓ subscription_plans
   ✓ payment_transactions
   ✓ payment_config_audit
   ```

---

## 🔧 管理员配置

### 访问管理员界面

```
http://localhost:3000/admin/payment
```

### 添加PayPal提供商

1. **点击 "Add Provider"**
2. **填写配置信息**：

```json
{
  "name": "PayPal",
  "type": "paypal",
  "enabled": true,
  "priority": 2,
  "config": {
    "clientId": "你的PayPal客户端ID",
    "clientSecret": "你的PayPal客户端密钥",
    "webhookId": "你的Webhook ID",
    "environment": "sandbox", // 或 "production"
    "supportedCurrencies": ["USD", "EUR", "GBP"],
    "supportedCountries": ["US", "CA", "GB", "AU"]
  },
  "features": {
    "subscription": true,
    "oneTime": true,
    "refund": true,
    "webhook": true
  }
}
```

3. **点击测试按钮** 🧪
   验证配置是否正确

### 订阅计划配置

创建示例订阅计划：

```json
{
  "name": "Pro Plan",
  "description": "Professional AI image generation",
  "type": "premium",
  "price": 19.99,
  "currency": "USD",
  "interval": "month",
  "features": {
    "imageGenerations": 500,
    "highResolution": true,
    "advancedStyles": true,
    "priorityQueue": true,
    "apiAccess": false,
    "commercialUse": true
  },
  "enabled": true,
  "popular": true
}
```

---

## 🔒 安全特性

### 金额防篡改
```typescript
// 所有支付金额都从数据库获取，前端无法篡改
const secureAmount = await getAmountFromDatabase(planId);

// HMAC签名验证
const signature = PaymentSecurity.generatePaymentSignature({
  userId, planId, amount, currency, timestamp
});
```

### Webhook签名验证
```typescript
// PayPal webhook签名验证
const isValid = await paypalService.verifyWebhookSignature(
  webhookId, headers, rawBody
);
```

### 会话安全
```typescript
// 加密支付会话数据
const session = PaymentSecurity.createSecurePaymentSession(data);
```

---

## 🧪 测试流程

### 沙盒测试

1. **使用PayPal沙盒账户**
   ```
   测试买家账户: sb-buyer@example.com
   测试卖家账户: sb-seller@example.com
   ```

2. **测试支付流程**
   - 选择订阅计划
   - 点击PayPal支付
   - 在弹出窗口中登录测试账户
   - 完成支付流程

3. **验证Webhook接收**
   - 检查服务器日志
   - 验证订阅状态更新
   - 确认数据库记录

### 生产部署

1. **更新环境变量**
   ```bash
   PAYPAL_CLIENT_ID=生产环境客户端ID
   PAYPAL_CLIENT_SECRET=生产环境客户端密钥
   ```

2. **更新配置**
   ```json
   {
     "environment": "production"
   }
   ```

3. **验证Webhook URL**
   确保生产域名可访问webhook端点

---

## 📊 支持的支付类型

### 1. 定期订阅 (Recurring Subscriptions)
- ✅ 月度订阅
- ✅ 年度订阅
- ✅ 自动续费
- ✅ 订阅取消
- ✅ 失败重试

### 2. 一次性支付 (One-time Payments)
- ✅ 终身订阅
- ✅ 单次购买
- ✅ 立即激活

### 3. 货币支持
- ✅ USD (美元)
- ✅ EUR (欧元)
- ✅ GBP (英镑)
- ✅ CAD (加拿大元)
- ✅ AUD (澳大利亚元)

---

## 🔍 故障排除

### 常见问题

1. **支付创建失败**
   ```
   检查项目：
   ✓ API凭证是否正确
   ✓ 环境配置是否匹配
   ✓ 网络连接是否正常
   ```

2. **Webhook未接收**
   ```
   检查项目：
   ✓ Webhook URL是否可访问
   ✓ SSL证书是否有效
   ✓ 事件类型是否已订阅
   ```

3. **签名验证失败**
   ```
   检查项目：
   ✓ Webhook ID是否正确
   ✓ 请求头是否完整
   ✓ 服务器时间是否同步
   ```

### 调试工具

1. **管理员测试功能**
   ```
   /admin/payment → 测试按钮 → 查看连接状态
   ```

2. **日志监控**
   ```
   查看服务器日志中的PayPal相关信息
   ```

3. **PayPal开发者工具**
   ```
   https://developer.paypal.com/developer/accounts/
   ```

---

## 📞 技术支持

如遇到配置问题，请检查：

1. **环境变量是否正确配置**
2. **数据库迁移是否成功执行**
3. **管理员权限是否正确设置**
4. **PayPal应用配置是否完整**

---

## 🎉 配置完成

PayPal支付系统已完全集成到您的AI图像生成平台中！

用户现在可以使用PayPal进行：
- ✅ 安全的订阅付费
- ✅ 一次性终身购买
- ✅ 自动订阅管理
- ✅ 实时支付状态更新

**金额防篡改机制确保了支付的绝对安全性！** 🔒 