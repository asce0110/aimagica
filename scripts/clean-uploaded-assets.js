#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取URL映射文件
function loadUploadedFiles() {
  const mappingPath = path.join(process.cwd(), 'public/static-urls.json');
  
  if (!fs.existsSync(mappingPath)) {
    console.log('❌ No static-urls.json found. Please run "pnpm upload:r2" first.');
    process.exit(1);
  }
  
  try {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    return Object.keys(mapping);
  } catch (error) {
    console.error('❌ Failed to read static-urls.json:', error.message);
    process.exit(1);
  }
}

// 删除已上传的本地文件
function cleanUploadedFiles(uploadedPaths) {
  console.log('🧹 Starting cleanup of uploaded static files...\n');
  
  let deletedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const urlPath of uploadedPaths) {
    // 转换URL路径为本地文件路径
    const localPath = path.join(process.cwd(), 'public', urlPath);
    
    try {
      if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        const sizeKB = (stat.size / 1024).toFixed(1);
        
        fs.unlinkSync(localPath);
        console.log(`🗑️  Deleted: ${urlPath} (${sizeKB}KB)`);
        deletedCount++;
      } else {
        console.log(`⏭️  Skipped: ${urlPath} (not found)`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${urlPath}:`, error.message);
      errorCount++;
    }
  }
  
  // 清理空目录
  cleanEmptyDirectories();
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`🗑️  Deleted: ${deletedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (deletedCount > 0) {
    console.log('\n✅ Local static files have been cleaned up!');
    console.log('🌐 Files are now served from Cloudflare R2 CDN');
  }
  
  return { deletedCount, skippedCount, errorCount };
}

// 清理空目录
function cleanEmptyDirectories() {
  const publicDir = path.join(process.cwd(), 'public');
  
  function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    // 递归处理子目录
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirs(fullPath);
      }
    }
    
    // 检查目录是否为空（只包含.md文件的目录也算空）
    const remainingItems = fs.readdirSync(dir);
    const nonMdFiles = remainingItems.filter(item => !item.endsWith('.md'));
    
    if (nonMdFiles.length === 0 && dir !== publicDir) {
      console.log(`📁 Removing empty directory: ${path.relative(publicDir, dir)}`);
      
      // 移动.md文件到父目录或删除
      for (const mdFile of remainingItems) {
        const mdPath = path.join(dir, mdFile);
        console.log(`📄 Keeping documentation: ${path.relative(publicDir, mdPath)}`);
        // 保留.md文件，只删除目录中的其他内容
      }
      
      try {
        // 如果只有.md文件，保留目录但清空其他文件
        if (remainingItems.length === 0) {
          fs.rmdirSync(dir);
        }
      } catch (error) {
        // 忽略删除目录失败的错误
      }
    }
  }
  
  // 处理images目录及其子目录
  const imagesDir = path.join(publicDir, 'images');
  if (fs.existsSync(imagesDir)) {
    removeEmptyDirs(imagesDir);
  }
}

// 创建备份列表
function createBackupList(uploadedPaths) {
  const backupList = {
    timestamp: new Date().toISOString(),
    files: [],
    totalSize: 0
  };
  
  for (const urlPath of uploadedPaths) {
    const localPath = path.join(process.cwd(), 'public', urlPath);
    
    if (fs.existsSync(localPath)) {
      const stat = fs.statSync(localPath);
      backupList.files.push({
        path: urlPath,
        size: stat.size,
        sizeKB: (stat.size / 1024).toFixed(1)
      });
      backupList.totalSize += stat.size;
    }
  }
  
  // 保存备份列表
  const backupPath = path.join(process.cwd(), 'backup-static-files.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupList, null, 2));
  
  console.log(`📋 Created backup list: backup-static-files.json`);
  console.log(`📦 Total size to be cleaned: ${(backupList.totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  return backupList;
}

// 主清理函数
function main() {
  console.log('🧹 Cloudflare R2 Static Files Cleanup Tool\n');
  
  // 检查是否在正确的目录
  if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
  }
  
  // 加载已上传文件列表
  const uploadedPaths = loadUploadedFiles();
  console.log(`📁 Found ${uploadedPaths.length} uploaded files\n`);
  
  // 创建备份列表
  const backupList = createBackupList(uploadedPaths);
  
  // 询问用户确认
  if (process.argv.includes('--force') || process.argv.includes('-f')) {
    console.log('🚨 Force mode enabled, skipping confirmation\n');
  } else {
    console.log('\n⚠️  WARNING: This will permanently delete local static files!');
    console.log('📦 Files will be served from R2 CDN after cleanup.');
    console.log('💾 Backup list has been created: backup-static-files.json');
    console.log('\nTo proceed, run: pnpm clean:static --force\n');
    return;
  }
  
  // 执行清理
  const result = cleanUploadedFiles(uploadedPaths);
  
  if (result.deletedCount > 0) {
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('🔍 Project size reduction:', (backupList.totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('🚀 Faster deployments and better CDN performance!');
  }
}

// 运行清理
if (require.main === module) {
  main();
}

module.exports = { cleanUploadedFiles, createBackupList }; 