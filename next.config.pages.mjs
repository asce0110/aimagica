/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 静态导出配置 - 激进修复版本
  output: 'export',
  
  // 关键修复：移除 trailingSlash，添加 skipTrailingSlashRedirect
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  trailingSlash: true,
  
  // 跳过有问题的页面（这些需要服务端认证）
  exportPathMap: async function(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // 只导出我们明确指定的页面，排除所有内置错误页面
    const safePages = {
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
      // 明确排除所有错误页面和认证页面
      // '/404': 排除
      // '/500': 排除  
      // '/_error': 排除
      // '/admin/*': 排除
      // '/favorites': 排除
    }
    return safePages
  },
  
  // 强制静态导出设置，避免动态功能
  staticPageGenerationTimeout: 300,
  poweredByHeader: false,
  
  // 彻底禁用可能导致问题的功能
  reactStrictMode: false,
  
  // 强制禁用错误页面生成
  generateEtags: false,
  
  // 禁用内置错误页面生成
  generateBuildId: () => 'static-build',
  
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
  
  // 最小化实验性功能 - 移除appDir配置避免冲突
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // 添加静态导出兼容性设置
    esmExternals: false,
    // 禁用一些可能导致问题的功能
    serverMinification: false,
    // 移除appDir配置，让Next.js自动处理
    // 彻底禁用App Router的404处理，使用Pages Router
    skipMiddlewareUrlNormalize: true,
  },
  
  // Webpack 配置优化
  webpack: (config, { isServer, dev }) => {
    // 解决可能的构建问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // 在生产构建中禁用某些插件
    if (!dev && isServer) {
      // 强制跳过错误页面相关的处理
      config.plugins = config.plugins.filter(plugin => 
        !plugin.constructor.name.includes('Error') &&
        !plugin.constructor.name.includes('NotFound')
      )
    }
    
    return config
  },
  
  // 静态导出优化 - 禁用有问题的内部页面生成
  
  // 明确禁用内部路由处理
  async redirects() {
    return []
  },

  // 移除可能导致问题的 rewrites 配置
  async rewrites() {
    return []
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