/** @type {import('next').NextConfig} */
const nextConfig = {
  // 超快速构建配置 - 最小化编译步骤
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置 
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 关闭编译器优化以加速构建
  compiler: {
    removeConsole: false, // 保留console以加速构建
  },
  
  // 禁用实验性功能以避免额外编译时间
  experimental: {
    // 移除包导入优化以加速构建
  },
  
  // 构建时环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'build_placeholder_service_key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build_placeholder_secret',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
  },
}

export default nextConfig 