# ⚡ Aimagica Workers

Cloudflare Workers 用于处理轻量级 API 和边缘计算任务。

## 🚀 快速开始

### 1. 安装 Wrangler
```bash
npm install -g wrangler
# 或者
pnpm add -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```

### 3. 部署 Worker
```bash
# 开发环境部署
wrangler deploy --env dev

# 生产环境部署  
wrangler deploy --env production
```

## 📁 文件结构

```
workers/
├── auth-worker.js          # 身份验证和代理服务
├── wrangler.toml          # 配置文件
└── README.md              # 说明文档
```

## 🔧 配置说明

### 环境变量
在 Cloudflare Dashboard 中配置敏感信息：

```bash
# 在 Workers & Pages > aimagica-auth-worker > Settings > Environment variables
JWT_SECRET=your_jwt_secret_key
INTERNAL_API_KEY=your_internal_api_key
```

### 自定义域名
配置子域名指向 Worker：

1. 在 Cloudflare DNS 中添加：
   ```
   Type: AAAA
   Name: auth
   Value: 100:: (IPv6 placeholder)
   ```

2. 在 Workers 路由中配置：
   ```
   Route: auth.aimagica.ai/*
   Worker: aimagica-auth-worker
   ```

## 🎯 功能说明

### 身份验证 API
```
POST /api/auth/token       # Token 验证
GET  /api/health          # 健康检查
```

### 代理服务
```
GET /api/proxy/avatar     # 头像代理
POST /api/users/sync      # 用户数据同步
```

## 📊 监控

在 Cloudflare Dashboard 中查看：
- 请求数量和延迟
- 错误率和状态码
- CPU 使用时间
- 内存使用情况

## 🔍 本地开发

```bash
# 启动本地开发服务器
wrangler dev

# 指定环境
wrangler dev --env dev

# 指定端口
wrangler dev --port 8787
```

## 🚨 注意事项

1. **CPU 限制**: Workers 有 CPU 时间限制（生产环境 50ms）
2. **内存限制**: 最大 128MB 内存
3. **请求大小**: 最大 100MB 请求体
4. **脚本大小**: 最大 1MB 压缩后
5. **运行时间**: 最长 30 秒执行时间

## 📈 扩展计划

### 短期目标
- [x] 身份验证 Worker
- [ ] 图片代理 Worker  
- [ ] 缓存优化 Worker

### 长期目标
- [ ] 边缘数据库集成
- [ ] 实时通信 Worker
- [ ] AI 预处理 Worker

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 指南](https://developers.cloudflare.com/workers/wrangler/)
- [项目主架构指南](../CLOUDFLARE_ARCHITECTURE_GUIDE.md) 