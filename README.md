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

#### 使用方法

```bash
# 安装依赖（已添加到项目中）
pnpm install

# 使用OpenNext.js构建（自动切换到简化配置）
pnpm build:opennext

# 输出将在 .open-next 目录中
```

#### 配置文件说明
- **`next.config.mjs`**: 标准配置，包含复杂webpack优化（用于本地开发）
- **`next.config.opennext.mjs`**: 简化配置，用于 OpenNext.js 构建（支持 AWS 和 Cloudflare）
- **`open-next.config.ts`**: OpenNext.js AWS 部署配置  
- **`open-next.cloudflare.config.ts`**: **OpenNext.js Cloudflare 专用配置**

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
4. **使用 @opennextjs/cloudflare 适配器转换**（专为 Cloudflare 优化）
5. 输出到 `.open-next/static` 目录
6. **恢复原始配置文件**

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