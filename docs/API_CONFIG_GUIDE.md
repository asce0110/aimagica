# API Configuration Management System

## 概述

AI绘图平台的API配置管理系统提供了强大的多API支持、自动故障转移和负载均衡功能。系统支持图片生成和视频生成两种类型的API配置。

## 🌟 主要特性

### ✅ 多API支持
- **图片生成**: OpenAI DALL-E, Stability AI, Replicate, 自定义API
- **视频生成**: Runway, Pika Labs, Stable Video Diffusion, 自定义API
- **灵活配置**: 每种类型可配置多个API提供商

### ✅ 自动故障转移
- **优先级系统**: 按优先级自动选择API
- **智能重试**: 失败时自动重试，重试次数可配置
- **快速切换**: 遇到速率限制或错误时立即切换到下一个API

### ✅ 负载均衡与监控
- **速率限制**: 每个API独立的速率限制管理
- **使用统计**: 详细的API使用日志和统计
- **健康检查**: 实时监控API健康状态

## 🚀 快速开始

### 1. 初始化数据库

首先在Supabase中执行数据库迁移脚本：

```sql
-- 执行 lib/database/migrations/004_api_configs.sql
-- 这将创建 api_configs 和 api_usage_logs 表
```

### 2. 访问管理界面

管理员登录后访问：`/admin/dashboard` → `API Configs` 标签页

### 3. 添加第一个API配置

点击 "Add API Config" 按钮，选择提供商并填写配置信息。

## 📋 API配置字段说明

### 基本信息
- **Configuration Name**: API配置的显示名称
- **API Type**: `image_generation` 或 `video_generation`
- **Provider**: 选择预定义的提供商或自定义
- **Priority**: 优先级，数字越小优先级越高

### 连接配置
- **Base URL**: API的基础URL
- **Endpoint Path**: 具体的API端点路径
- **API Key**: API密钥（支持显示/隐藏）
- **Model Name**: 使用的模型名称

### 高级设置
- **Max Retries**: 最大重试次数 (0-10)
- **Timeout**: 超时时间，秒 (10-300)
- **Rate Limit**: 每分钟请求限制
- **Active**: 是否启用此配置
- **Set as Default**: 是否设为默认API

### 配置数据 (JSON)
提供商特定的配置参数，例如：

```json
{
  "quality": "standard",
  "size": "1024x1024",
  "style": "vivid"
}
```

## 🔧 支持的API提供商

### 图片生成 🎨

#### OpenAI DALL-E 3
```json
{
  "base_url": "https://api.openai.com/v1",
  "endpoint": "/images/generations",
  "model": "dall-e-3",
  "config_data": {
    "quality": "standard",
    "size": "1024x1024",
    "style": "vivid"
  }
}
```

#### Stability AI SDXL
```json
{
  "base_url": "https://api.stability.ai/v1",
  "endpoint": "/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
  "model": "stable-diffusion-xl-1024-v1-0",
  "config_data": {
    "samples": 1,
    "steps": 30,
    "cfg_scale": 7
  }
}
```

#### Replicate
```json
{
  "base_url": "https://api.replicate.com/v1",
  "endpoint": "/predictions",
  "model": "stability-ai/sdxl",
  "config_data": {
    "width": 1024,
    "height": 1024,
    "num_outputs": 1
  }
}
```

### 视频生成 🎬

#### Runway Gen-2
```json
{
  "base_url": "https://api.runwayml.com/v1",
  "endpoint": "/generate",
  "model": "gen2",
  "config_data": {
    "duration": 4,
    "seed": 0,
    "upscale": false
  }
}
```

#### Pika Labs
```json
{
  "base_url": "https://api.pika.art/v1",
  "endpoint": "/generate",
  "model": "pika-1.0",
  "config_data": {
    "fps": 24,
    "aspect_ratio": "16:9",
    "camera_motion": "static"
  }
}
```

## 💻 开发者使用指南

### 使用API管理器

```typescript
import { apiManager } from '@/lib/services/api-manager'

// 生成图片
const result = await apiManager.generateImage(
  'A beautiful sunset over mountains',
  { style: 'vivid', size: '1024x1024' },
  userId
)

// 生成视频
const result = await apiManager.generateVideo(
  'A cat playing with a ball',
  { duration: 4, fps: 24 },
  userId
)
```

### API响应格式

```typescript
interface ApiResponse {
  success: boolean
  data?: any           // 生成的内容数据
  error?: string       // 错误信息
  response_time_ms?: number  // 响应时间
  api_config_id?: string     // 使用的API配置ID
}
```

### 在路由中使用

```typescript
// app/api/generate/image/route.ts
import { apiManager } from '@/lib/services/api-manager'

export async function POST(request: NextRequest) {
  const { prompt, ...options } = await request.json()
  
  const result = await apiManager.generateImage(
    prompt,
    options,
    session.user.id
  )
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true, 
    data: result.data 
  })
}
```

## 📊 监控和日志

### 查看使用统计

管理员可以查看：
- API调用总数和成功率
- 各提供商的使用情况
- 平均响应时间
- 错误日志和故障排除信息

### API使用日志

系统自动记录：
- 每次API调用的详细信息
- 响应时间和状态
- 用户信息和请求参数
- 错误信息和调试数据

## ⚡ 故障转移机制

### 自动切换逻辑

1. **按优先级尝试**: 从优先级最高的API开始
2. **重试机制**: 失败时按配置的次数重试
3. **智能切换**: 遇到速率限制立即切换
4. **全面覆盖**: 所有API失败时返回详细错误信息

### 故障类型处理

- **网络超时**: 自动重试，然后切换
- **速率限制**: 立即切换到下一个API
- **认证错误**: 记录错误，切换到下一个API
- **服务不可用**: 标记API状态，自动切换

## 🔐 安全考虑

### API密钥管理

- **加密存储**: API密钥安全存储在数据库中
- **权限控制**: 只有管理员可以查看和修改配置
- **掩码显示**: 界面中API密钥默认隐藏

### 访问控制

- **管理员权限**: 只有管理员可以管理API配置
- **用户日志**: 记录用户的API使用情况
- **审计追踪**: 完整的操作日志记录

## 🛠️ 故障排除

### 常见问题

#### API配置测试失败
1. 检查API密钥是否正确
2. 确认网络连接正常
3. 验证API配额是否充足
4. 检查请求格式是否正确

#### 故障转移不工作
1. 确认有多个活跃的API配置
2. 检查优先级设置是否正确
3. 验证重试次数配置
4. 查看API使用日志获取详细错误

#### 速率限制频繁触发
1. 调整速率限制配置
2. 增加更多API提供商
3. 优化请求频率
4. 考虑升级API套餐

### 调试技巧

```typescript
// 启用详细日志
console.log('🚀 Trying API:', apiConfig.name)
console.log('✅ Success rate:', successRate)
console.log('❌ Error details:', errorMessage)

// 查看API统计
const stats = await apiManager.getApiStats(24) // 过去24小时
console.log('API Statistics:', stats)
```

## 📈 性能优化

### 最佳实践

1. **合理设置优先级**: 将最快最稳定的API设为最高优先级
2. **配置适当的超时**: 平衡响应速度和成功率
3. **监控使用情况**: 定期查看统计数据优化配置
4. **分散风险**: 配置多个不同提供商的API

### 扩展建议

- **缓存机制**: 为相似请求添加缓存
- **负载均衡**: 根据API性能动态调整使用策略
- **成本优化**: 根据API价格和质量制定使用策略
- **监控告警**: 配置API故障自动告警

## 🎯 总结

API配置管理系统为AI绘图平台提供了：

✅ **高可用性**: 多API故障转移确保服务不中断  
✅ **灵活配置**: 支持各种主流AI服务提供商  
✅ **智能管理**: 自动化的负载均衡和错误处理  
✅ **详细监控**: 完整的使用统计和日志系统  
✅ **安全可靠**: 完善的权限控制和数据保护  

通过这个系统，管理员可以轻松管理多个AI API，确保用户始终能够获得最佳的生成体验！ 🚀 