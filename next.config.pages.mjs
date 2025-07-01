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
  
  // 强制禁用 App Router
  experimental: {
    appDir: false,
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
  
  // 静态页面映射 - 使用 Pages Router
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/contact': { page: '/contact' },
      '/pricing': { page: '/pricing' },
    }
  },
  
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