/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 静态导出配置 - 彻底修复版本
  output: 'export',
  
  // 关键修复：移除 trailingSlash，添加 skipTrailingSlashRedirect
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // 强制静态导出设置，避免动态功能
  staticPageGenerationTimeout: 300,
  poweredByHeader: false,
  
  // 彻底禁用可能导致问题的功能
  reactStrictMode: false,
  
  // 构建时环境变量默认值
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build_placeholder_secret',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aimagica-api.your-domain.workers.dev',
  },
  
  // 简化构建配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置 - Pages专用
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 编译器配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 最小化实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // 添加静态导出兼容性设置
    esmExternals: false,
    // 禁用一些可能导致问题的功能
    serverMinification: false,
  },
  
  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    // 解决可能的构建问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // 静态导出优化 - 禁用有问题的内部页面生成
  generateBuildId: () => 'cloudflare-pages-build',
  
  // 基础安全头部
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig 