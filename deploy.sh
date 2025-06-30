#!/bin/bash
set -e

echo "🚀 开始 Cloudflare Workers 部署流程..."

# 1. 清理之前的构建
echo "🧹 清理之前的构建缓存..."
rm -rf .next .open-next node_modules/.cache

# 2. 运行 Next.js 构建（不包含 OpenNext）
echo "📦 执行 Next.js 构建..."
pnpm build

# 3. 检查 .next/standalone 目录结构并修复符号链接问题
echo "🔧 修复 Next.js standalone 构建问题..."
if [ -L ".next/standalone/node_modules/next" ]; then
    echo "发现符号链接，正在修复..."
    rm -f .next/standalone/node_modules/next
    cp -r node_modules/next .next/standalone/node_modules/
fi

# 4. 运行 OpenNext 转换
echo "⚡ 执行 OpenNext 转换..."
pnpm build:opennext

# 5. 检查必需文件是否存在
if [ ! -f ".open-next/cloudflare-worker.mjs" ]; then
    echo "❌ 错误: .open-next/cloudflare-worker.mjs 文件未找到"
    echo "OpenNext 构建可能失败了，请检查构建输出"
    exit 1
fi

echo "✅ 构建完成，入口文件已生成"

# 6. 执行部署
echo "🚀 开始部署到 Cloudflare Workers..."
npx wrangler deploy

echo "🎉 部署完成！"