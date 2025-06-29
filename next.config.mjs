/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages + Next.js 配置（保留API功能）
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置 
  images: {
    unoptimized: true, // Cloudflare Pages 需要
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 优化构建输出以减少文件大小
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack 配置优化 - 简化版本
  webpack: (config, { isServer, webpack }) => {
    // 禁用webpack缓存以避免大文件
    config.cache = false;
    
    // 最简单的服务端polyfill方法
    if (isServer) {
      // 在模块加载前全局定义 self
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: 'if(typeof self === "undefined") { global.self = global; globalThis.self = globalThis; }',
          raw: true,
          entryOnly: false,
        })
      );
    }
    
    // 代码分割优化 - 简化版本
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // 服务端外部包 - 外部化所有可能有问题的包
  serverExternalPackages: [
    '@supabase/supabase-js', 
    '@supabase/realtime-js',
    '@supabase/auth-js',
    '@supabase/postgrest-js',
    '@supabase/storage-js',
    '@supabase/functions-js',
    '@supabase/ssr',
    'recharts',
    'lodash',
    'crypto-js'
  ],
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // 头部配置 - 安全和SEO
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
