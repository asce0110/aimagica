/** @type {import('next').NextConfig} */
const nextConfig = {
  // 极简构建配置 - 最大化构建速度
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 完全关闭图片优化
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './lib/utils/image-loader.js'
  },
  
  // 关闭所有编译器优化
  compiler: {
    removeConsole: false,
    reactRemoveProperties: false,
    styledComponents: false,
  },
  
  // 关闭所有实验性功能
  experimental: {},
  
  // 禁用静态分析以加速构建
  swcMinify: false,
  
  // 关闭构建时的性能检查
  productionBrowserSourceMaps: false,
  
  // 最少的环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'build_placeholder',
    NEXTAUTH_URL: 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: 'build_placeholder',
    NEXT_PUBLIC_R2_PUBLIC_URL: 'https://images.aimagica.ai',
  },

  // webpack配置最小化
  webpack: (config, { isServer }) => {
    // 关闭源码映射以加速构建
    config.devtool = false;
    
    // 减少模块解析
    config.resolve.symlinks = false;
    
    return config;
  },
}

export default nextConfig 