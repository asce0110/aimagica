#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

// R2 配置
const R2_CONFIG = {
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'aimagica-static';

// 测试R2连接
async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 Configuration...\n');
  
  // 检查环境变量
  const requiredEnvs = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvs.forEach(env => console.error(`   - ${env}`));
    console.error('\n📋 Please check R2_CONFIG_TEMPLATE.md for setup instructions.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded');
  console.log(`📦 Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID.substring(0, 8)}...`);
  console.log(`🔑 Access Key: ${process.env.R2_ACCESS_KEY_ID.substring(0, 8)}...`);
  console.log(`🪣 Target Bucket: ${BUCKET_NAME}\n`);
  
  // 初始化S3客户端
  const s3Client = new S3Client(R2_CONFIG);
  
  try {
    // 测试1: 列出存储桶
    console.log('🔍 Testing bucket access...');
    await s3Client.send(new ListBucketsCommand({}));
    console.log('✅ Successfully connected to R2');
    
    // 测试2: 检查目标存储桶
    console.log(`🔍 Checking bucket "${BUCKET_NAME}"...`);
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Bucket "${BUCKET_NAME}" exists and accessible`);
    
    console.log('\n🎉 R2 configuration test passed!');
    console.log('🚀 Ready to upload static files with: pnpm upload:r2');
    
    return true;
  } catch (error) {
    console.error('\n❌ R2 connection test failed:');
    
    if (error.name === 'NoSuchBucket') {
      console.error(`   Bucket "${BUCKET_NAME}" does not exist`);
      console.error('   Please create the bucket in Cloudflare R2 dashboard');
    } else if (error.name === 'AccessDenied') {
      console.error('   Access denied - check your API token permissions');
      console.error('   Required permissions: Object Read & Write, Bucket Read');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('   Invalid Access Key ID');
      console.error('   Please check R2_ACCESS_KEY_ID in your .env.local');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   Invalid Secret Access Key');
      console.error('   Please check R2_SECRET_ACCESS_KEY in your .env.local');
    } else {
      console.error(`   ${error.name}: ${error.message}`);
    }
    
    console.error('\n📋 Setup guide: R2_CONFIG_TEMPLATE.md');
    process.exit(1);
  }
}

// 显示配置摘要
function showConfigSummary() {
  console.log('📋 Current Configuration Summary:');
  console.log('─'.repeat(50));
  console.log(`CDN Enabled: ${process.env.NEXT_PUBLIC_ENABLE_CDN || 'false'}`);
  console.log(`CDN Base URL: ${process.env.NEXT_PUBLIC_CDN_BASE_URL || 'not set'}`);
  console.log(`R2 Bucket: ${BUCKET_NAME}`);
  console.log(`Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID?.substring(0, 8) || 'not set'}...`);
  console.log('─'.repeat(50));
  
  if (process.env.NEXT_PUBLIC_ENABLE_CDN === 'true') {
    console.log('🌐 CDN mode is ENABLED - will use R2 URLs in production');
  } else {
    console.log('🏠 CDN mode is DISABLED - will use local files');
    console.log('💡 Set NEXT_PUBLIC_ENABLE_CDN=true to enable CDN mode');
  }
  console.log('');
}

// 运行测试
async function main() {
  showConfigSummary();
  await testR2Connection();
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testR2Connection, showConfigSummary }; 