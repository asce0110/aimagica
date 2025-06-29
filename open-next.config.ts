import type { OpenNextConfig } from '@opennextjs/aws'

const config: OpenNextConfig = {
  // 基础配置
  default: {
    // 部署包名称
    override: {
      // 标记为一个Node.js运行时函数而不是Edge Runtime  
      wrapper: 'node',
      // 服务器函数配置
      converter: 'node',
    }
  },
  
  // 如果使用Cloudflare Pages，可以配置为Node.js兼容
  buildCommand: 'pnpm build',
  
  // 中间件配置（如果使用）
  middleware: {
    // 在edge运行时运行中间件
    override: {
      wrapper: 'cloudflare',
    }
  },
  
  // 图片优化配置
  imageOptimization: {
    // 禁用内置图片优化（Cloudflare有自己的优化）
    loader: 'custom',
  },
  
  // 函数分割配置
  functions: {
    // API路由单独打包
    api: {
      patterns: ['api/**'],
    },
    // 页面路由
    app: {
      patterns: ['**'],
    }
  }
}

export default config 