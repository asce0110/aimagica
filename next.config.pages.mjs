/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 快速构建模式
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 完全关闭图片优化
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  
  // 最小化编译器配置
  compiler: {
    removeConsole: false,
    reactRemoveProperties: false,
    styledComponents: false,
  },
  
  // 禁用所有实验性功能
  experimental: {
    esmExternals: false,
    turbo: false,
  },
  
  // 禁用所有压缩和优化
  swcMinify: false,
  productionBrowserSourceMaps: false,
  generateEtags: false,
  poweredByHeader: false,
  
  // 最少的环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'build_placeholder',
    NEXTAUTH_URL: 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: 'build_placeholder',
    NEXT_PUBLIC_R2_PUBLIC_URL: 'https://images.aimagica.ai',
  },

  // 极简 webpack 配置
  webpack: (config, { isServer, dev }) => {
    // 完全禁用源码映射
    config.devtool = false;
    
    // 最小化模块解析
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;
    
    // 最简单的代码分割
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 0,
      maxSize: 500000,
      cacheGroups: {
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
      },
    };
    
    // 禁用不必要的插件
    config.plugins = config.plugins.filter(plugin => {
      return ![
        'ForkTsCheckerWebpackPlugin',
        'ESLintWebpackPlugin',
      ].includes(plugin.constructor.name);
    });
    
    // 最小化文件处理
    config.module.generator = {
      'asset/resource': {
        filename: 'static/[hash][ext]',
      },
    };
    
    return config;
  },

  // 禁用不必要的功能
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig