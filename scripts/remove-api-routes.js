#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要删除的API路由文件（暂时删除以支持静态导出）
const apiFilesToRemove = [
  // Auth related
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/auth/[...nextauth]/route-backup.ts',
  'app/api/auth/[...nextauth]/route-simple.ts',
  'app/api/auth/callback/route.ts',
  'app/api/auth/logout/route.ts',
  
  // Image generation
  'app/api/generate/image/route.ts',
  'app/api/generate/kie-flux/route.ts',
  'app/api/generate/video/route.ts',
  
  // Image handling
  'app/api/images/generate/route.ts',
  'app/api/images/save/route.ts',
  'app/api/images/upload-base64/route.ts',
  'app/api/images/upload-to-r2/route.ts',
  
  // User data
  'app/api/users/sync/route.ts',
  'app/api/users/update-profile/route.ts',
  'app/api/favorites/route.ts',
  'app/api/favorites/[imageId]/route.ts',
  
  // Gallery
  'app/api/gallery/[id]/route.ts',
  'app/api/gallery/[id]/comments/route.ts',
  'app/api/gallery/[id]/comments/[commentId]/like/route.ts',
  'app/api/gallery/public/route.ts',
  
  // Admin routes - Base
  'app/api/admin/check/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/admin/login-logs/route.ts',
  
  // Admin routes - API configs (causing import errors)
  'app/api/admin/api-configs/route.ts',
  'app/api/admin/api-configs/[id]/route.ts',
  'app/api/admin/api-configs/test/route.ts',
  
  // Admin routes - Images (causing import errors)
  'app/api/admin/images/route.ts',
  'app/api/admin/images/diagnose/route.ts',
  'app/api/admin/images/edit/route.ts',
  'app/api/admin/images/featured/route.ts',
  'app/api/admin/images/make-all-public/route.ts',
  'app/api/admin/images/stats/route.ts',
  'app/api/admin/images/toggle-public/route.ts',
  'app/api/admin/images/upload/route.ts',
  
  // Admin routes - Other
  'app/api/admin/add-toy-photography-style/route.ts',
  'app/api/admin/init-styles/route.ts',
  'app/api/admin/migrate-styles/route.ts',
  'app/api/admin/upload-cropped-image/route.ts',
  'app/api/admin/test-check/route.ts',
  'app/api/admin/user-prompts/route.ts',
  
  // Admin routes - Styles
  'app/api/admin/styles/route.ts',
  'app/api/admin/styles/[id]/route.ts',
  'app/api/admin/styles/fix-templates/route.ts',
  
  // Admin routes - Magic coins
  'app/api/admin/magic-coins/packages/route.ts',
  
  // Admin routes - Payment
  'app/api/admin/payment/plans/route.ts',
  'app/api/admin/payment/providers/route.ts',
  'app/api/admin/payment/providers/[id]/route.ts',
  'app/api/admin/payment/providers/[id]/test/route.ts',
  
  // Payment
  'app/api/payment/create-checkout/route.ts',
  'app/api/payment/paypal/verify/route.ts',
  'app/api/payment/webhooks/paypal/route.ts',
  
  // Magic coins
  'app/api/magic-coins/balance/route.ts',
  'app/api/magic-coins/packages/route.ts',
  'app/api/magic-coins/transactions/route.ts',
  
  // Styles
  'app/api/styles/route.ts',
  'app/api/styles-public/route.ts',
  'app/api/init-styles-public/route.ts',
  
  // User prompts
  'app/api/user-prompts/route.ts',
  'app/api/user-prompts/[id]/route.ts',
  'app/api/user-prompts/[id]/like/route.ts',
  'app/api/user-prompts/[id]/use/route.ts',
  
  // Dashboard
  'app/api/dashboard/images/route.ts',
  'app/api/dashboard/stats/route.ts',
  'app/api/dashboard/users/route.ts',
  
  // Debug
  'app/api/debug/auth/route.ts',
  'app/api/debug/styles/route.ts',
  'app/api/debug/tables/route.ts',
  
  // Test routes
  'app/api/test/route.ts',
  'app/api/test-comments/route.ts',
  'app/api/test-simple-comments/route.ts',
  'app/api/test-r2/route.ts',
  
  // Others
  'app/api/recommendations/route.ts',
  'app/api/featured-images/route.ts',
  'app/api/models/available/route.ts',
  'app/api/upload/route.ts',
  'app/api/proxy/avatar/route.ts',
];

console.log('🗑️  Removing ALL API routes for static export build...\n');

let deletedCount = 0;
let notFoundCount = 0;

apiFilesToRemove.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted: ${filePath}`);
      deletedCount++;
    } else {
      console.log(`⚠️  Not found: ${filePath}`);
      notFoundCount++;
    }
  } catch (error) {
    console.error(`❌ Failed to delete ${filePath}:`, error.message);
  }
});

// 额外清理：删除空的API目录
function removeEmptyDirectories(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`🗂️  Removed empty directory: ${path.relative(process.cwd(), dirPath)}`);
        
        // 递归检查父目录
        const parentDir = path.dirname(dirPath);
        if (parentDir !== path.join(process.cwd(), 'app') && parentDir !== process.cwd()) {
          removeEmptyDirectories(parentDir);
        }
      }
    }
  } catch (error) {
    // 忽略删除目录的错误
  }
}

// 清理空目录
const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  const walkAndCleanDirectories = (dir) => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        walkAndCleanDirectories(itemPath);
        removeEmptyDirectories(itemPath);
      }
    });
  };
  
  try {
    walkAndCleanDirectories(apiDir);
    removeEmptyDirectories(apiDir);
  } catch (error) {
    console.log('⚠️  Some directories could not be cleaned');
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Deleted: ${deletedCount} files`);
console.log(`   Not found: ${notFoundCount} files`);
console.log(`\n🏗️  Static export build should now succeed!`);
console.log(`\n⚠️  Remember: ALL API functionality is temporarily disabled.`);
console.log(`   The site will work in static/demo mode only.`); 