#!/usr/bin/env node

const https = require('https');
const http = require('http');

// 测试URL列表
const testUrls = [
  'https://images.aimagica.ai/images/aimagica-logo.png',
  'https://images.aimagica.ai/placeholder-logo.png',
  'https://9a54200354c496d0e610009d7ab97c17.r2.cloudflarestorage.com/ai-sketch/images/aimagica-logo.png',
  'https://pub-b8db533c86c44478b50c6e29397fccb6.r2.dev/images/aimagica-logo.png'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    console.log(`🔍 Testing: ${url}`);
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   📦 Content-Type: ${res.headers['content-type'] || 'unknown'}`);
      console.log(`   📏 Content-Length: ${res.headers['content-length'] || 'unknown'}`);
      resolve({ url, status: res.statusCode, success: true });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ url, error: error.message, success: false });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏱️ Timeout after 10 seconds`);
      req.destroy();
      resolve({ url, error: 'Timeout', success: false });
    });
    
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing R2 Domain Accessibility...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const result = await testUrl(url);
    results.push(result);
    console.log(''); // 空行分隔
  }
  
  console.log('📊 Test Summary:');
  console.log('─'.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('✅ Working URLs:');
    successful.forEach(r => console.log(`   ${r.url}`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed URLs:');
    failed.forEach(r => console.log(`   ${r.url} (${r.error})`));
  }
  
  console.log(`\n📈 Success Rate: ${successful.length}/${results.length}`);
  
  if (successful.length === 0) {
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check if custom domain is properly configured in Cloudflare R2');
    console.log('   2. Verify bucket name and file paths');
    console.log('   3. Ensure bucket has public read access');
    console.log('   4. Check if files were actually uploaded to R2');
  }
}

if (require.main === module) {
  main().catch(console.error);
} 