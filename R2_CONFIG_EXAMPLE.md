# Cloudflare R2 配置指南

## 🚀 第一步：获取R2存储桶信息

### 1. 创建R2存储桶
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的账户
3. 进入 "R2 Object Storage"
4. 点击 "Create bucket"
5. 输入存储桶名称（例如：`aimagica-images`）
6. 选择区域（推荐选择离用户最近的区域）

### 2. 获取API密钥
1. 在R2页面，点击 "Manage R2 API tokens"
2. 点击 "Create API token"
3. 选择权限：
   - **Object:Edit** (用于上传、删除文件)
   - **Object:Read** (用于读取文件)
4. 选择存储桶范围（可以选择特定存储桶或全部）
5. 复制生成的 Access Key ID 和 Secret Access Key

### 3. 获取账户信息
1. 在Cloudflare Dashboard右侧边栏找到 "Account ID"
2. 复制账户ID

## 📝 第二步：配置环境变量

在你的 `.env.local` 文件中添加以下配置：

```bash
# Cloudflare R2 配置
CLOUDFLARE_R2_ENDPOINT=https://你的账户ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=你的Access_Key_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY=你的Secret_Access_Key
CLOUDFLARE_R2_BUCKET_NAME=你的存储桶名称

# 可选：自定义域名（如果你配置了自定义域名）
# CLOUDFLARE_R2_CUSTOM_DOMAIN=https://images.yourdomain.com
```

## 🌐 第三步：配置自定义域名（可选但推荐）

### 1. 在Cloudflare中配置
1. 进入你的R2存储桶设置
2. 点击 "Settings" → "Custom Domains"
3. 点击 "Connect Domain"
4. 输入你的域名（例如：`images.yourdomain.com`）
5. 按照提示完成DNS配置

### 2. 更新环境变量
```bash
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://images.yourdomain.com
```

## 🔐 第四步：配置存储桶策略（公开读取）

为了让上传的图片可以公开访问，需要配置存储桶策略：

1. 进入你的R2存储桶
2. 点击 "Settings" → "Bucket configuration"
3. 在 "R2.dev subdomain" 部分，点击 "Allow Access"
4. 这将允许通过 `https://pub-xxxxx.r2.dev/` 访问文件

## ✅ 第五步：测试配置

重启你的开发服务器，然后：

1. 登录你的应用
2. 尝试上传一张图片
3. 检查是否能成功上传并显示

## 📋 完整的 .env.local 示例

```bash
# 现有的配置...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 新增的R2配置
CLOUDFLARE_R2_ENDPOINT=https://你的账户ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=你的Access_Key_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY=你的Secret_Access_Key
CLOUDFLARE_R2_BUCKET_NAME=aimagica-images
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://images.yourdomain.com
```

## 🎯 使用示例

### 基础上传组件
```tsx
import ImageUpload from '@/components/ui/image-upload'

function MyComponent() {
  const handleUpload = (result) => {
    console.log('上传成功:', result.url)
    // 处理上传结果
  }

  const handleError = (error) => {
    console.error('上传失败:', error)
    // 处理错误
  }

  return (
    <ImageUpload
      onUpload={handleUpload}
      onError={handleError}
      uploadType="avatar"
    />
  )
}
```

## 🔧 故障排除

### 问题：上传失败，返回403错误
**解决方案**：
- 检查API密钥权限是否正确
- 确认存储桶名称是否匹配
- 验证账户ID是否正确

### 问题：图片无法访问
**解决方案**：
- 确保存储桶已开启公开访问
- 检查自定义域名配置
- 验证DNS设置

### 问题：环境变量未生效
**解决方案**：
- 重启开发服务器
- 检查 `.env.local` 文件语法
- 确认环境变量名称拼写正确

---

配置完成后，你的应用就可以使用Cloudflare R2进行图片存储了！🎉 