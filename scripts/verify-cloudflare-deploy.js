#!/usr/bin/env node

/**
 * Cloudflare 部署验证脚本
 * 检查 Cloudflare Pages + Workers 部署所需的配置
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Cloudflare deployment configuration...\n')

let hasErrors = false

// 必需的配置文件
const requiredFiles = [
  {
    path: 'next.config.pages.mjs',
    description: 'Cloudflare Pages 专用 Next.js 配置'
  },
  {
    path: 'wrangler.workers.toml',
    description: 'Cloudflare Workers 配置'
  },
  {
    path: 'wrangler.pages.toml',
    description: 'Cloudflare Pages 配置'
  },
  {
    path: 'workers/api-worker.js',
    description: 'Workers API 入口文件'
  }
]

// 检查必需文件
requiredFiles.forEach(({ path: filePath, description }) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`)
  } else {
    console.log(`❌ 缺少 ${description}: ${filePath}`)
    hasErrors = true
  }
})

console.log('')

// 检查 package.json 脚本
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScripts = [
  'build:pages',
  'build:workers',
  'deploy:pages',
  'deploy:workers',
  'deploy:cloudflare',
  'preview:pages',
  'preview:workers'
]

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ NPM 脚本: ${script}`)
  } else {
    console.log(`❌ 缺少 NPM 脚本: ${script}`)
    hasErrors = true
  }
})

console.log('')

// 检查依赖
const requiredDeps = {
  wrangler: 'devDependencies',
  'cross-env': 'devDependencies'
}

Object.entries(requiredDeps).forEach(([dep, section]) => {
  if (packageJson[section] && packageJson[section][dep]) {
    console.log(`✅ 依赖: ${dep} (${section})`)
  } else {
    console.log(`❌ 缺少依赖: ${dep} (${section})`)
    hasErrors = true
  }
})

console.log('')

// 环境变量检查
const envExample = fs.existsSync('.env.example') ? fs.readFileSync('.env.example', 'utf8') : ''
const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : ''

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ENDPOINT',
  'R2_BUCKET_NAME',
  'NEXT_PUBLIC_R2_PUBLIC_URL',
  'NEXT_PUBLIC_API_BASE_URL'
]

console.log('📋 环境变量检查:')
requiredEnvVars.forEach(envVar => {
  if (envLocal.includes(envVar) || envExample.includes(envVar)) {
    console.log(`✅ ${envVar}`)
  } else {
    console.log(`⚠️  ${envVar} (需要在 Cloudflare Dashboard 中设置)`)
  }
})

console.log('')

// 部署检查清单
console.log('📝 Cloudflare 部署检查清单:')
console.log('')
console.log('🔧 **Workers 部署准备**:')
console.log('   1. 确保 wrangler CLI 已安装并认证')
console.log('   2. 在 Cloudflare Dashboard 中设置 Workers 环境变量')
console.log('   3. 运行: pnpm run deploy:workers')
console.log('')
console.log('📄 **Pages 部署准备**:')
console.log('   1. 连接 GitHub 仓库到 Cloudflare Pages')
console.log('   2. 设置构建命令: pnpm run build:pages')
console.log('   3. 设置输出目录: out')
console.log('   4. 配置环境变量')
console.log('   5. 更新 API 基础URL 指向你的 Workers 域名')
console.log('')
console.log('🔗 **连接配置**:')
console.log('   1. 获取 Workers 部署后的域名')
console.log('   2. 更新 NEXT_PUBLIC_API_BASE_URL 环境变量')
console.log('   3. 在 wrangler.pages.toml 中更新 API 重定向 URL')
console.log('')

// 结果
if (hasErrors) {
  console.log('❌ 部署配置检查失败！请修复上述问题后重试。\n')
  process.exit(1)
} else {
  console.log('✅ Cloudflare 部署配置检查通过！\n')
  console.log('🚀 现在可以开始部署了:')
  console.log('   1. 先部署 Workers: pnpm run deploy:workers')
  console.log('   2. 获取 Workers 域名并更新环境变量')
  console.log('   3. 再部署 Pages: pnpm run deploy:pages')
  console.log('   4. 或者一键部署: pnpm run deploy:cloudflare')
  console.log('')
} 