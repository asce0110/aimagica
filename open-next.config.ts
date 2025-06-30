import type { OpenNextConfig } from '@opennextjs/aws'

const config: OpenNextConfig = {
  // 默认函数配置
  default: {
    // 使用Node.js运行时
    override: {
      wrapper: 'node',
      converter: 'node',
    }
  },
  
  // 禁用图片优化，因为在next.config中已经设置了unoptimized: true
  imageOptimization: false,
  
  // 移除有问题的functions配置，让OpenNext.js使用默认配置
  // OpenNext.js会自动处理路由分割
}

export default config 