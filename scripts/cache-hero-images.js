const fs = require('fs');
const path = require('path');
const https = require('https');

// Hero区域的热门图片URL（来自静态数据）
const heroImages = [
  {
    id: '386628e0-61b1-4966-8575-2c2f2f162e3a',
    url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750949808349_Japanese_Anime_Style.png',
    filename: 'hero-1-japanese-anime.png'
  },
  {
    id: '48a8804f-9028-4132-85dd-d5c4d807c75e', 
    url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750862975446_A_cyberpunk_city_with_neon_lig.jpeg',
    filename: 'hero-2-cyberpunk-city.jpeg'
  },
  {
    id: '9912c424-e6a2-4ac1-98de-77bac4200978',
    url: 'https://images.aimagica.ai/gallery/105948948301872216168/1750861881556_A_peaceful_zen_garden_with_che.jpeg', 
    filename: 'hero-3-zen-garden.jpeg'
  },
  {
    id: '294ff75d-8579-4d3d-87ee-811b69b15a99',
    url: 'https://tempfile.aiquickdraw.com/v/68f5527672694583a3f90d9dbaec819f_0_1750696712.png',
    filename: 'hero-4-digital-art.png'
  }
];

// 确保缓存目录存在
const cacheDir = path.join(__dirname, '../public/images/hero-cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log('✅ 创建Hero缓存目录:', cacheDir);
}

/**
 * 下载单个图片到本地缓存
 */
function downloadImage(imageInfo) {
  return new Promise((resolve, reject) => {
    const { url, filename } = imageInfo;
    const localPath = path.join(cacheDir, filename);
    
    // 如果文件已存在，跳过下载
    if (fs.existsSync(localPath)) {
      console.log(`⏭️  ${filename} 已存在，跳过下载`);
      resolve(localPath);
      return;
    }
    
    console.log(`🔄 开始下载: ${filename}`);
    const startTime = Date.now();
    
    const file = fs.createWriteStream(localPath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0');
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize > 0) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r📥 ${filename}: ${progress}%`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const downloadTime = Date.now() - startTime;
        const fileSizeKB = Math.round(downloadedSize / 1024);
        console.log(`\n✅ ${filename} 下载完成 (${fileSizeKB}KB, ${downloadTime}ms)`);
        resolve(localPath);
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(localPath, () => {}); // 删除不完整的文件
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(localPath, () => {});
      reject(err);
    });
  });
}

/**
 * 生成缓存映射文件
 */
function generateCacheMapping(results) {
  const mapping = {};
  
  heroImages.forEach((img, index) => {
    if (results[index].status === 'fulfilled') {
      mapping[img.id] = {
        originalUrl: img.url,
        cachedUrl: `/images/hero-cache/${img.filename}`,
        filename: img.filename,
        localPath: results[index].value
      };
    }
  });
  
  const mappingPath = path.join(__dirname, '../public/hero-cache-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log('📄 生成缓存映射文件:', mappingPath);
  
  return mapping;
}

/**
 * 主函数
 */
async function cacheHeroImages() {
  console.log('🚀 开始缓存Hero区域图片...\n');
  
  try {
    // 并行下载所有图片
    const downloadPromises = heroImages.map(downloadImage);
    const results = await Promise.allSettled(downloadPromises);
    
    console.log('\n📊 下载结果汇总:');
    results.forEach((result, index) => {
      const img = heroImages[index];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${img.filename}: 成功`);
      } else {
        console.log(`❌ ${img.filename}: ${result.reason.message}`);
      }
    });
    
    // 生成缓存映射
    const mapping = generateCacheMapping(results);
    
    console.log('\n🎉 Hero图片缓存完成!');
    console.log(`📁 缓存目录: ${cacheDir}`);
    console.log(`📋 成功缓存: ${Object.keys(mapping).length}/${heroImages.length} 张图片`);
    
    // 显示缓存的图片信息
    console.log('\n📸 已缓存的图片:');
    Object.values(mapping).forEach(item => {
      const stats = fs.statSync(item.localPath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  • ${item.filename} (${sizeKB}KB)`);
    });
    
  } catch (error) {
    console.error('❌ 缓存过程出错:', error);
    process.exit(1);
  }
}

// 运行缓存脚本
if (require.main === module) {
  cacheHeroImages();
}

module.exports = { cacheHeroImages };