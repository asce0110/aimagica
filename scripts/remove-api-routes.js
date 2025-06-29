#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要删除的API路由文件（暂时删除以支持静态导出）
const apiFilesToRemove = [
  // Auth related
  'app/api/auth/[...nextauth]/route.ts',
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
  
  // Admin routes
  'app/api/admin/check/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/admin/images/route.ts',
  'app/api/admin/login-logs/route.ts',
  
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
  
  // Others
  'app/api/recommendations/route.ts',
  'app/api/featured-images/route.ts',
  'app/api/models/available/route.ts',
  'app/api/upload/route.ts',
  'app/api/test/route.ts',
];

console.log('🗑️  Removing API routes for static export build...\n');

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

console.log(`\n📊 Summary:`);
console.log(`   Deleted: ${deletedCount} files`);
console.log(`   Not found: ${notFoundCount} files`);
console.log(`\n🏗️  Now you can run: pnpm build:cf`);
console.log(`\n⚠️  Remember: These API routes are temporarily disabled.`);
console.log(`   Functionality will be limited until API alternatives are implemented.`); 