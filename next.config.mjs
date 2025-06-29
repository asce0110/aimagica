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
  
  // Webpack 配置优化
  webpack: (config, { isServer, webpack }) => {
    // 禁用webpack缓存以避免大文件
    config.cache = false;
    
    // 修复服务端"self is not defined"错误 - 更强力的方法
    if (isServer) {
      // 方法1: DefinePlugin
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': '"object"',
          'self': 'globalThis',
        })
      );
      
      // 方法2: ProvidePlugin
      config.plugins.push(
        new webpack.ProvidePlugin({
          self: 'globalThis',
        })
      );
      
      // 方法3: 注入polyfill到所有server chunks
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // 为所有entry points添加polyfill
        Object.keys(entries).forEach(key => {
          if (Array.isArray(entries[key])) {
            entries[key].unshift('./lib/polyfills.js');
          } else if (typeof entries[key] === 'string') {
            entries[key] = ['./lib/polyfills.js', entries[key]];
          }
        });
        
        return entries;
      };
    }
    
    // 代码分割优化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // 优化bundle大小
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 20000, // 限制chunk大小为20KB
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // 服务端外部包
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js'],
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    instrumentationHook: true,
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
