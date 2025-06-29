/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 静态导出配置 - 避免服务端渲染问题
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置 
  images: {
    unoptimized: true, // 静态导出必须
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 优化构建输出
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 简化的Webpack配置（无服务端问题）
  webpack: (config, { isServer }) => {
    config.cache = false;
    
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
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 注意：静态导出模式不支持 redirects 和 headers
  // 这些功能需要在 Cloudflare Pages 的 _redirects 和 _headers 文件中配置
}

export default nextConfig 