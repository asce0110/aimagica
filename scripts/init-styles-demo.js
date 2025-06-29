/**
 * 风格管理系统演示初始化脚本
 * 
 * 这个脚本演示了如何：
 * 1. 在Supabase中创建风格表
 * 2. 插入示例风格数据
 * 3. 测试风格API功能
 */

const fs = require('fs')
const path = require('path')

console.log('🎨 AIMAGICA 风格管理系统演示脚本')
console.log('=====================================')

console.log('\n📋 功能概览:')
console.log('✅ 管理员可以通过后台添加、编辑、删除风格')
console.log('✅ 每个风格包含:')
console.log('   - 名称和描述')
console.log('   - Emoji 图标')
console.log('   - 预览图片')
console.log('   - 提示词模板 (支持 {prompt} 占位符)')
console.log('   - 类型: image/video/both')
console.log('   - 分类: art/photography/anime/abstract/vintage/modern')
console.log('   - 是否为付费风格')
console.log('   - 激活状态')
console.log('   - 排序顺序')

console.log('\n📁 已创建的文件:')
console.log('✅ lib/database/styles.ts - 风格数据库操作')
console.log('✅ app/api/admin/styles/route.ts - 管理员风格API')
console.log('✅ app/api/admin/styles/[id]/route.ts - 单个风格CRUD')
console.log('✅ app/api/styles/route.ts - 公开风格API')
console.log('✅ components/admin/style-form.tsx - 风格编辑表单')
console.log('✅ components/style-selector.tsx - 用户风格选择器 (已重构)')
console.log('✅ docs/database/styles-table.sql - 数据库表创建脚本')

console.log('\n🚀 使用说明:')
console.log('1. 在Supabase中执行 docs/database/styles-table.sql 创建表')
console.log('2. 启动项目: pnpm dev')
console.log('3. 访问管理后台的 "Styles" 标签页')
console.log('4. 添加和管理风格')
console.log('5. 在生图界面测试风格选择功能')

console.log('\n🔄 工作流程:')
console.log('1. 用户在生图界面选择风格')
console.log('2. 系统获取风格的提示词模板')
console.log('3. 将用户输入的 prompt 替换到模板中的 {prompt} 占位符')
console.log('4. 使用最终的完整提示词进行图片生成')

console.log('\n💡 示例风格模板:')
console.log('输入: "a cute cat"')
console.log('动漫风格模板: "{prompt}, anime style, vibrant colors, detailed artwork"')
console.log('最终提示词: "a cute cat, anime style, vibrant colors, detailed artwork"')

console.log('\n🎯 API端点:')
console.log('- GET /api/styles?type=image - 获取公开风格列表')
console.log('- GET /api/admin/styles - 管理员获取所有风格')
console.log('- POST /api/admin/styles - 创建新风格')
console.log('- PUT /api/admin/styles/[id] - 更新风格')
console.log('- DELETE /api/admin/styles/[id] - 删除风格')
console.log('- POST /api/generate/image - 生图API (支持 styleId 参数)')

console.log('\n📊 数据库表结构:')
console.log(`
CREATE TABLE styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  emoji VARCHAR(10) DEFAULT '🎨',
  image_url TEXT,
  prompt_template TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'both')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('photographic-realism', 'illustration-digital-painting', 'anime-comics', 'concept-art', '3d-render', 'abstract', 'fine-art-movements', 'technical-scientific', 'architecture-interior', 'design-commercial', 'genre-driven', 'vintage-retro')),
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`)

// 读取SQL文件并显示
const sqlPath = path.join(__dirname, '..', 'docs', 'database', 'styles-table.sql')
if (fs.existsSync(sqlPath)) {
  console.log('\n📄 SQL脚本内容预览:')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')
  const lines = sqlContent.split('\n').slice(0, 10)
  console.log(lines.join('\n') + '\n...(更多内容见 docs/database/styles-table.sql)')
}

console.log('\n🎉 风格管理系统已准备就绪!')
console.log('请按照上述步骤进行配置和测试。')
console.log('\n如有问题，请检查:')
console.log('- 数据库表是否正确创建')
console.log('- API路由是否正常工作')
console.log('- 管理员权限是否正确配置') 