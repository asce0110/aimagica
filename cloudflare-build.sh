#!/bin/bash

# Cloudflare Pages 优化构建脚本
echo "🚀 Starting optimized Cloudflare build..."

# 设置Node.js版本
export NODE_VERSION=18.20.4

# 优化pnpm缓存
echo "📦 Setting up pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

# 快速安装依赖（跳过可选依赖）
echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile --prefer-offline --no-optional

# 使用极简构建
echo "🏗️ Building with minimal config..."
cp next.config.minimal.mjs next.config.mjs
NODE_ENV=production next build
npx @opennextjs/cloudflare build

echo "✅ Build completed successfully!" 