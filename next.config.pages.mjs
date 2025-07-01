/** @type {import('next').NextConfig} */
const nextConfig = {
  // 强制使用 Pages Router 进行静态导出
  output: 'export',
  
  // 基础配置
  distDir: 'out',
  trailingSlash: true,
  
  // 完全禁用图片优化
  images: {
    unoptimized: true,
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://api.aimagica.ai',
    NEXT_PUBLIC_SUPABASE_URL: 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'build_placeholder_anon_key',
    NEXT_PUBLIC_R2_PUBLIC_URL: 'https://images.aimagica.ai',
  },
  
  // 禁用所有检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 启用 App Router（Next.js 13.4+ 默认启用）
  experimental: {
    // appDir: true, // Next.js 13.4+ 中默认启用，无需显式设置
  },
  
  // 简化 Webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 禁用问题模块
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // App Router 静态导出不需要 exportPathMap
  // 页面会自动从 app 目录结构中导出
  
  // 禁用优化
  swcMinify: false,
  
  // 禁用所有动态功能
  async rewrites() {
    return []
  },
  
  async redirects() {
    return []
  },
  
  async headers() {
    return []
  },
}

export default nextConfig