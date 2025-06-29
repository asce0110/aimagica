# R2 集成实现指南

## 🎯 实现概述

我们已经完成了 Cloudflare R2 存储与画廊系统的集成，实现了以下功能：

### ✅ 已实现功能

1. **智能存储策略**
   - 私人图片：保存原始生成URL，不上传到R2
   - 公开图片：自动下载并上传到R2，获得永久存储URL

2. **数据库架构扩展**
   - 添加 `r2_key` 字段：存储R2文件键，用于管理和删除
   - 添加 `original_url` 字段：保留原始生成API的URL

3. **API端点**
   - `/api/images/upload-to-r2` - 下载图片并上传到R2
   - `/api/images/save` - 保存图片信息，公开图片自动上传R2
   - `/api/gallery/public` - 获取公开画廊图片

## 🗂️ 文件结构

```
lib/storage/r2.ts                    # R2存储核心功能
app/api/images/upload-to-r2/route.ts # R2上传API
app/api/images/save/route.ts         # 图片保存API（含R2集成）
app/api/gallery/public/route.ts     # 画廊公开图片API
lib/database/images.ts              # 数据库操作（含R2清理）
lib/database/migrations/             # 数据库迁移脚本
docs/R2_INTEGRATION_GUIDE.md        # 本文档
```

## 📋 数据库迁移

运行以下SQL脚本添加R2相关字段：

```sql
-- 添加 R2 存储键字段
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500);

-- 添加原始图片URL字段
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_generated_images_r2_key ON generated_images(r2_key);
```

## 🔄 工作流程

### 用户生成图片流程

1. **图片生成** → 调用生成API获得临时URL
2. **用户确认** → 显示对话框询问是否分享到画廊
3. **保存处理**：
   - 选择"私人收藏" → 直接保存到数据库，不上传R2
   - 选择"分享画廊" → 下载图片 → 上传到R2 → 保存R2 URL到数据库

### R2存储路径规则

```
gallery/{user_id}/{timestamp}_{prompt_slug}.{extension}
```

示例：
```
gallery/user123/1703123456789_beautiful_sunset.png
```

## 🛠️ 核心函数

### R2上传服务

```typescript
// 上传文件到R2
await uploadToR2(buffer, fileName, contentType)

// 生成预签名URL
await generatePresignedUploadUrl(fileName, contentType)

// 删除R2文件
await deleteFromR2(fileName)
```

### 数据库操作

```typescript
// 创建图片记录（支持R2字段）
await createGeneratedImage({
  user_id,
  generated_image_url: r2Url,
  prompt,
  style,
  is_public: true,
  r2_key: 'gallery/user123/1703123456789_image.png',
  original_url: originalUrl
})

// 删除图片（自动清理R2文件）
await deleteImageWithCleanup(imageId, userId)
```

## 🎨 画廊显示逻辑

1. 画廊页面从 `/api/gallery/public` 获取公开图片
2. 只显示 `is_public: true` 的图片
3. 按 `created_at` 降序排列（最新优先）
4. 支持分页加载

## 🔧 配置要求

确保环境变量已正确配置：

```env
CLOUDFLARE_R2_ENDPOINT=https://账户ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://images.yourdomain.com  # 可选
```

## 🚀 性能优化

1. **按需上传**：只有公开图片才上传到R2，节省存储成本
2. **异步处理**：R2上传失败不影响图片保存，提高用户体验
3. **错误处理**：上传失败时使用原始URL作为备用方案
4. **索引优化**：为R2 key添加数据库索引，提高查询性能

## 📊 监控和管理

### 管理员功能

```typescript
// 获取所有图片的R2信息
const images = await getImagesWithR2Info(50, 0)

// 检查R2存储使用情况
images.forEach(img => {
  console.log(`Image ${img.id}: R2 Key = ${img.r2_key}`)
})
```

### 数据清理

```typescript
// 删除图片时自动清理R2文件
await deleteImageWithCleanup(imageId, userId)
```

## 🛡️ 安全考虑

1. **权限控制**：只有图片所有者可以删除图片
2. **文件验证**：上传前验证文件类型和大小
3. **路径安全**：使用安全的文件名生成规则
4. **访问控制**：R2存储桶配置为公开读取，但禁止公开写入

## 🔍 故障排除

### 常见问题

1. **R2上传失败**
   - 检查环境变量配置
   - 验证R2存储桶权限
   - 查看控制台错误日志

2. **图片无法显示**
   - 检查R2自定义域名配置
   - 验证CORS设置
   - 确认存储桶公开访问配置

3. **数据库字段错误**
   - 运行迁移脚本添加新字段
   - 更新TypeScript类型定义

### 调试命令

```bash
# 检查R2连接
curl -X POST http://localhost:3000/api/images/upload-to-r2 \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "test_url", "prompt": "test"}'

# 检查画廊API
curl http://localhost:3000/api/gallery/public
```

## 📈 未来扩展

1. **图片压缩**：上传前自动压缩图片
2. **CDN集成**：配置Cloudflare CDN加速
3. **批量操作**：支持批量上传和删除
4. **存储统计**：监控存储使用量和成本
5. **图片处理**：集成Cloudflare Images进行实时处理 