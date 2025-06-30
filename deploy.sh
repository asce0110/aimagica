#!/bin/bash
set -e

echo "🚀 开始 Cloudflare Workers 部署流程..."

# 1. 运行 Next.js 构建（不包含 OpenNext）
echo "📦 执行 Next.js 构建..."
pnpm build

# 2. 运行 OpenNext 转换
echo "⚡ 执行 OpenNext 转换..."
pnpm build:opennext

# 3. 检查必需文件是否存在
if [ ! -f ".open-next/cloudflare-worker.mjs" ]; then
    echo "❌ 错误: .open-next/cloudflare-worker.mjs 文件未找到"
    echo "OpenNext 构建可能失败了，请检查构建输出"
    exit 1
fi

echo "✅ 构建完成，入口文件已生成"

# 4. 执行部署
echo "🚀 开始部署到 Cloudflare Workers..."
npx wrangler deploy

echo "🎉 部署完成！"