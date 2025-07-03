/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本地开发配置 - 支持 middleware，不使用 export
  
  // 基础配置
  distDir: '.next',
  trailingSlash: false,
  
  // 环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev_secret_key',
  },
  
  // 图片配置 - 开发环境允许优化
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 构建优化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
    esmExternals: false,
  },
  
  // Webpack 配置
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // 开发环境热重载优化
  onDemandEntries: {
    // 页面在内存中缓存的时间（毫秒）
    maxInactiveAge: 25 * 1000,
    // 同时保持在内存中的页面数
    pagesBufferLength: 2,
  },
}

export default nextConfig 