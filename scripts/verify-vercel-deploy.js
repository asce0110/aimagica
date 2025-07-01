#!/usr/bin/env node

/**
 * Vercel 部署验证脚本
 * 检查所有必需的配置是否正确设置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Vercel 部署配置...\n');

// 检查配置文件
const requiredFiles = [
  'next.config.vercel.mjs',
  'vercel.json',
  'env.vercel.template',
  'package.json'
];

console.log('📁 检查配置文件:');
let filesOk = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    filesOk = false;
  }
}

// 检查 package.json 中的 Vercel 脚本
console.log('\n📦 检查 package.json 脚本:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'build:vercel',
    'deploy:vercel',
    'preview:vercel'
  ];
  
  let scriptsOk = true;
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script} - 已配置`);
    } else {
      console.log(`❌ ${script} - 缺失`);
      scriptsOk = false;
    }
  }
  
  // 检查 Vercel 依赖
  if (packageJson.devDependencies && packageJson.devDependencies.vercel) {
    console.log(`✅ vercel 依赖 - 版本 ${packageJson.devDependencies.vercel}`);
  } else {
    console.log('❌ vercel 依赖 - 缺失');
    scriptsOk = false;
  }
  
  if (!scriptsOk) {
    filesOk = false;
  }
  
} catch (error) {
  console.log('❌ package.json - 无法读取或格式错误');
  filesOk = false;
}

// 检查 Next.js 配置
console.log('\n⚙️ 检查 Next.js 配置:');
try {
  // 由于是 .mjs 文件，我们只检查文件存在性和基本语法
  const configContent = fs.readFileSync('next.config.vercel.mjs', 'utf8');
  
  const requiredConfigs = [
    'output: \'standalone\'',
    'images:',
    'env:',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SUPABASE_URL'
  ];
  
  let configOk = true;
  for (const config of requiredConfigs) {
    if (configContent.includes(config)) {
      console.log(`✅ ${config} - 已配置`);
    } else {
      console.log(`❌ ${config} - 缺失或配置错误`);
      configOk = false;
    }
  }
  
  if (!configOk) {
    filesOk = false;
  }
  
} catch (error) {
  console.log('❌ next.config.vercel.mjs - 无法读取');
  filesOk = false;
}

// 检查 vercel.json 配置
console.log('\n🚀 检查 vercel.json 配置:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  const checks = [
    { key: 'buildCommand', expected: 'pnpm build:vercel', value: vercelConfig.buildCommand },
    { key: 'framework', expected: 'nextjs', value: vercelConfig.framework },
    { key: 'functions', expected: 'object', value: typeof vercelConfig.functions },
    { key: 'headers', expected: true, value: Array.isArray(vercelConfig.headers) }
  ];
  
  let vercelOk = true;
  for (const check of checks) {
    if (check.value === check.expected || 
        (check.expected === 'object' && check.value === 'object') ||
        (check.key === 'headers' && check.value === true)) {
      console.log(`✅ ${check.key} - 正确配置`);
    } else {
      console.log(`❌ ${check.key} - 配置错误 (当前: ${check.value}, 期望: ${check.expected})`);
      vercelOk = false;
    }
  }
  
  if (!vercelOk) {
    filesOk = false;
  }
  
} catch (error) {
  console.log('❌ vercel.json - 无法读取或格式错误');
  filesOk = false;
}

// 环境变量检查指南
console.log('\n🔐 环境变量检查指南:');
console.log('⚠️  请在 Vercel Dashboard 中手动验证以下环境变量:');

const requiredEnvVars = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase 项目 URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase 匿名密钥' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase 服务密钥' },
  { name: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth 密钥（32字符以上）' },
  { name: 'NEXTAUTH_URL', required: true, description: 'NextAuth 回调 URL' },
  { name: 'GOOGLE_CLIENT_ID', required: true, description: 'Google OAuth 客户端 ID' },
  { name: 'GOOGLE_CLIENT_SECRET', required: true, description: 'Google OAuth 客户端密钥' },
  { name: 'KIE_AI_API_KEY', required: true, description: 'KIE.AI API 密钥（图像生成）' },
  { name: 'STRIPE_PUBLISHABLE_KEY', required: false, description: 'Stripe 公开密钥（支付功能）' },
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe 私密密钥（支付功能）' },
  { name: 'CLOUDFLARE_ACCOUNT_ID', required: false, description: 'Cloudflare 账户 ID（R2存储）' }
];

for (const envVar of requiredEnvVars) {
  const icon = envVar.required ? '🔴' : '🟡';
  const type = envVar.required ? '必需' : '可选';
  console.log(`${icon} ${envVar.name} (${type}) - ${envVar.description}`);
}

// 部署检查列表
console.log('\n📋 部署检查列表:');
const deploymentSteps = [
  '1. 确保代码已推送到 GitHub 仓库',
  '2. 在 Vercel Dashboard 中导入 GitHub 仓库',
  '3. 配置所有必需的环境变量',
  '4. 确认构建命令为 "pnpm build:vercel"',
  '5. 确认输出目录为 ".next"',
  '6. 执行首次部署',
  '7. 配置自定义域名（可选）',
  '8. 更新 Google OAuth 重定向 URI',
  '9. 配置 Stripe/PayPal Webhook URLs',
  '10. 测试所有功能（登录、图像生成、支付）'
];

for (const step of deploymentSteps) {
  console.log(`☐ ${step}`);
}

// 总结
console.log('\n' + '='.repeat(50));
if (filesOk) {
  console.log('✅ 配置验证通过！可以开始 Vercel 部署');
  console.log('\n🚀 下一步:');
  console.log('1. 运行: pnpm install');
  console.log('2. 在 Vercel 中导入项目');
  console.log('3. 配置环境变量（参考 env.vercel.template）');
  console.log('4. 开始部署！');
} else {
  console.log('❌ 配置验证失败！请修复上述问题后重试');
  console.log('\n🔧 修复建议:');
  console.log('1. 运行: pnpm install（安装缺失的依赖）');
  console.log('2. 检查所有配置文件是否存在且格式正确');
  console.log('3. 重新运行此验证脚本');
}
console.log('='.repeat(50));

process.exit(filesOk ? 0 : 1); 