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
pnpm build:monitor "pnpm build:turbo"

# 2. 检查磁盘空间和内存
df -h

# 3. 清理全部缓存和重试
pnpm clean && pnpm build:turbo

# 4. 如果还超时，检查具体哪个阶段慢
tail -f build-monitor.log
```

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

**✅ 最新修复（2025-01-30）：跨平台兼容性问题**
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

---

**Start creating stunning AI art today at [aimagica.ai](https://aimagica.ai)**

*Transform your imagination into reality with the power of artificial intelligence.* 