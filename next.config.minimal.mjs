/** @type {import('next').NextConfig} */
const nextConfig = {
  // 最小化静态导出配置 - 仅核心页面
  output: 'export',
  
  // 基础设置
  distDir: 'out',
  trailingSlash: true,
  
  // 完全禁用动态功能
  images: {
    unoptimized: true,
  },
  
  // 环境变量 - 最少必需
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://api.aimagica.ai',
  },
  
  // 禁用所有优化和检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 最小化实验性功能
  experimental: {
    // 完全禁用 App Router 的问题功能
    appDir: false,
  },
  
  // 强制跳过有问题的页面生成
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 禁用服务端渲染的问题模块
      config.externals = config.externals || []
      config.externals.push({
        'react': 'commonjs react',
        'react-dom': 'commonjs react-dom',
      })
    }
    return config
  },
  
  // 生成静态页面映射 - 仅包含最基础页面
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/pricing': { page: '/pricing' },
      '/contact': { page: '/contact' },
    }
  },
}

export default nextConfig