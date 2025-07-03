/**
 * 构建时下载Gallery图片到本地
 * 这个脚本会在构建过程中运行，将R2存储的图片下载到public目录
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Gallery API 配置
const WORKERS_API_URL = process.env.WORKERS_API_URL || 'https://aimagica-api.403153162.workers.dev';
const GALLERY_API = `${WORKERS_API_URL}/api/gallery/public?limit=100`;

// 本地图片存储目录
const LOCAL_IMAGES_DIR = path.join(__dirname, '../public/images/gallery');

// 确保目录存在
if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
  fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });
}

/**
 * 下载图片到本地
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(LOCAL_IMAGES_DIR, filename);
    
    // 如果文件已存在，跳过下载
    if (fs.existsSync(filepath)) {
      console.log(`✅ 跳过已存在的文件: ${filename}`);
      resolve(filename);
      return;
    }

    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ 下载完成: ${filename}`);
        resolve(filename);
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // 删除不完整的文件
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 生成本地文件名
 */
function generateLocalFilename(url, id) {
  const urlHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  const extension = path.extname(url) || '.jpg';
  return `${id}-${urlHash}${extension}`;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🎨 开始下载Gallery图片到本地...');
    console.log('📡 API URL:', GALLERY_API);

    // 获取Gallery数据
    const response = await fetch(GALLERY_API);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('API返回数据格式错误');
    }

    console.log(`📊 发现 ${result.data.length} 张图片`);

    // 创建图片映射文件
    const imageMap = {};
    const downloadPromises = [];

    for (const image of result.data) {
      if (image.url && !image.url.includes('/images/examples/')) {
        const localFilename = generateLocalFilename(image.url, image.id);
        const localUrl = `/images/gallery/${localFilename}`;
        
        imageMap[image.url] = localUrl;
        
        // 下载图片
        downloadPromises.push(
          downloadImage(image.url, localFilename).catch(err => {
            console.error(`❌ 下载失败 ${image.url}:`, err.message);
            return null;
          })
        );
      }
    }

    // 并行下载
    const results = await Promise.all(downloadPromises);
    const successCount = results.filter(r => r !== null).length;
    
    console.log(`📸 下载完成: ${successCount}/${downloadPromises.length} 张图片`);

    // 保存映射文件
    const mapFilePath = path.join(LOCAL_IMAGES_DIR, 'url-mapping.json');
    fs.writeFileSync(mapFilePath, JSON.stringify(imageMap, null, 2));
    console.log('💾 URL映射文件已保存:', mapFilePath);

    console.log('✅ 所有图片下载完成!');

  } catch (error) {
    console.error('❌ 下载过程出错:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main, downloadImage, generateLocalFilename };