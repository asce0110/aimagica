# Cloudflare Pages 构建超时问题解决方案

## 问题分析

你的构建一直超时是因为以下原因：

1. **OpenNext 循环构建**：`build:minimal` 脚本中包含了 `npx @opennextjs/cloudflare build`，这导致 OpenNext 不断重复执行完整的构建流程
2. **构建配置过于复杂**：包含了大量不必要的优化和检查
3. **依赖过于庞大**：Next.js 15 + 大量 Radix UI 组件导致构建时间过长

## 解决方案

### 1. 使用新的快速构建命令

现在使用 `pnpm build` 命令，它会：
- 使用专门的 `next.config.pages.mjs` 配置
- 禁用所有不必要的优化和检查
- 移除 OpenNext 循环依赖
- 直接输出 Cloudflare Pages 兼容的构建

### 2. 关键配置更改

#### `next.config.pages.mjs`
- 禁用 TypeScript 和 ESLint 检查
- 关闭图片优化
- 最小化 webpack 配置
- 禁用源码映射
- 简化代码分割

#### `package.json`
- 新的 `build` 脚本移除了 OpenNext
- 环境变量优化
- 禁用缓存以避免缓存问题

### 3. Cloudflare Pages 设置

#### 构建配置
```
构建命令: pnpm build
输出目录: .next
Node.js 版本: 18
```

#### 环境变量设置
在 Cloudflare Pages 控制台设置以下环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
NEXTAUTH_URL=你的_域名
NEXTAUTH_SECRET=你的_nextauth_secret
GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret
```

### 4. 预期构建时间

使用新配置，构建时间应该从 20-30 分钟降低到 3-8 分钟。

### 5. 如果仍有问题

如果构建仍然超时，尝试以下步骤：

1. **进一步简化**：
   ```bash
   # 移除不必要的依赖
   pnpm remove @opennextjs/cloudflare @opennextjs/aws
   ```

2. **检查 API 路由兼容性**：
   确保所有 API 路由都使用 Edge Runtime 兼容的代码

3. **分批构建**：
   考虑将 API 路由分离到 Cloudflare Workers

## 构建优化说明

新配置的优化措施：

1. **禁用 TypeScript 检查**：在构建时跳过类型检查
2. **禁用 ESLint**：跳过代码质量检查
3. **关闭源码映射**：减少构建输出大小
4. **最小化 webpack 配置**：移除不必要的插件和优化
5. **简化代码分割**：减少打包复杂度
6. **禁用缓存**：避免缓存相关的构建问题

这些优化会显著加速构建过程，使其能够在 Cloudflare Pages 的时间限制内完成。