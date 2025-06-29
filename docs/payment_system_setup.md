# Payment System Setup Guide

## 完整的支付系统配置指南

### 🚨 重要：必须按顺序执行以下步骤

## 第一步：数据库迁移

### 1.1 执行支付系统迁移

1. **登录Supabase控制台**：
   - 打开 https://supabase.com/dashboard
   - 选择你的项目
   - 进入 "SQL Editor"

2. **执行迁移脚本**：
   - 复制 `migrations/002_payment_system.sql` 文件的全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "RUN" 执行

3. **确认表已创建**：
   执行以下查询确认所有表已成功创建：
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('payment_providers', 'subscription_plans', 'payment_transactions', 'payment_config_audit');
   ```
   
   应该返回4个表名。

### 1.2 确认管理员权限

确认你的邮箱在管理员配置中：
```sql
SELECT * FROM admin_config;
```

如果你的邮箱不在列表中，添加它：
```sql
INSERT INTO admin_config (email, role) VALUES ('your-email@gmail.com', 'admin');
```

## 第二步：环境变量配置

### 2.1 更新 .env.local

在你的 `.env.local` 文件中添加以下变量：

```env
# Stripe 配置
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal 配置
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
PAYPAL_ENVIRONMENT=sandbox

# 通用支付配置
PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
PAYMENT_CANCEL_URL=http://localhost:3000/pricing
PAYMENT_WEBHOOK_SECRET=your_webhook_secret_key
```

### 2.2 验证Supabase连接

确保以下Supabase变量正确配置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 第三步：重启应用

完成数据库迁移和环境变量配置后：

1. **停止开发服务器**：
   - 在终端中按 `Ctrl+C`

2. **清除缓存并重启**：
   ```bash
   pnpm run dev
   ```

## 第四步：配置支付提供商

### 4.1 访问管理后台

1. 访问 `http://localhost:3000/admin/dashboard`
2. 点击 "Payment 💳" 标签
3. 进入支付管理页面

### 4.2 添加Stripe提供商

1. 点击 "Add Provider" 按钮
2. 填写以下信息：
   - **Provider Name**: Stripe
   - **Provider Type**: stripe
   - **Environment**: sandbox (测试环境) 或 production (生产环境)
   - **API Key**: 你的Stripe公钥
   - **Secret Key**: 你的Stripe私钥
   - **Webhook Secret**: 你的Stripe Webhook密钥
   - **Supported Currencies**: USD, EUR (根据需要添加)
   - **Supported Countries**: US, CA, GB (根据需要添加)
   - **Features**: 勾选所需功能
3. 点击 "Save"

### 4.3 添加PayPal提供商

1. 点击 "Add Provider" 按钮
2. 填写以下信息：
   - **Provider Name**: PayPal
   - **Provider Type**: paypal
   - **Environment**: sandbox 或 production
   - **API Key**: 你的PayPal Client ID
   - **Secret Key**: 你的PayPal Client Secret
   - **Webhook Secret**: 你的PayPal Webhook ID
   - **Supported Currencies**: USD, EUR
   - **Supported Countries**: US, CA, GB
   - **Features**: 勾选所需功能
3. 点击 "Save"

## 第五步：配置订阅计划

### 5.1 创建基础计划

使用系统预设的计划，或创建自定义计划：

1. 点击 "Subscription Plans" 标签
2. 点击 "Add Plan" 按钮
3. 填写计划信息：
   - **Plan Name**: 如 "Pro Plan"
   - **Plan Type**: free/premium/enterprise
   - **Price**: 价格（美元）
   - **Currency**: USD
   - **Interval**: month/year/lifetime
   - **Description**: 计划描述
   - **Features**: 配置功能限制
4. 点击 "Save"

## 第六步：测试支付功能

### 6.1 测试页面访问

1. 访问 `http://localhost:3000/pricing` 查看定价页面
2. 确认可以看到配置的订阅计划
3. 尝试点击"购买"按钮

### 6.2 测试支付流程

使用测试卡号进行支付测试：

**Stripe测试卡号**：
- 成功支付: 4242 4242 4242 4242
- 失败支付: 4000 0000 0000 0002

**PayPal测试账号**：
- 使用PayPal开发者控制台创建的测试账号

## 第七步：生产环境配置

### 7.1 更新环境变量

将测试环境的API密钥替换为生产环境密钥：

```env
# 生产环境配置
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_ENVIRONMENT=production
```

### 7.2 更新支付提供商配置

在管理后台将提供商环境从 "sandbox" 改为 "production"

## 故障排除

### 问题：点击保存按钮无反应

**解决方案**：
1. 确认已执行数据库迁移
2. 检查浏览器控制台是否有错误
3. 确认当前用户在 `admin_config` 表中

### 问题：API返回权限错误

**解决方案**：
1. 确认登录用户邮箱在 `admin_config` 表中
2. 检查Supabase RLS策略是否正确应用

### 问题：支付提供商连接失败

**解决方案**：
1. 验证API密钥是否正确
2. 确认环境设置匹配（sandbox/production）
3. 检查网络连接和防火墙设置

## 技术支持

如果遇到问题：
1. 检查浏览器开发者工具的控制台错误
2. 查看Supabase项目的日志
3. 确认所有环境变量已正确设置
4. 验证数据库表和数据完整性

---

**注意**: 这个设置指南假设你已经有了有效的Stripe和PayPal开发者账号以及相应的API密钥。如果还没有，请先在各自的开发者平台注册和配置。 