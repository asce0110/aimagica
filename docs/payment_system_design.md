# 支付系统架构设计

## 数据库扩展方案

### 新增表结构

```sql
-- 支付提供商配置表
CREATE TABLE payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    config JSONB NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订阅计划表
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户订阅表（扩展现有）
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS
    payment_provider_id UUID REFERENCES payment_providers(id),
    external_subscription_id VARCHAR(255),
    payment_method_id VARCHAR(255),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    billing_address JSONB,
    payment_history JSONB DEFAULT '[]'::jsonb;

-- 支付交易记录表
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES payment_providers(id),
    plan_id UUID REFERENCES subscription_plans(id),
    external_transaction_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'subscription', 'one_time', 'refund'
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    webhook_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付配置审计表
CREATE TABLE payment_config_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'enable', 'disable'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_payment_providers_enabled ON payment_providers(enabled, priority);
CREATE INDEX idx_subscription_plans_enabled ON subscription_plans(enabled, type);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id, created_at);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status, created_at);
```

## 管理员配置界面设计

### 支付提供商管理页面
- 支持添加/编辑多个支付提供商
- 实时配置验证
- 沙盒/生产环境切换
- API密钥安全存储

### 订阅计划管理页面
- 可视化计划创建器
- 功能权限配置
- 定价策略管理
- A/B测试支持

## API设计

### 管理员API
```typescript
// 支付提供商管理
POST   /api/admin/payment/providers
GET    /api/admin/payment/providers
PUT    /api/admin/payment/providers/:id
DELETE /api/admin/payment/providers/:id
POST   /api/admin/payment/providers/:id/test

// 订阅计划管理
POST   /api/admin/payment/plans
GET    /api/admin/payment/plans
PUT    /api/admin/payment/plans/:id
DELETE /api/admin/payment/plans/:id

// 交易监控
GET    /api/admin/payment/transactions
GET    /api/admin/payment/analytics
GET    /api/admin/payment/refunds
```

### 用户API
```typescript
// 获取可用支付方式和计划
GET    /api/payment/plans
GET    /api/payment/providers

// 订阅管理
POST   /api/payment/subscribe
GET    /api/payment/subscription
PUT    /api/payment/subscription
DELETE /api/payment/subscription

// 支付处理
POST   /api/payment/create-checkout
POST   /api/payment/webhooks/:provider
GET    /api/payment/history
```

## 前后端分离实施步骤

### 第一步：抽取API层
1. 保持现有Next.js前端
2. 创建独立Express.js后端
3. 逐步迁移API路由
4. 设置CORS和认证

### 第二步：实现支付系统
1. 创建支付配置数据库
2. 实现管理员配置界面
3. 集成多个支付提供商
4. 实现webhook处理

### 第三步：前端分离
1. 创建纯React前端项目
2. 实现API客户端
3. 迁移现有页面组件
4. 配置路由和状态管理

## 安全考虑

### API安全
- JWT认证 + Refresh Token
- API请求限制
- 输入验证和SQL注入防护
- HTTPS强制

### 支付安全
- 敏感信息加密存储
- Webhook签名验证
- PCI DSS合规
- 审计日志记录

## 部署方案

### 推荐架构
```
用户 → CDN → 前端(Vercel) → API网关 → 后端(Railway/Heroku)
                                    ↓
                              数据库(Supabase)
```

### 成本分析
- 前端：Vercel免费版够用
- 后端：Railway $5/月起
- 数据库：Supabase现有方案
- 总增加成本：约$5-10/月 