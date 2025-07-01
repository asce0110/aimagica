# 🚀 Cloudflare 分离式部署指南

## 架构概述

你的网站现在采用**完全分离**的架构：

- **前端（Cloudflare Pages）**: 纯静态 HTML/CSS/JS
- **后端（Cloudflare Workers）**: 所有 API 逻辑

## 🏗️ 部署步骤

### 1. 部署 Workers API（后端）

```bash
# 配置环境变量（在 Cloudflare Dashboard 中设置）
# 需要设置以下变量：
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - NEXTAUTH_SECRET  
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
# - R2_ENDPOINT
# - R2_BUCKET_NAME
# - KIE_FLUX_API_KEY
# - PAYPAL_CLIENT_ID
# - PAYPAL_CLIENT_SECRET

# 部署 Workers
pnpm run deploy:workers
```

Workers 将部署到：`https://aimagica-api.your-subdomain.workers.dev`

### 2. 部署前端（Pages）

```bash
# 设置环境变量指向 Workers API
export NEXT_PUBLIC_API_BASE_URL="https://aimagica-api.your-subdomain.workers.dev"

# 构建并部署前端
pnpm run deploy:static
```

前端将部署到：`https://aimagica.pages.dev`

### 3. 一键部署

```bash
# 同时部署前端和后端
pnpm run deploy:cloudflare
```

## 🔧 本地开发

### 启动 Workers 开发服务器

```bash
pnpm run preview:workers
# API 在 http://localhost:8787
```

### 启动前端开发服务器

```bash
# 设置本地 API 地址
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8787"
pnpm run preview:static
# 前端在 http://localhost:3000
```

## 📋 迁移清单

### ✅ 已完成
- [x] 创建 Workers 基础架构
- [x] 分离前端和后端配置
- [x] 移除前端的 API 路由依赖
- [x] 创建部署脚本

### 🔄 待完成（需要你的 API 逻辑）
- [ ] 将现有 API 逻辑迁移到 Workers
- [ ] 配置环境变量
- [ ] 设置自定义域名（可选）
- [ ] 测试完整功能

## 🎯 下一步

1. **配置 Cloudflare Dashboard**：
   - 在 Workers 中设置环境变量
   - 在 Pages 中连接 GitHub 仓库

2. **迁移 API 逻辑**：
   - 从 `api-backup-migrate/` 复制逻辑到 `workers/api-worker.js`
   - 适配 Workers 环境

3. **自定义域名**（可选）：
   - Pages: `aimagica.com`
   - Workers: `api.aimagica.com`

## 🐛 故障排除

### 前端构建错误
- 确保没有残留的 API 路由引用
- 检查环境变量配置

### Workers 部署错误
- 验证环境变量配置
- 检查 wrangler.toml 配置

### API 调用失败
- 确认 CORS 配置
- 检查 API 基础 URL 配置

## 📞 支持

如果遇到问题，检查：
1. Cloudflare Workers 日志：`pnpm tail:workers`
2. Pages 构建日志
3. 浏览器开发者工具的网络面板