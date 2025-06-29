# 管理员权限设置指南

## 🚨 重要：首次部署必须执行

在首次部署或更新管理员权限时，请按照以下步骤操作：

## 第一步：执行数据库脚本

### 方式一：通过Supabase Dashboard
1. 登录到 [Supabase Dashboard](https://supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建新查询
5. 复制并执行以下脚本：

```sql
-- 第一次执行：修复RLS策略并创建admin_config表
-- 执行 lib/database/migrations/002_fix_rls_policies.sql 的全部内容

-- 第二次执行：设置管理员权限
-- 执行以下内容：

-- 清空现有管理员配置
DELETE FROM public.admin_config;

-- 设置 asce3801@gmail.com 为唯一管理员
INSERT INTO public.admin_config (email, role) VALUES 
    ('asce3801@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 验证配置
SELECT * FROM public.admin_config;
```

### 方式二：通过SQL文件
执行项目中的SQL文件：
1. `lib/database/migrations/002_fix_rls_policies.sql`
2. `lib/database/migrations/003_update_admin_config.sql`

## 第二步：验证配置

### 检查数据库
```sql
-- 查看admin_config表内容
SELECT * FROM public.admin_config;

-- 应该显示：
-- email: asce3801@gmail.com
-- role: admin
```

### 测试登录
1. 访问 `http://localhost:3000/admin/login`
2. 使用 `asce3801@gmail.com` 登录
3. 应该自动跳转到管理员Dashboard
4. 使用其他邮箱登录应该跳转到普通用户页面

## 第三步：添加更多管理员（可选）

### 通过SQL
```sql
INSERT INTO public.admin_config (email, role) VALUES 
    ('another-admin@example.com', 'admin');
```

### 通过代码
```typescript
import { addAdmin } from '@/lib/database/admin'
await addAdmin('another-admin@example.com')
```

## 管理员权限特性

### ✅ 数据库驱动
- 不再硬编码管理员邮箱
- 可动态增删管理员
- 支持多个管理员

### ✅ API检查
- `/api/admin/check` 路由检查权限
- 安全的服务端验证
- 错误处理和降级

### ✅ 自动重定向
- 管理员自动跳转到 `/admin/dashboard`
- 普通用户跳转到首页 `/`
- 基于实时数据库查询

## 故障排除

### 问题：管理员登录后跳转到首页
**解决方案**：
1. 检查 `admin_config` 表是否存在
2. 确认邮箱在表中且role为'admin'
3. 检查Supabase环境变量配置

### 问题：权限检查API返回错误
**解决方案**：
1. 确认 `SUPABASE_SERVICE_ROLE_KEY` 环境变量设置正确
2. 检查RLS策略是否正确配置
3. 查看服务器日志获取详细错误信息

### 问题：数据库连接失败
**解决方案**：
1. 检查 `.env.local` 中的Supabase配置
2. 确认网络连接正常
3. 验证Supabase项目状态

## 环境变量确认

确保以下环境变量已正确配置：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 完成验证

执行完所有步骤后：

1. ✅ `asce3801@gmail.com` 可以访问管理员功能
2. ✅ 其他邮箱被识别为普通用户
3. ✅ 权限检查通过API实时查询数据库
4. ✅ 可以通过数据库灵活管理管理员列表

现在你的管理员权限系统已经完全基于数据库配置，更加灵活和可维护！🎉 