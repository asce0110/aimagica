const fs = require('fs');
const path = require('path');

// 创建简单的SVG占位符图片
const createSVGPlaceholder = (width, height, text, bgColor, textColor) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
  </svg>`;
};

// 创建占位符图片数据
const placeholders = [
  {
    name: 'cat-wizard',
    text: 'Cat Wizard',
    bgColor: '#8b7355',
    textColor: '#f5f1e8'
  },
  {
    name: 'cyber-city',
    text: 'Cyber City',
    bgColor: '#2d3e2d',
    textColor: '#d4a574'
  },
  {
    name: 'magic-forest',
    text: 'Magic Forest',
    bgColor: '#d4a574',
    textColor: '#2d3e2d'
  },
  {
    name: 'space-art',
    text: 'Space Art',
    bgColor: '#f5f1e8',
    textColor: '#8b7355'
  }
];

// 创建目录
const examplesDir = path.join(__dirname, '../public/images/examples');
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

// 生成SVG文件
placeholders.forEach(placeholder => {
  const svg = createSVGPlaceholder(400, 400, placeholder.text, placeholder.bgColor, placeholder.textColor);
  
  // 保存为SVG文件（作为fallback）
  fs.writeFileSync(
    path.join(examplesDir, `${placeholder.name}.svg`),
    svg
  );
  
  console.log(`✅ Created ${placeholder.name}.svg`);
});

// 创建通用占位符
const errorPlaceholder = createSVGPlaceholder(400, 400, 'Image Error', '#ff6b6b', '#ffffff');
fs.writeFileSync(path.join(__dirname, '../public/images/placeholder-error.svg'), errorPlaceholder);

const loadingPlaceholder = createSVGPlaceholder(400, 400, 'Loading...', '#f5f1e8', '#8b7355');
fs.writeFileSync(path.join(__dirname, '../public/images/placeholder.svg'), loadingPlaceholder);

console.log('✅ All placeholder images created successfully!'); 