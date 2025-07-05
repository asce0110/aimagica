# 🎨 Aimagica - AI Image Generator & Art Creation Platform

[![Website](https://img.shields.io/badge/Website-aimagica.ai-blue)](https://aimagica.ai)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)](https://aimagica.ai)

**Aimagica** is a cutting-edge AI-powered image generation platform that transforms your ideas into stunning visual art. Create professional-quality images from text descriptions, edit existing images with advanced AI tools, and explore endless creative possibilities.

## 🌟 Features

### ✨ AI Image Generation
- **Text to Image**: Transform any text description into beautiful artwork
- **Image to Image**: Upload images and apply AI transformations
- **Multiple Art Styles**: Choose from dozens of artistic styles including:
  - Realistic Photography
  - Digital Art & Illustration
  - Fantasy & Sci-Fi
  - Vintage & Retro
  - Anime & Manga
  - Abstract & Modern Art

### 🎯 Advanced Tools
- **Smart Sketch Canvas**: Draw and edit images with AI assistance
- **Style Transfer**: Apply any artistic style to your images
- **Aspect Ratio Control**: Perfect sizing for social media, prints, and web
- **Bulk Generation**: Create multiple variations instantly
- **High Resolution Output**: Professional quality images up to 4K

### 🎮 Interactive Features
- **Waiting Game**: Play Schulte Grid games while your images generate
- **Community Gallery**: Share and discover amazing AI artwork
- **Prompt Library**: Access thousands of tested prompts
- **Favorites System**: Save and organize your best creations

## 🚀 Getting Started

Visit [**aimagica.ai**](https://aimagica.ai) to start creating amazing AI art:

1. **Enter Your Prompt**: Describe what you want to create
2. **Choose Your Style**: Select from our curated art styles
3. **Generate**: Watch AI bring your vision to life
4. **Share & Save**: Download or share your masterpiece

## 🎨 Use Cases

### Creative Professionals
- **Concept Art**: Rapid prototyping for games, films, and design
- **Marketing Materials**: Eye-catching visuals for campaigns
- **Social Media Content**: Engaging posts and stories
- **Book Illustrations**: Custom artwork for publications

### Personal Projects
- **Social Media**: Unique profile pictures and posts
- **Gifts**: Personalized artwork for loved ones
- **Home Decor**: Custom art prints for your space
- **Creative Exploration**: Experiment with different art styles

### Business Applications
- **Website Graphics**: Professional images for your site
- **Product Mockups**: Visualize ideas before production
- **Brand Assets**: Unique visual elements for your brand
- **Presentations**: Compelling visuals for pitches and reports

## 🔥 Popular Styles

- **🏞️ Landscape Photography**: Breathtaking nature scenes
- **👨‍🎨 Portrait Art**: Professional character illustrations
- **🏰 Fantasy Art**: Magical worlds and creatures
- **🤖 Sci-Fi Concepts**: Futuristic technology and scenes
- **🌸 Anime Style**: Japanese animation-inspired art
- **🎭 Classical Art**: Renaissance and baroque masterpieces
- **🌈 Pop Art**: Bold, colorful modern designs

## 💎 Key Benefits

✅ **No Design Skills Required** - Anyone can create professional art  
✅ **Lightning Fast** - Generate images in seconds, not hours  
✅ **Unlimited Creativity** - Explore any style or concept  
✅ **High Quality Output** - Professional resolution and clarity  
✅ **Cost Effective** - Affordable alternative to hiring artists  
✅ **Commercial Use** - Full rights to your generated images  

## 🌐 Supported Platforms

- **💻 Desktop**: Full-featured web experience
- **📱 Mobile**: Optimized mobile interface
- **📊 API Access**: Integrate AI generation into your apps
- **🔗 Social Sharing**: Direct sharing to all major platforms

## 🎯 SEO Keywords

**AI Image Generator** | **Text to Image AI** | **AI Art Creator** | **Artificial Intelligence Art** | **AI Photo Generator** | **Digital Art AI** | **AI Illustration Tool** | **Creative AI Platform** | **AI Design Assistant** | **Automated Art Creation**

## 📞 Support & Community

- 🌐 **Website**: [aimagica.ai](https://aimagica.ai)
- 📧 **Support**: Create amazing art with our AI-powered platform
- 🎨 **Gallery**: Explore community creations
- 📚 **Tutorials**: Learn advanced generation techniques

## 🏆 Why Choose Aimagica?

- **🎯 User-Friendly**: Intuitive interface for all skill levels
- **⚡ Fast Generation**: Quick results without compromise on quality
- **🎨 Diverse Styles**: Largest collection of AI art styles
- **💡 Smart Features**: Advanced tools like sketch canvas and style mixing
- **🌟 Regular Updates**: New features and styles added frequently
- **🔒 Privacy Focused**: Your creations remain private unless you choose to share

### R2 CDN 部署状态 ✅
- **静态资源CDN**: 15个文件已上传到R2 (2.19MB)
- **CDN域名**: https://images.aimagica.ai
- **主要资源**: Logo (1021KB), 背景图 (1.2MB), 示例图标 (4个), 占位符 (9个)

### 🚀 OpenNext.js 部署选项

项目现在支持使用OpenNext.js进行更灵活的云部署：

#### 什么是OpenNext.js？
OpenNext.js是一个开源工具，可以将Next.js应用转换为可部署到各种云平台的包，提供：
- **更好的SSR支持**: 解决复杂的服务器端渲染问题
- **函数分割**: API路由和页面路由独立打包
- **云平台兼容**: 支持AWS Lambda、Node.js服务器等
- **冷启动优化**: 几乎没有冷启动时间

#### 🚀 新版本构建优化 (2025-01-30)

**解决构建时间长和超时问题：**

```bash
# 安装依赖
pnpm install

# 🚀 极简构建 (最快速度) - 解决超时！
pnpm build

# ⚡ 超快速构建 (保留更多功能)
pnpm build:turbo

# 🏃 快速构建 (保留缓存)
pnpm build:fast

# 🧹 完整清理构建 (生产环境)
pnpm build:clean

# 输出将在 .open-next/assets 目录中
```

**🚀 最新构建优化策略（解决20分钟超时）：**
- ✅ **极简模式**: 关闭所有优化功能，最大化构建速度
- ✅ **依赖优化**: `--no-optional --prefer-offline` 跳过可选包
- ✅ **Node.js锁定**: 使用稳定版本18.20.4
- ✅ **webpack最小化**: 关闭源码映射和性能检查
- ✅ **预期时间**: 2-3分钟完成（vs 之前20分钟超时）

#### 配置文件说明
- **`next.config.mjs`**: 标准配置，包含复杂webpack优化（用于本地开发）
- **`next.config.minimal.mjs`**: **🚀 极简构建配置**（关闭所有优化，解决超时）
- **`next.config.fast.mjs`**: **⚡ 超快速构建配置**（移除优化，最小编译步骤）
- **`next.config.opennext.mjs`**: 简化配置，用于 OpenNext.js 构建（支持 AWS 和 Cloudflare）
- **`cloudflare-build.sh`**: **☁️ Cloudflare专用构建脚本**（优化依赖安装）
- **`open-next.config.ts`**: OpenNext.js AWS 部署配置  
- **`open-next.cloudflare.config.ts`**: **OpenNext.js Cloudflare 专用配置**

#### 🛠️ 构建问题排查

**如果遇到构建超时：**
```bash
# 1. 使用监控脚本了解构建进度
pnpm build:monitor "pnpm build:minimal"

# 2. 检查磁盘空间和内存
df -h

# 3. 清理全部缓存和重试
pnpm clean && pnpm build:minimal

# 4. 如果还超时，检查具体哪个阶段慢
tail -f build-monitor.log
```

**🔧 已修复的构建问题：**
- ✅ **环境变量检查错误**：`supabaseKey is required` (构建时不应检查)
- ✅ **依赖安装优化**：跳过可选依赖，使用离线缓存
- ✅ **webpack配置简化**：关闭源码映射和性能检查
- ✅ **懒加载数据库客户端**：仅在运行时初始化
- ✅ **🆕 核心服务器函数修复** (2025-01-30)：修复 `lib/supabase-server.ts` 中 `createServiceRoleClient()` 等函数的构建时环境变量检查问题
- ✅ **🆕 Magic Coins 服务修复**：将 `MagicCoinService` 改为懒加载模式，避免模块顶层立即创建客户端
- ✅ **🆕 Next.js 15 404页面错误修复** (2025-07-01)：
  - 问题：`Error: <Html> should not be imported outside of pages/_document`
  - 原因：混合使用 App Router + Pages Router 时，Next.js 15 在处理404页面时出现冲突
  - 解决方案：
    1. 删除 `pages/404.js` 文件，避免与内部错误处理冲突
    2. 创建 `app/not-found.tsx` 文件，正确处理 App Router 的 404 页面
    3. 修改 `next.config.pages.mjs`，移除 appDir 显式配置和 rewrites fallback
    4. 让 Next.js 自动处理混合路由的 404 页面生成
- ✅ **🆕 图片加载问题修复** (2025-07-01)：
  - 问题：Gallery页面和首页Hero区域图片无法加载
  - 原因：错误地替换了 `MagicImage` 组件为普通 `img` 标签，丢失了Next.js图片优化；Gallery页面使用硬编码数据而非API；HeroSection使用错误的API路径
  - 解决方案：
- ✅ **🆕 桌面端字体优化修复** (2025-07-01)：
  - 问题：桌面端所有字体被强制覆盖为Fredoka One，导致Style Management页面等字体过粗，可读性差；Style卡片描述文字颜色过浅
  - 原因：globals.css中的强制字体覆盖规则 + Admin Dashboard页面大量内联字体样式 + 浅色文字颜色(#8b7355)
  - 解决方案：
    1. 恢复原始字体策略：标题使用科技感字体(Orbitron)，正文使用现代字体(Space Grotesk)
    2. 仅对特定魔法主题元素使用Fredoka One字体(.font-magic, .hero-title等)
    3. **移除所有内联字体样式**：从Admin Dashboard页面移除`style={{ fontFamily: "Fredoka One..." }}`
    4. **优化文字颜色对比度**：将浅色文字(#8b7355)改为深色(#2d3e2d)，提升可读性
    5. 添加强制CSS规则确保Admin Dashboard字体正确应用
    6. 保留Gallery页面的Comic Sans MS艺术风格
    1. 恢复 `MagicImage` 组件使用，保持Next.js图片优化和错误处理
    2. 恢复Gallery页面完整API调用逻辑，从workers数据库加载真实图片
    3. 修复HeroSection组件API路径，使用 `getApiEndpoint('GALLERY_PUBLIC')` 获取正确的workers API URL
    4. 添加API数据格式转换，确保兼容现有接口
    5. 保持fallback机制，API失败时使用静态示例数据

**构建时间对比（解决20分钟超时问题）：**
- 🐌 `build:clean`: 8-12分钟 (全清理)
- 🏃 `build:fast`: 5-8分钟 (保留缓存)  
- ⚡ `build:turbo`: 3-5分钟 (关闭优化)
- 🚀 `build:minimal`: **2-3分钟** (极简模式，解决超时)

#### 构建过程
1. 自动备份当前配置文件
2. 切换到简化的OpenNext.js兼容配置
3. 执行Next.js构建
4. 运行OpenNext.js转换
5. 恢复原始配置文件

#### 🚀 Cloudflare Pages 部署
**使用官方推荐的 @opennextjs/cloudflare 适配器：**
```bash
pnpm build:cf
```
这个命令会：
1. 清理旧的构建文件
2. **自动切换到 OpenNext.js 简化配置**（`next.config.opennext.mjs`）
3. 执行 Next.js 构建
4. **使用 @opennextjs/cloudflare build** 命令转换（专为 Cloudflare 优化）
5. 输出到 `.open-next/assets` 目录
6. **清理缓存文件**：移除 `.open-next/assets/cache` 目录避免超过25MB限制
7. **恢复原始配置文件**

✅ **优势：** 
- **官方推荐的方式**（2025年4月发布）
- **支持 API 路由和 Node.js runtime**
- **专门为 Cloudflare Workers 优化**
- **避免复杂的 webpack 配置问题**

### 🏗️ 混合架构部署（推荐）

**最佳实践：Cloudflare Workers (API) + Cloudflare Pages (前端)**

这种架构分离前后端，利用各自的优势：

#### 架构图
```
┌─────────────────┐    API请求     ┌─────────────────┐
│ Cloudflare Pages│ ─────────────► │Cloudflare Workers│
│                 │                │                  │
│ ✅ Next.js前端  │                │ ✅ 75个API路由   │
│ ✅ 静态优化     │                │ ✅ 边缘计算      │
│ ✅ CDN分发      │                │ ✅ 无服务器      │
│ ✅ SEO友好      │                │ ✅ 低延迟       │
└─────────────────┘                └─────────────────┘
```

#### 🚀 一键部署
```bash
# 混合架构完整部署
pnpm deploy:hybrid
```

#### 分步部署
```bash
# 1. 部署API后端到Workers
pnpm deploy:api

# 2. 部署前端到Pages
pnpm deploy:pages

# 3. 或者分别构建
pnpm build:pages  # 构建前端静态文件
pnpm build:workers # 构建Workers（如需要）
```

#### 🔧 配置文件
| 文件 | 用途 | 特点 |
|------|------|------|
| `next.config.pages.mjs` | Pages前端配置 | 静态导出、CDN优化 |
| `wrangler.api.toml` | API Workers配置 | 专注API服务 |
| `workers/api-only.js` | API Workers代码 | 轻量级、高性能 |

#### 🌐 部署结果
- **前端**: https://aimagica.pages.dev  
- **API后端**: https://aimagica-api.403153162.workers.dev  
- **CDN资源**: https://images.aimagica.ai  

#### ✅ 优势对比

| 特性 | 单体Workers | **混合架构** | 单体Pages |
|------|-------------|-------------|-----------|
| 前端性能 | ⚡ 中等 | 🚀 **最优** | ⚡ 良好 |
| API性能 | 🚀 最优 | 🚀 **最优** | ❌ 受限 |
| SEO优化 | ⚡ 中等 | 🚀 **最优** | 🚀 优秀 |
| 缓存策略 | ⚡ 中等 | 🚀 **最优** | ⚡ 良好 |
| 扩展性 | ⚡ 中等 | 🚀 **最优** | ⚡ 中等 |
| 维护性 | ⚡ 中等 | 🚀 **最优** | ⚡ 良好 |

#### 🔗 API代理配置
前端自动代理API请求到Workers：
```javascript
// next.config.pages.mjs
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://aimagica-api.403153162.workers.dev/api/:path*',
    },
  ]
}
```

#### 📊 环境变量配置
在Cloudflare Pages中设置：
```bash
NEXT_PUBLIC_API_BASE_URL=https://aimagica-api.403153162.workers.dev
NEXT_PUBLIC_CDN_URL=https://images.aimagica.ai
NODE_ENV=production
```

### 🔧 详细部署指南：Cloudflare Pages + Workers 混合架构

#### 📋 部署前准备

**1. 验证配置**
```bash
# 检查所有配置文件是否就绪
pnpm verify:cloudflare
```

**2. 安装 Wrangler CLI**
```bash
# 全局安装
npm install -g wrangler

# 或使用项目依赖
pnpm install

# 登录 Cloudflare
wrangler login
```

#### 🔨 步骤1：部署 Workers API

**配置 Workers 环境变量**

在 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → aimagica-api → Settings → Variables：

```bash
# 核心配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_32_char_random_secret

# R2 存储
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=aimagica-storage

# AI 服务
KIEFLUX_API_KEY=your_kieflux_api_key
KIEFLUX_API_URL=https://api.kieflux.com

# 支付配置
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

**部署 Workers**
```bash
# 部署 API Workers
pnpm deploy:workers

# 或使用 wrangler 直接部署
wrangler deploy --config wrangler.workers.toml
```

**获取 Workers 域名**
```bash
# 部署成功后，记录显示的域名
✅ https://aimagica-api.your-subdomain.workers.dev
```

#### 🔨 步骤2：部署 Pages 前端

**更新 API 基础 URL**

更新 `next.config.pages.mjs` 和 `wrangler.pages.toml` 中的 Workers 域名：

```javascript
// next.config.pages.mjs
env: {
  NEXT_PUBLIC_API_BASE_URL: 'https://aimagica-api.your-subdomain.workers.dev',
}

// wrangler.pages.toml
[[redirects]]
from = "/api/*"
to = "https://aimagica-api.your-subdomain.workers.dev/api/:splat"
```

**配置 Pages 环境变量**

在 Cloudflare Dashboard → Pages → aimagica-pages → Settings → Environment Variables：

```bash
# 前端配置
NEXT_PUBLIC_API_BASE_URL=https://aimagica-api.your-subdomain.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.aimagica.ai
NEXTAUTH_URL=https://aimagica.pages.dev
NEXTAUTH_SECRET=your_32_char_random_secret
NODE_ENV=production
```

**构建和部署 Pages**
```bash
# 构建前端静态文件
pnpm build:pages

# 部署到 Pages
pnpm deploy:pages

# 或使用 wrangler 直接部署
wrangler pages deploy out --project-name aimagica-pages
```

#### 🔨 步骤3：连接测试

**测试 API 连接**
```bash
# 测试 Workers API
curl https://aimagica-api.your-subdomain.workers.dev/api/test

# 应该返回
{"message":"Workers API is working!","timestamp":"..."}
```

**测试前端**
```bash
# 访问前端网站
open https://aimagica.pages.dev

# 检查 API 代理是否工作
# 浏览器开发者工具 → Network → 查看 /api/ 请求是否代理到 Workers
```

#### 🔨 步骤4：自定义域名（可选）

**设置 Workers 自定义域名**

1. 在 Cloudflare Dashboard → Workers & Pages → aimagica-api → Settings → Triggers
2. 添加自定义域名：`api.yourdomain.com`
3. 配置 DNS 记录（自动）

**设置 Pages 自定义域名**

1. 在 Cloudflare Dashboard → Pages → aimagica-pages → Custom domains
2. 添加自定义域名：`yourdomain.com`
3. 配置 DNS 记录（自动）

**更新配置**
```bash
# 更新环境变量
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# 更新重定向配置
# wrangler.pages.toml
to = "https://api.yourdomain.com/api/:splat"
```

#### 🔍 故障排除

**常见问题1：API 路由 404**
```bash
# 检查 Workers 部署状态
wrangler tail aimagica-api

# 检查路由配置
curl -v https://aimagica-api.your-subdomain.workers.dev/api/test
```

**常见问题2：CORS 错误**
```javascript
// 检查 workers/api-worker.js 中的 CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
}
```

**常见问题3：环境变量未生效**
```bash
# 重新部署 Workers
wrangler deploy --config wrangler.workers.toml

# 重新部署 Pages
wrangler pages deploy out --project-name aimagica-pages --compatibility-date 2024-01-01
```

#### 📊 部署完成检查清单

- [ ] ✅ Workers API 部署成功
- [ ] ✅ Pages 前端部署成功
- [ ] ✅ API 基础 URL 配置正确
- [ ] ✅ 环境变量全部设置
- [ ] ✅ CORS 配置正确
- [ ] ✅ 测试 API 连接成功
- [ ] ✅ 前端可以调用 API
- [ ] ✅ 用户认证正常
- [ ] ✅ 图片上传/显示正常
- [ ] ✅ 支付功能正常（如果启用）

#### 🚀 一键部署脚本

**完整部署流程**
```bash
# 1. 验证配置
pnpm verify:cloudflare

# 2. 部署所有服务
pnpm deploy:cloudflare

# 3. 监控部署状态
pnpm tail:workers
```

#### OpenNext.js 适配器选择
- **`@opennextjs/cloudflare`** → **Cloudflare Pages/Workers** （官方推荐，使用 `pnpm build:cf`）
- **`@opennextjs/aws`** → **AWS Lambda** （使用 `pnpm build:opennext`）
- 两者都支持完整的 Next.js 功能（API 路由、SSR、Node.js runtime 等）
- **2025年更新：** Cloudflare 官方推荐使用 OpenNext.js 而不是 next-on-pages

#### ⚠️ 注意事项
- OpenNext.js构建会自动使用简化配置，避免webpack冲突
- 构建完成后会自动恢复原始配置文件
- 如果构建失败，请手动恢复配置：`mv next.config.mjs.backup next.config.mjs`

#### 🔧 常见构建问题

**✅ 最新修复（2025-01-30）：Supabase客户端构建时初始化错误**
```
Error: Supabase environment variables are not configured
    at createFastServiceRoleClient (.next/server/chunks/7706.js:36:7629)
    at new MagicCoinService (.next/server/app/api/magic-coins/balance/route.js:1:4699)
Failed to collect page data for /api/magic-coins/balance
```
**问题原因：** 
1. `lib/supabase-server.ts` 中的 `createServiceRoleClient()` 等函数在构建时立即检查环境变量
2. `MagicCoinService` 类在模块顶层就创建 Supabase 客户端
3. Next.js 构建时预加载模块触发环境变量检查，但构建环境没有真实凭据

**解决方案：**
1. ✅ **修复核心服务器函数**：在 `lib/supabase-server.ts` 中添加构建时占位符逻辑
2. ✅ **懒加载模式**：将 `MagicCoinService` 的 Supabase 客户端改为 getter 属性懒加载
3. ✅ **环境检查优化**：构建时使用占位符，生产运行时才进行严格检查
4. ✅ **涉及文件**：`lib/supabase-server.ts`, `lib/magic-coins.ts`, 8个API路由文件

**✅ 跨平台兼容性问题**
```
sh: 1: powershell: not found
ELIFECYCLE Command failed with exit code 1
```
**问题原因：** Windows 特定的 PowerShell 命令在 Linux 构建环境中失败
**解决方案：** 
1. ✅ **修复 clean 脚本**：`powershell -Command` → `rm -rf` (Linux 兼容)
2. ✅ **修复 Windows 命令**：`copy`/`move` → `cp`/`mv`
3. ✅ **统一构建流程**：默认 `pnpm build` 现在使用 OpenNext.js Cloudflare 构建
4. ✅ **所有脚本现在跨平台兼容**：支持 Windows 开发 + Linux 云构建

**OpenNext.js CLI 命令错误：**
```
Error: Error: invalid command, expected 'build' | 'preview' | 'deploy' | 'upload' | 'populateCache'
```
**解决方案：** 修复 `package.json` 中的构建命令，添加 `build` 参数：
```bash
npx @opennextjs/cloudflare build -c open-next.cloudflare.config.ts
```

**OpenNext.js Cloudflare 配置格式错误：**
```
Error: The `open-next.config.ts` should have a default export like this:
```
**解决方案1：** 使用默认配置文件名 `open-next.config.ts`（OpenNext.js 默认查找此文件，即使指定了 `-c` 参数也可能忽略）
**解决方案2：** 使用正确的配置文件格式（不能有TypeScript import或类型定义）：
```typescript
export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
}
```
**注意：** 配置文件必须是纯JavaScript对象导出，不能包含TypeScript import语句或类型定义。

**图片优化错误（OpenNext.js）：**
```
ERROR: Could not resolve "../overrides/imageLoader/custom.js"
```
**解决方案：** 已在 `open-next.config.ts` 中设置 `imageOptimization: false` 禁用图片优化，因为项目使用 `unoptimized: true` 配置。

**文件大小限制错误（Cloudflare Pages）：**
```
ERROR: Pages only supports files up to 25 MiB in size
cache/webpack/server-production/0.pack is 156 MiB in size
```
**原因分析：** 
- 复杂的 webpack 配置（externals、代码分割等）导致巨大的缓存文件
- Next.js 15.2.4 与复杂配置冲突

**解决方案：** 
1. 使用 `pnpm build:cf` - **自动使用超简化配置**（`next.config.cf.mjs`）
2. 移除所有复杂的 webpack 配置，让 Next.js 使用默认配置
3. 构建脚本会自动清理所有 webpack 缓存文件

**Webpack 构建错误（Next.js 15.2.4）：**
```
HookWebpackError: _webpack.WebpackError is not a constructor
TypeError: _webpack.WebpackError is not a constructor
```
**解决方案：** 
1. **根本性修复**：创建专用的 `next.config.cf.mjs` 超简化配置
2. 移除所有可能导致冲突的复杂 webpack 配置
3. `pnpm build:cf` 会自动使用简化配置，避免构建错误

**404 页面错误（Cloudflare Pages）：**
```
访问网站时显示 404 错误
```
**解决方案：** 
1. 确保项目根目录有 `public/_routes.json` 文件（已包含）
2. 该文件配置了正确的路由处理规则，告诉 Cloudflare Pages 如何处理 API 路由和静态资源

**关键发现：Cloudflare Pages vs Workers 配置冲突**
```
A wrangler.toml file was found but it does not appear to be valid.
Error: Pages only supports files up to 25 MiB in size
```

**问题根源：** `@opennextjs/cloudflare` 专为 **Cloudflare Workers** 设计，但你当前在 **Cloudflare Pages** 环境中！

**🚀 解决方案：选择合适的部署方式**

**选项1：继续使用 Cloudflare Pages（推荐临时解决方案）**
```bash
# 使用标准 Next.js 构建（无 OpenNext.js）
pnpm build:cf-pages
```
- ✅ 避免 webpack 缓存问题
- ✅ 兼容当前 Pages 环境  
- ❌ 无法使用 OpenNext.js 的 SSR 优化

**选项2：切换到 Cloudflare Workers（推荐长期解决方案）**
```bash
# 使用 OpenNext.js 构建（完整功能）
pnpm build:cf-workers
```
- ✅ 完整的 OpenNext.js 功能
- ✅ 更好的 SSR 和 API 路由支持
- ✅ Node.js runtime 兼容性
- ⚠️ 需要切换到 Workers 部署环境

**配置文件说明：**
- `wrangler.toml` → Cloudflare Pages 配置
- `wrangler.workers.toml` → Cloudflare Workers 配置  
- `wrangler.pages.toml` → Pages 专用配置（备用）

**🚀 Next.js 15 App Router + 静态导出 404 页面错误：**
```
Error: <Html> should not be imported outside of pages/_document.
Error occurred prerendering page "/404"
Export encountered an error on /_error: /404, exiting the build.
```
**问题原因：** Next.js 15 在 App Router + 静态导出模式下，`trailingSlash: true` 配置会导致404页面预渲染失败

**✅ 解决方案（已修复）：**
```javascript
// next.config.pages.mjs
const nextConfig = {
  output: 'export',
  // 移除导致404页面错误的配置
  // trailingSlash: true,
  skipTrailingSlashRedirect: true,  // 添加此配置优化路由处理
  distDir: 'out',
  // ... 其他配置
}
```

**🎉 最终解决方案（2025-01-30 完全修复）：**
```javascript
// 关键修复组合 - 彻底解决 Html 组件导入错误：
1. ❌ 删除 app/not-found.tsx - 避免动态错误页面冲突
2. ❌ 删除 app/error.tsx - 移除自定义错误处理  
3. ✅ 创建 public/404.html - 纯静态404页面（美观设计）
4. ✅ 保留 pages/_document.js - 提供正确的 Html 组件导入位置
5. ✅ 简化 next.config.pages.mjs - 移除 exportPathMap 等复杂配置
6. ✅ 混合架构：App Router (主要) + Pages Router (仅_document.js)
```

**✅ 修复结果：**
- 🚀 **88/88 静态页面成功生成**
- 🚀 **完全没有 Html 导入错误**
- 🚀 **Next.js 15 + App Router + 静态导出完全兼容**
- 🚀 **本地构建测试通过，应该能在 Cloudflare Pages 成功构建**

**重要发现：** Next.js 15 在静态导出模式下，内部仍会尝试使用 Pages Router 的 Html 组件，但找不到正确的导入位置。通过创建 `pages/_document.js` 提供导入源，同时删除可能冲突的自定义错误页面，实现了完美兼容。

**🚀 25MB文件大小限制解决方案：**
```
Error: Pages only supports files up to 25 MiB in size
cache/webpack/client-production/0.pack is 123 MiB in size
```
**解决方案：** 确保输出目录配置正确且清理缓存文件：
1. **正确的输出目录**：`pages_build_output_dir = ".open-next/assets"`（不是`.next`）
2. **自动缓存清理**：构建命令会自动清理 `.open-next/assets/cache` 目录
3. **验证方法**：检查 `wrangler.toml` 中的 `pages_build_output_dir` 设置

### 📦 部署后图片无法加载？

如果部署后图片无法显示，请按以下步骤解决：

#### 1. 检查Cloudflare Pages环境变量
在Cloudflare Dashboard → 你的项目 → Settings → Environment variables 中确保设置：

```bash
NEXT_PUBLIC_ENABLE_CDN=true
NEXT_PUBLIC_CDN_BASE_URL=https://images.aimagica.ai
NODE_ENV=production
```

#### 2. 验证CDN状态
- 打开浏览器开发者工具 → Network标签
- 刷新页面，图片请求应该指向 `images.aimagica.ai` 而不是本地路径
- 控制台应显示：`📦 Loaded static URL mapping: 15 files`

#### 3. 常见问题
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 图片404 | 环境变量未设置 | 设置`NEXT_PUBLIC_ENABLE_CDN=true` |
| 显示本地路径 | CDN未启用 | 设置`NEXT_PUBLIC_CDN_BASE_URL` |
| 控制台无日志 | 映射文件未加载 | 检查`/static-urls.json`是否存在 |

详细部署指南：[CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md)

### 🚀 Vercel 部署（推荐）

**全功能部署到 Vercel 平台，支持所有功能包括 API 路由、支付系统、用户认证等。**

#### 🎯 优势对比

| 特性 | Vercel | Cloudflare | 
|------|--------|------------|
| 部署难度 | 🟢 **最简单** | 🟡 中等 |
| API 路由支持 | 🟢 **原生支持** | 🟡 需配置 |
| 文件大小限制 | 🟢 **250MB** | 🔴 25MB |
| 构建时间 | 🟢 **快速** | 🟡 中等 |
| Next.js 兼容性 | 🟢 **完美** | 🟡 需适配 |
| 免费额度 | 🟢 **慷慨** | 🟢 充足 |
| 全球CDN | 🟢 优秀 | 🟢 **最佳** |

#### 🚀 一键部署

**方式1：GitHub 连接（推荐）**
1. Fork 此仓库到你的 GitHub
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 点击 "New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目并配置
5. 配置环境变量（见下方）
6. 点击 "Deploy" 开始部署

**方式2：Vercel CLI 部署**
```bash
# 安装依赖
pnpm install

# 安装 Vercel CLI
pnpm add -D vercel

# 登录 Vercel
pnpm vercel login

# 预览部署（测试）
pnpm preview:vercel

# 生产部署
pnpm deploy:vercel
```

#### 🔧 环境变量配置

**必需配置**（参考 [`env.vercel.template`](./env.vercel.template)）：

在 Vercel Dashboard → 项目设置 → Environment Variables 中添加：

```bash
# 🔴 核心功能（必需）
NEXT_PUBLIC_SUPABASE_URL=https://vvrkbpnnlxjqyhmmovro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXTAUTH_SECRET=your_32_char_random_secret
NEXTAUTH_URL=https://your-domain.vercel.app

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

KIE_AI_API_KEY=your_kie_ai_api_key
KIE_AI_BASE_URL=https://api.kie.ai

# 🟡 支付功能（商业需要）
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 🟢 存储功能（推荐）
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.aimagica.ai
```

#### 🔨 构建配置

项目已预配置 Vercel 优化：
- **`next.config.vercel.mjs`**: Vercel 专用配置
- **`vercel.json`**: 部署优化设置
- **`package.json`**: 添加 `build:vercel` 脚本

**构建命令**：`pnpm build:vercel`  
**输出目录**：`.next`  
**Node.js 版本**：18.x（推荐）

#### 🌐 域名配置

**自定义域名设置**：
1. 在 Vercel Dashboard → 项目 → Settings → Domains
2. 添加你的域名（如 `aimagica.com`）
3. 根据提示配置 DNS 记录
4. 更新环境变量 `NEXTAUTH_URL` 为新域名
5. 更新 Google OAuth 重定向 URI

#### 🔗 Webhook 配置

**Stripe Webhook**：
```
URL: https://your-domain.vercel.app/api/payment/webhooks/stripe
Events: payment_intent.succeeded, checkout.session.completed
```

**PayPal Webhook**：
```
URL: https://your-domain.vercel.app/api/payment/webhooks/paypal
Events: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED
```

#### 📊 性能优化

Vercel 自动提供：
- **边缘函数**：全球低延迟 API 响应
- **图片优化**：自动 WebP/AVIF 转换
- **缓存优化**：智能静态资源缓存
- **分析监控**：实时性能监控

#### 🐛 常见问题解决

**构建失败 - 环境变量错误**：
```
Error: Supabase environment variables are not configured
```
**解决方案**：确保在 Vercel 中设置了所有必需的环境变量

**API 路由超时**：
```
Function execution timed out after 60 seconds
```
**解决方案**：在 `vercel.json` 中已配置更长的超时时间（图像生成 300 秒）

**图片无法加载**：
```
Image optimization using the default loader is not compatible with export
```
**解决方案：** 已在 `next.config.vercel.mjs` 中配置 `unoptimized: false`，Vercel 会处理图片优化

#### 🔄 部署更新

**自动部署**：
- 推送到 `main` 分支自动触发生产部署
- 推送到其他分支创建预览部署

**手动部署**：
```bash
# 从本地部署
pnpm deploy:vercel

# 强制重新部署
vercel --prod --force
```

#### 💰 成本估算

**Vercel Pro 计划**（适合生产使用）：
- 月费：$20/month
- 包含：100GB 带宽，100GB 边缘请求
- 函数执行：1000 小时/month
- 适合中小型 AI 图像生成平台

---

## 🎨 最新更新日志

### 🎭 Gallery页面样式恢复 (2025-01-30)

**问题：** Gallery页面的样式变得过于现代化和商业化，失去了原有的艺术感和魔法主题

**恢复内容：**
- ✨ **艺术风格恢复**：
  - 🎨 **黑色背景** + 金色主题色 (`#d4a574`)
  - 🖋️ **Comic Sans MS字体**，营造手绘艺术感
  - 🎭 **旋转变换效果**，每个图片卡片都有轻微倾斜
  - 🎪 **不规则边框和阴影**，增强艺术感

- 🖼️ **瀑布流布局优化**：
  - 📱 **响应式列数**：`columns-2 md:columns-3 lg:columns-5 xl:columns-5`
  - 🎯 **装饰元素**：随机位置的小圆点、精选星标、高级皇冠标记
  - 🎨 **深色卡片**：`bg-[#1a1a1a]` 背景，金色悬停边框效果

- 🎮 **交互体验增强**：
  - ✨ **魔法主题文案**："Magic Gallery"、"Load More Magic"
  - 🎯 **不规则按钮形状**：使用 `clipPath` 创造手工感
  - 🎭 **悬停动画**：卡片悬停时回正，增强层次感

- 🔧 **功能完善**：
  - 📱 **移动端导航菜单** 
  - 🔗 **分享和下载功能**
  - 💬 **评论系统交互**
  - ❤️ **点赞功能**

**技术实现：**
- 📁 **文件路径**：`app/gallery/gallery-client.tsx`
- 🔄 **样式来源**：恢复自备份文件 `app/gallery/page.tsx.backup`
- 🎨 **设计理念**：手工艺术感 vs 现代商业感
- 🖼️ **图片组件**：继续使用 `SimpleImage` 确保加载性能

**视觉对比：**
| 方面 | 之前（艺术风格） | 修改后（现代风格） | 现已恢复 |
|------|------------------|-------------------|----------|
| 背景 | 🎨 黑色魔法背景 | 🔆 渐变现代背景 | ✅ 黑色魔法背景 |
| 字体 | 🖋️ Comic Sans 手绘感 | 📱 现代无衬线字体 | ✅ Comic Sans 手绘感 |
| 卡片 | 🎭 深色+旋转效果 | 💎 白色半透明 | ✅ 深色+旋转效果 |
| 主题色 | 🌟 金色 (#d4a574) | 🎯 多彩渐变 | ✅ 金色 (#d4a574) |
| 装饰 | 🎪 大量艺术元素 | 🏢 简洁商业风格 | ✅ 大量艺术元素 |

这次恢复确保了Gallery页面保持AIMAGICA平台独特的魔法艺术风格，为用户提供更加沉浸式的艺术创作体验。

---

**Start creating stunning AI art today at [aimagica.ai](https://aimagica.ai)**

*Transform your imagination into reality with the power of artificial intelligence.* 