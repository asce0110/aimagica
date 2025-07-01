# API 路由备份

这个目录包含了所有的 API 路由，暂时从 app/api 移动到这里以支持静态导出模式。

## 原因

Next.js 静态导出模式 (`output: 'export'`) 不支持 API 路由。
为了让 Cloudflare Pages 部署成功，我们暂时禁用了所有 API 功能。

## 恢复 API 功能的方案

### 方案 1: Cloudflare Functions
将这些 API 路由转换为 Cloudflare Functions

### 方案 2: 独立 API 服务
部署独立的 API 服务（如 Vercel Functions 或 Netlify Functions）

### 方案 3: 回到 SSR 模式
放弃静态导出，回到服务端渲染模式（需要解决兼容性问题）

## API 路由列表

包含 75 个 API 端点，涵盖：
- 用户认证和管理
- 图像生成和处理
- 支付系统
- 管理后台
- 数据统计
- 文件上传
- 社区功能

## 注意事项

这些 API 路由包含完整的业务逻辑，只是暂时禁用。
一旦找到合适的解决方案，可以快速恢复功能。 