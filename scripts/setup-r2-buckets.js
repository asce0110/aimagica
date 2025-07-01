#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

// R2 配置
const R2_CONFIG = {
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

// 推荐的存储桶配置
const BUCKETS_CONFIG = [
  {
    name: 'aimagica-static',
    purpose: '静态资源 (logos, backgrounds, UI assets)',
    corsEnabled: true,
    publicRead: true,
    customDomain: 'static.aimagica.ai'
  },
  {
    name: 'aimagica-generated',
    purpose: '用户生成的图片',
    corsEnabled: true,
    publicRead: true,
    customDomain: 'images.aimagica.ai'
  },
  {
    name: 'aimagica-uploads',
    purpose: '用户上传的原始图片',
    corsEnabled: true,
    publicRead: false,
    customDomain: 'uploads.aimagica.ai'
  },
  {
    name: 'aimagica-backups',
    purpose: '数据备份和日志',
    corsEnabled: false,
    publicRead: false,
    customDomain: null
  }
];

// CORS 配置
const CORS_CONFIG = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: ['https://aimagica.ai', 'https://*.aimagica.ai', 'http://localhost:3000'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ],
};

// 创建存储桶
async function createBucket(s3Client, bucketConfig) {
  const { name, purpose, corsEnabled, publicRead } = bucketConfig;
  
  try {
    console.log(`📦 Creating bucket: ${name}`);
    console.log(`   Purpose: ${purpose}`);
    
    // 创建存储桶
    await s3Client.send(new CreateBucketCommand({
      Bucket: name,
    }));
    console.log(`✅ Bucket "${name}" created successfully`);
    
    // 配置 CORS
    if (corsEnabled) {
      await s3Client.send(new PutBucketCorsCommand({
        Bucket: name,
        CORSConfiguration: CORS_CONFIG,
      }));
      console.log(`✅ CORS configured for "${name}"`);
    }
    
    // 配置公共访问（如果需要）
    if (!publicRead) {
      await s3Client.send(new PutPublicAccessBlockCommand({
        Bucket: name,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      }));
      console.log(`🔒 Public access blocked for "${name}"`);
    }
    
    console.log('');
    return true;
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`⏭️  Bucket "${name}" already exists`);
      return true;
    } else {
      console.error(`❌ Failed to create bucket "${name}":`, error.message);
      return false;
    }
  }
}

// 显示配置摘要
function showBucketsConfig() {
  console.log('🗄️  Recommended R2 Buckets Configuration:');
  console.log('═'.repeat(60));
  
  BUCKETS_CONFIG.forEach(bucket => {
    console.log(`📦 ${bucket.name}`);
    console.log(`   📝 Purpose: ${bucket.purpose}`);
    console.log(`   🌐 CORS: ${bucket.corsEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   👁️  Public Read: ${bucket.publicRead ? 'Yes' : 'No'}`);
    if (bucket.customDomain) {
      console.log(`   🔗 Domain: ${bucket.customDomain}`);
    }
    console.log('');
  });
  
  console.log('💡 Benefits:');
  console.log('   • 静态资源与用户内容分离');
  console.log('   • 更好的缓存策略');
  console.log('   • 独立的访问控制');
  console.log('   • 备份和恢复便利');
  console.log('');
}

// 主设置函数
async function setupR2Buckets() {
  console.log('🚀 Setting up Cloudflare R2 Buckets for Aimagica\n');
  
  // 检查环境变量
  const requiredEnvs = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvs.forEach(env => console.error(`   - ${env}`));
    process.exit(1);
  }
  
  showBucketsConfig();
  
  // 询问用户确认
  if (!process.argv.includes('--create')) {
    console.log('⚠️  This will create multiple R2 buckets in your account.');
    console.log('💰 R2 pricing: $0.015/GB/month storage, first 10GB free');
    console.log('📊 Each bucket will have optimized CORS and access policies');
    console.log('\nTo proceed, run: pnpm setup:r2 --create\n');
    return;
  }
  
  // 创建S3客户端
  const s3Client = new S3Client(R2_CONFIG);
  
  let successCount = 0;
  let errorCount = 0;
  
  // 创建所有存储桶
  for (const bucketConfig of BUCKETS_CONFIG) {
    const success = await createBucket(s3Client, bucketConfig);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('📊 Setup Summary:');
  console.log(`✅ Created/Verified: ${successCount} buckets`);
  console.log(`❌ Errors: ${errorCount} buckets`);
  
  if (successCount > 0) {
    console.log('\n🎉 R2 buckets setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure custom domains in Cloudflare Dashboard');
    console.log('2. Update environment variables with bucket names');
    console.log('3. Run upload scripts to migrate content');
    console.log('\n💡 Custom Domain Setup:');
    BUCKETS_CONFIG.forEach(bucket => {
      if (bucket.customDomain) {
        console.log(`   ${bucket.name} → ${bucket.customDomain}`);
      }
    });
  }
}

// 运行设置
if (require.main === module) {
  setupR2Buckets().catch(error => {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupR2Buckets, BUCKETS_CONFIG }; 