#!/usr/bin/env node

/**
 * Google OAuth 配置测试脚本
 * 用于验证环境变量是否正确配置
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

console.log('🔍 正在检查Google OAuth配置...\n')

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

const missingVars = []
const configuredVars = []

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value || value.trim() === '' || value === 'your_' + varName.toLowerCase()) {
    missingVars.push(varName)
  } else {
    configuredVars.push({
      name: varName,
      value: varName.includes('SECRET') ? '***隐藏***' : value,
      isValid: true
    })
  }
})

// 显示结果
console.log('✅ 已配置的变量:')
if (configuredVars.length > 0) {
  configuredVars.forEach(config => {
    console.log(`   ${config.name}: ${config.value}`)
  })
} else {
  console.log('   无')
}

console.log('\n❌ 缺失的变量:')
if (missingVars.length > 0) {
  missingVars.forEach(varName => {
    console.log(`   ${varName}`)
  })
} else {
  console.log('   无')
}

// 验证Google Client ID格式
if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')) {
  console.log('\n⚠️  警告: GOOGLE_CLIENT_ID 格式可能不正确')
  console.log('   正确格式应该以 .apps.googleusercontent.com 结尾')
}

// 验证NextAuth Secret长度
if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
  console.log('\n⚠️  警告: NEXTAUTH_SECRET 长度太短')
  console.log('   建议使用至少32位的随机字符串')
}

// 验证NEXTAUTH_URL
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
  console.log('\n⚠️  警告: NEXTAUTH_URL 应该以 http:// 或 https:// 开头')
}

console.log('\n' + '='.repeat(50))

if (missingVars.length === 0) {
  console.log('🎉 配置检查通过！Google OAuth应该可以正常工作。')
  console.log('\n📋 下一步:')
  console.log('1. 重启开发服务器: pnpm dev')
  console.log('2. 访问: http://localhost:3000/admin/login')
  console.log('3. 点击"使用 Google 登录"按钮测试')
} else {
  console.log('❗ 配置不完整！请先完成环境变量配置。')
  console.log('\n📋 需要做的事:')
  console.log('1. 在项目根目录创建 .env.local 文件')
  console.log('2. 参考 GOOGLE_LOGIN_SETUP.md 完成配置')
  console.log('3. 重新运行此脚本验证')
}

console.log('='.repeat(50)) 