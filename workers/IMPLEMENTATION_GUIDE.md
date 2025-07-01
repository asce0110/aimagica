# 🔧 Workers API 实现指南

## 概述

当前的 `workers/api-worker.js` 提供了基础的路由框架，但需要将你现有的 API 逻辑迁移过来。

## 🚀 快速开始

### 1. 基础架构

已完成的基础架构：
- ✅ 路由处理系统
- ✅ CORS 配置
- ✅ 错误处理
- ✅ 环境变量验证
- ✅ 参数解析

### 2. 需要实现的功能

目前所有的 handler 函数都返回占位符响应，你需要：

```javascript
// 示例：将现有的 /app/api/test/route.ts 迁移到 Workers
async function handleTest(request, env) {
  // 原始代码在 app/api/test/route.ts
  return new Response(JSON.stringify({ 
    message: 'Workers API is working!',
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## 📋 迁移清单

### 核心功能
- [ ] **用户认证** (`handleAuth*`)
  - 从 `app/api/auth/` 迁移 NextAuth 逻辑
  - 配置 JWT 验证
  - 实现登录/登出流程

- [ ] **图片生成** (`handleGenerate*`)
  - 从 `app/api/generate/` 迁移 AI 图片生成逻辑
  - 配置 KieFlux API 调用
  - 实现队列和进度跟踪

- [ ] **图片管理** (`handleImages*`)
  - 从 `app/api/images/` 迁移上传和保存逻辑
  - 配置 R2 存储集成
  - 实现图片处理和优化

### 支付系统
- [ ] **Magic Coins** (`handleMagicCoins*`)
  - 从 `app/api/magic-coins/` 迁移余额管理
  - 实现交易记录
  - 配置套餐管理

- [ ] **支付处理** (`handlePayment*`)
  - 从 `app/api/payment/` 迁移支付逻辑
  - 配置 PayPal 集成
  - 实现 Webhook 处理

### 数据管理
- [ ] **画廊功能** (`handleGallery*`)
  - 从 `app/api/gallery/` 迁移画廊逻辑
  - 实现评论系统
  - 配置公开/私有切换

- [ ] **用户提示词** (`handleUserPrompts`)
  - 从 `app/api/user-prompts/` 迁移提示词管理
  - 实现点赞和使用统计
  - 配置社区分享

### 管理功能
- [ ] **管理员面板** (`handleAdmin*`)
  - 从 `app/api/admin/` 迁移管理逻辑
  - 实现用户管理
  - 配置系统统计

## 🔧 实现模板

### 基础 API 模板

```javascript
async function handleYourAPI(request, env, context) {
  try {
    // 1. 解析请求
    const { method } = request
    const { params, searchParams } = context
    
    // 2. 验证认证（如需要）
    const user = await verifyAuth(request, env)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // 3. 处理不同 HTTP 方法
    switch (method) {
      case 'GET':
        return handleGet(request, env, params)
      case 'POST':
        return handlePost(request, env, params)
      case 'PUT':
        return handlePut(request, env, params)
      case 'DELETE':
        return handleDelete(request, env, params)
      default:
        return createErrorResponse('Method not allowed', 405)
    }
  } catch (error) {
    console.error('API Error:', error)
    return createErrorResponse('Internal Server Error', 500)
  }
}
```

### Supabase 集成模板

```javascript
async function getSupabaseClient(env) {
  const { createClient } = await import('@supabase/supabase-js')
  
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

async function handleDatabaseOperation(request, env) {
  const supabase = await getSupabaseClient(env)
  
  // 示例：查询数据
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .limit(10)
  
  if (error) {
    return createErrorResponse(error.message, 500)
  }
  
  return new Response(JSON.stringify({ data }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### R2 存储模板

```javascript
async function handleFileUpload(request, env) {
  const formData = await request.formData()
  const file = formData.get('file')
  
  if (!file) {
    return createErrorResponse('No file provided', 400)
  }
  
  // R2 上传逻辑
  const key = `uploads/${Date.now()}-${file.name}`
  
  // 这里需要实现 R2 上传逻辑
  // 参考你现有的 lib/storage/r2.ts
  
  return new Response(JSON.stringify({ 
    success: true,
    url: `${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## 🔄 迁移策略

### 选项 1：逐步迁移
1. 先实现核心API（认证、图片生成）
2. 测试基础功能
3. 逐步添加其他功能

### 选项 2：全量迁移
1. 将所有现有 API 路由逻辑复制到 Workers
2. 适配 Workers 环境差异
3. 统一测试部署

## 🔍 调试和测试

### 本地测试
```bash
# 启动本地 Workers 开发服务器
pnpm preview:workers

# 测试 API 端点
curl http://localhost:8787/api/test
```

### 生产调试
```bash
# 查看 Workers 实时日志
pnpm tail:workers

# 检查特定 API 调用
curl https://your-workers-domain.workers.dev/api/test
```

## 📚 参考资料

### 现有代码位置
- **API 路由**: `app/api/` 目录
- **数据库操作**: `lib/database/` 目录
- **存储操作**: `lib/storage/` 目录
- **服务集成**: `lib/services/` 目录

### Workers 环境差异
- **无 Node.js**：使用 Web APIs 替代 Node.js 模块
- **边缘运行时**：某些 npm 包可能不兼容
- **环境变量**：通过 `env` 参数访问，不是 `process.env`

### 迁移优先级
1. **高优先级**：认证、图片生成、基础存储
2. **中优先级**：支付、用户管理、画廊
3. **低优先级**：管理功能、统计、调试工具

## 🚀 下一步

1. 选择迁移策略（建议从核心功能开始）
2. 复制现有 API 逻辑到对应的 handler 函数
3. 适配 Workers 环境（替换 Node.js 依赖）
4. 测试和调试
5. 部署到生产环境

需要具体实现某个 API 的帮助时，请提供现有的代码，我可以帮你适配到 Workers 环境。 