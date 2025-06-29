#!/usr/bin/env node

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

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
const CDN_URL = process.env.R2_CDN_URL || `https://images.aimagica.ai`;

// 初始化 S3 客户端（R2兼容S3 API）
const s3Client = new S3Client(R2_CONFIG);

// 需要上传的静态文件目录
const STATIC_DIRS = [
  'public/images',
  'public/*.png',
  'public/*.jpg', 
  'public/*.svg',
  'public/*.ico',
];

// 获取文件列表
function getFilesToUpload() {
  const files = [];
  
  // 处理images目录
  const imagesDir = path.join(process.cwd(), 'public/images');
  if (fs.existsSync(imagesDir)) {
    const walkDir = (dir, baseDir = 'public') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath, baseDir);
        } else if (stat.isFile() && !item.endsWith('.md')) {
          const relativePath = path.relative(process.cwd(), fullPath);
          const s3Key = relativePath.replace(/\\/g, '/').replace('public/', '');
          files.push({
            localPath: fullPath,
            s3Key: s3Key,
            contentType: mime.lookup(fullPath) || 'application/octet-stream',
            size: stat.size
          });
        }
      }
    };
    walkDir(imagesDir);
  }
  
  // 处理public根目录的图片文件
  const publicDir = path.join(process.cwd(), 'public');
  const publicFiles = fs.readdirSync(publicDir);
  
  for (const file of publicFiles) {
    const fullPath = path.join(publicDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && /\.(png|jpg|jpeg|svg|ico|webp)$/i.test(file)) {
      files.push({
        localPath: fullPath,
        s3Key: file,
        contentType: mime.lookup(fullPath) || 'application/octet-stream',
        size: stat.size
      });
    }
  }
  
  return files;
}

// 检查文件是否已存在于R2
async function fileExistsInR2(s3Key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// 上传单个文件到R2
async function uploadFileToR2(file) {
  try {
    console.log(`📤 Uploading ${file.s3Key} (${(file.size / 1024).toFixed(1)}KB)...`);
    
    const fileContent = fs.readFileSync(file.localPath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
      Body: fileContent,
      ContentType: file.contentType,
      CacheControl: 'public, max-age=31536000', // 1年缓存
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'original-size': file.size.toString(),
      },
    });
    
    await s3Client.send(command);
    console.log(`✅ Successfully uploaded ${file.s3Key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${file.s3Key}:`, error.message);
    return false;
  }
}

// 生成CDN URL映射文件
function generateUrlMapping(files) {
  const mapping = {};
  
  for (const file of files) {
    const originalUrl = `/` + file.s3Key;
    const cdnUrl = `${CDN_URL}/${file.s3Key}`;
    mapping[originalUrl] = cdnUrl;
  }
  
  // 保存映射文件
  const mappingPath = path.join(process.cwd(), 'public/static-urls.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`📋 Generated URL mapping: ${mappingPath}`);
  
  return mapping;
}

// 主上传函数
async function uploadStaticFiles() {
  console.log('🚀 Starting static files upload to Cloudflare R2...\n');
  
  // 检查必要的环境变量
  const requiredEnvs = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.error(`❌ Missing required environment variable: ${env}`);
      process.exit(1);
    }
  }
  
  const files = getFilesToUpload();
  console.log(`📁 Found ${files.length} static files to process\n`);
  
  let uploadCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    // 检查是否已存在
    const exists = await fileExistsInR2(file.s3Key);
    if (exists) {
      console.log(`⏭️  Skipping ${file.s3Key} (already exists)`);
      skipCount++;
      continue;
    }
    
    // 上传文件
    const success = await uploadFileToR2(file);
    if (success) {
      uploadCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Uploaded: ${uploadCount} files`);
  console.log(`⏭️  Skipped: ${skipCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  // 生成URL映射
  generateUrlMapping(files);
  
  console.log(`\n🌐 CDN Base URL: ${CDN_URL}`);
  console.log('🎉 Static files upload completed!\n');
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

// 运行上传
if (require.main === module) {
  uploadStaticFiles().catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });
}

module.exports = { uploadStaticFiles, generateUrlMapping }; 