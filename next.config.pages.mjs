/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 静态导出配置 - 简化版本
  output: 'export',
  
  // 关键修复：移除 trailingSlash，添加 skipTrailingSlashRedirect
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
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
  
  // 移除复杂的实验性功能，避免构建问题
  experimental: {
    // 最小化实验性功能
    optimizePackageImports: ['lucide-react'],
  },
  
  // 简化重写规则
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aimagica-api.your-domain.workers.dev'}/api/:path*`,
      },
    ]
  },
  
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