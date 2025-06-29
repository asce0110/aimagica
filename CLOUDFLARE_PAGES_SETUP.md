# Cloudflare Pages 部署设置指南

## 🚀 部署步骤

### 1. GitHub 连接
- 访问 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
- 点击 "Create a project"
- 选择 "Connect to Git"
- 选择仓库：`asce0110/aimagica`

### 2. 构建配置
```
Framework preset: Next.js
Build command: pnpm build:cf
Build output directory: .next
```

### 3. 必须配置的环境变量

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=https://vvrkbpnnlxjqyhmmovro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的真实anon_key
SUPABASE_SERVICE_ROLE_KEY=您的真实service_role_key
```

#### Google OAuth 配置
```
GOOGLE_CLIENT_ID=您的Google客户端ID
GOOGLE_CLIENT_SECRET=您的Google客户端密钥
```

#### NextAuth 配置
```
NEXTAUTH_URL=https://aimagica.pages.dev
NEXTAUTH_SECRET=您的随机密钥字符串
```

#### Cloudflare R2 配置
```
R2_ACCOUNT_ID=9a54200354c496d0e610009d7ab97c17
R2_ACCESS_KEY_ID=您的R2访问密钥ID
R2_SECRET_ACCESS_KEY=您的R2秘密访问密钥
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.aimagica.ai
```

#### CDN 和构建优化
```
NEXT_PUBLIC_ENABLE_CDN=true
SKIP_BUILD_STATIC_GENERATION=true
NEXT_DISABLE_SWC=false
```

## 🔐 环境变量设置位置

1. 登录 Cloudflare Dashboard
2. 进入 Pages 项目
3. 点击 "Settings" 标签
4. 点击 "Environment variables"
5. 添加 "Production" 环境变量

## ✅ 验证部署

部署成功后，检查以下功能：
- [ ] 首页加载正常
- [ ] 用户登录功能
- [ ] 图像生成功能
- [ ] 管理后台访问
- [ ] R2 CDN图像加载

## 🛠️ 故障排除

### 构建失败
- 确保所有环境变量已设置
- 检查R2存储桶权限
- 验证Supabase连接

### 运行时错误
- 检查Cloudflare Pages日志
- 验证API路由响应
- 确认数据库连接状态

## 📊 性能优化

已实现的优化：
- ✅ R2 CDN静态资源
- ✅ 代码分割和懒加载
- ✅ 图像压缩和缓存
- ✅ API路由优化
- ✅ 构建大小控制(<25MB) 