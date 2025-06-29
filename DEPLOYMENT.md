# 🚀 Cloudflare Pages 部署指南

## 📋 部署步骤

### 1. GitHub 仓库连接

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 导航到 **Pages** 标签
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 Cloudflare 访问你的 GitHub 账号
6. 选择 `asce0110/aimagica` 仓库

### 2. 构建配置

在项目设置页面配置：

```bash
# 项目名称
Project name: aimagica

# 生产分支
Production branch: master

# 构建设置
Build command: pnpm build:cf
Build output directory: .next
Root directory: (留空)

# Node.js 版本
Node.js version: 18.17.0
```

### 3. 环境变量

在 **Environment variables** 部分添加必要的环境变量：

#### 基础配置
```bash
NODE_VERSION=18.17.0
NEXT_PUBLIC_SITE_URL=https://aimagica.ai
```

#### 数据库配置（如果使用）
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 认证配置（如果使用）
```bash
NEXTAUTH_URL=https://aimagica.ai
NEXTAUTH_SECRET=your_nextauth_secret_for_production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. 自定义域名设置

1. 在 Cloudflare Pages 项目中点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入 `aimagica.ai`
4. 按照指示配置 DNS 记录：
   ```
   Type: CNAME
   Name: aimagica.ai
   Target: aimagica.pages.dev
   Proxy: Enabled (橙色云朵)
   ```

### 5. 高级设置

#### Functions 兼容性
```bash
Compatibility date: 2024-01-15
Node.js compatibility: enabled
```

#### 构建缓存
- 启用构建缓存以加快部署速度
- 缓存 `node_modules` 和 `.next/cache`

## 🔧 本地测试

在部署前本地测试：

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 本地预览构建结果
pnpm start
```

## 🎯 部署后验证

部署完成后检查：

1. **首页加载** - 访问 https://aimagica.ai
2. **功能测试** - 测试主要功能如图片生成
3. **移动端适配** - 在手机上测试响应式布局
4. **SEO 检查** - 验证 meta 标签和 Open Graph 数据
5. **性能测试** - 使用 Google PageSpeed Insights 检查性能

## 🚨 常见问题

### 文件大小超限错误
如果遇到 "Pages only supports files up to 25 MiB" 错误：

1. **清理构建缓存**：
   ```bash
   pnpm clean
   pnpm build:cf
   ```

2. **检查 .gitignore**：
   确保以下目录被排除：
   ```
   /.next/cache/
   /cache/
   *.pack
   *.map
   ```

3. **使用优化构建命令**：
   - 始终使用 `pnpm build:cf` 而不是 `pnpm build`
   - 这个命令会清理缓存并优化输出

### 构建失败
- 检查 Node.js 版本是否正确
- 确认所有环境变量已设置
- 查看构建日志中的错误信息
- 尝试本地运行 `pnpm build:cf` 测试

### 环境变量问题
- 确保生产环境变量与开发环境一致
- 敏感信息使用 Cloudflare 的环境变量加密

### 域名解析问题
- 确认 DNS 记录正确配置
- 等待 DNS 传播（可能需要几分钟）

### API 路由不工作
- 确认没有使用 `output: 'export'` 配置
- 检查 API 路由文件是否正确部署
- 验证环境变量设置

## 📊 监控和分析

### Cloudflare Analytics
- 在 Cloudflare Dashboard 查看流量分析
- 监控网站性能和可用性

### Web Vitals
- 使用 Cloudflare 的 Web Analytics
- 监控核心 Web 指标

## 🔄 自动部署

每次推送到 `master` 分支都会触发自动部署：

```bash
# 提交代码更改
git add .
git commit -m "Update feature"
git push origin master

# Cloudflare Pages 会自动检测并部署
```

---

## 📞 支持

如遇到部署问题：
1. 查看 Cloudflare Pages 文档
2. 检查构建日志
3. 联系技术支持 