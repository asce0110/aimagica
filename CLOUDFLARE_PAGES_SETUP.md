# Cloudflare Pages 部署设置指南

## 🚀 快速部署

### 1. 环境变量配置

在 Cloudflare Dashboard > Settings > Environment variables 中添加以下变量：

#### 核心配置（必须）
```bash
# CDN配置
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_BASE_URL=https://images.aimagica.ai

# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://vvrkbpnnlxjqyhmmovro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cmticG5ubHhqcXlobW1vdnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTAzMzQsImV4cCI6MjA1MDE4NjMzNH0.OPgJGMi2mQRnUxL-KJ3TdWNDKRzYVYZVMZJlAfOJAkw

# 生产环境标识
NODE_ENV=production
```

#### NextAuth配置（如需认证功能）
```bash
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=https://your-site.pages.dev
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. 构建设置

在 Cloudflare Pages > Settings > Builds and deployments：

```bash
Build command: pnpm build
Build output directory: out
Node.js version: 18.17.0
```

### 3. 验证部署

部署成功后，检查以下功能：

1. **静态图片加载**：
   - Logo: `https://your-site.pages.dev/images/aimagica-logo.png`
   - 应该自动重定向到: `https://images.aimagica.ai/images/aimagica-logo.png`

2. **CDN状态检查**：
   - 打开浏览器开发者工具 > Network
   - 刷新页面，检查图片请求是否指向`images.aimagica.ai`

3. **控制台日志**：
   - 应该看到: `📦 Loaded static URL mapping: 15 files`

## 🔧 故障排除

### 问题1: 图片无法加载（404错误）

**原因**: CDN环境变量未设置或设置错误

**解决方案**:
1. 确认设置了 `NEXT_PUBLIC_ENABLE_CDN=true`
2. 确认设置了 `NEXT_PUBLIC_CDN_BASE_URL=https://images.aimagica.ai`
3. 重新部署网站

### 问题2: 显示本地图片路径

**原因**: 环境变量未生效或CDN未启用

**解决方案**:
1. 检查Environment variables页面是否正确保存
2. 确认是Production环境（不是Preview）
3. 清除Cloudflare缓存并重新部署

### 问题3: 部署失败

**原因**: 构建配置或依赖问题

**解决方案**:
1. 检查Build logs中的具体错误
2. 确认使用了正确的Node.js版本
3. 清除依赖缓存：删除`.next`目录并重新构建

## 📊 性能监控

部署成功后的预期性能：
- 首页加载: < 2秒
- 图片加载: < 1秒 (CDN加速)
- 构建时间: 2-3分钟

## 🔗 相关链接

- [项目GitHub](https://github.com/asce0110/aimagica)
- [Cloudflare R2文档](https://developers.cloudflare.com/r2/)
- [Next.js静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) 