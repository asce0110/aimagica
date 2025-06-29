/** @type {import('next').NextConfig} */
const nextConfig = {
  // 恢复SSR模式，支持API路由
  // output: 'export', // 移除静态导出
  trailingSlash: true,
  // distDir: 'out', // 使用默认.next目录
  
  // 构建时环境变量默认值（避免构建失败）
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'build_placeholder_service_key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build_placeholder_secret',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
  },
  
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
  
  // Webpack 配置优化 - 大幅减少文件大小
  webpack: (config, { isServer, dev }) => {
    // 禁用webpack缓存以避免大文件
    config.cache = false;
    
    // 修复SSR兼容性问题
    if (isServer) {
      // 服务器端不打包某些客户端专用模块
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'canvas',
        'utf-8-validate': 'utf-8-validate',
        'bufferutil': 'bufferutil',
      });
      
      // 添加全局变量定义，解决SSR错误
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'typeof self': '"undefined"',
          'typeof window': '"undefined"',
          'typeof document': '"undefined"',
        })
      );
    }
    
    // 通用fallback配置
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      stream: false,
      util: false,
      url: false,
      querystring: false,
      buffer: false,
    };
    
    // 生产环境优化
    if (!dev) {
      // 更激进的代码分割
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 200000,
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui',
              priority: 10,
              chunks: 'all',
              maxSize: 150000,
            }
          },
        },
      };
    }
    
    return config;
  },
  
  // 实验性功能 - 优化包导入
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
    ],
  },
}

export default nextConfig
