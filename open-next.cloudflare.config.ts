import type { OpenNextConfig } from '@opennextjs/cloudflare'

const config: OpenNextConfig = {
  // Cloudflare 特定配置
  experimental: {
    // 启用更好的兼容性
    streaming: true,
  },
  
  // 图片优化配置 - 使用 Cloudflare Images
  imageOptimization: {
    // 禁用 OpenNext 的图片优化，使用 Cloudflare Images 
    loader: 'cloudflare',
  },
}

export default config 