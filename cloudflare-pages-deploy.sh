#!/bin/bash

echo "🚀 Cloudflare Pages 部署脚本"
echo "============================="

# 1. 临时切换到 Pages Router 架构
echo "📁 准备 Pages Router 架构..."
if [ -d "app" ]; then
    mv app app-backup
    echo "✅ 备份原始 app 目录"
fi

# 2. 创建简化的 pages 目录
mkdir -p pages
cat > pages/_app.js << 'EOF'
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
EOF

cat > pages/_document.js << 'EOF'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
EOF

cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div>
      <h1>Welcome to AIMAGICA</h1>
      <p>AI Image Generation Platform</p>
      <p>Frontend deployed on Cloudflare Pages</p>
      <p>API available at: api.aimagica.ai</p>
      <style jsx>{`
        div {
          padding: 2rem;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 2.5rem;
        }
        p {
          color: #666;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
EOF

cat > pages/about.js << 'EOF'
export default function About() {
  return (
    <div>
      <h1>About AIMAGICA</h1>
      <p>Advanced AI image generation and transformation platform.</p>
      <p>Frontend: Cloudflare Pages (Static)</p>
      <p>Backend: Cloudflare Workers (Serverless)</p>
      <p>Database: Supabase (PostgreSQL)</p>
      <style jsx>{`
        div {
          padding: 2rem;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 2.5rem;
        }
        p {
          color: #666;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
EOF

echo "✅ 创建 Pages Router 页面"

# 3. 执行静态构建
echo "🔨 开始静态构建..."
pnpm run build:pages

# 4. 准备部署文件
echo "📦 准备部署文件..."
if [ -d ".next/server/pages" ]; then
    rm -rf out
    cp -r .next/server/pages/ out/
    mkdir -p out/_next
    cp -r .next/static/ out/_next/static/
    echo "✅ 静态文件已准备就绪"
else
    echo "❌ 构建失败，未找到静态文件"
    exit 1
fi

# 5. 清理并恢复原始结构
echo "🧹 清理临时文件..."
rm -rf pages
if [ -d "app-backup" ]; then
    mv app-backup app
    echo "✅ 恢复原始 app 目录"
fi

echo "🎉 部署准备完成！"
echo "📁 静态文件位置: ./out/"
echo "🌐 准备推送到 Cloudflare Pages"