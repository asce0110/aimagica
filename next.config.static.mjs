/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出 - 不包含任何API路由
  output: 'export',
  
  // 基础配置
  distDir: 'out',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // 跳过有问题的页面（这些需要服务端认证）
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/contact': { page: '/contact' },
      '/help': { page: '/help' },
      '/pricing': { page: '/pricing' },
      '/privacy': { page: '/privacy' },
      '/terms': { page: '/terms' },
      '/cookies': { page: '/cookies' },
      '/text-to-image': { page: '/text-to-image' },
      '/image-to-image': { page: '/image-to-image' },
      '/text-to-video': { page: '/text-to-video' },
      '/gallery': { page: '/gallery' },
      // 跳过需要认证的管理页面
      // '/admin/dashboard': { page: '/admin/dashboard' },
      // '/admin/payment': { page: '/admin/payment' },
      // '/admin/prompts': { page: '/admin/prompts' },
      // '/favorites': { page: '/favorites' },
    }
  },
  
  // 完全禁用服务端功能
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 环境变量 - 指向 Workers API
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.aimagica.ai',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
    // 提供构建时环境变量默认值
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build_placeholder_secret',
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
  
  // 安全头部
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