import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 检查必需的环境变量
if (!supabaseUrl) {
  console.error('❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL')
  console.error('请参考 URGENT_ENV_SETUP.md 配置环境变量')
}

if (!supabaseServiceKey) {
  console.error('❌ 缺少环境变量: SUPABASE_SERVICE_ROLE_KEY')
  console.error('请参考 URGENT_ENV_SETUP.md 配置环境变量')
}

// 使用服务角色密钥创建客户端（可以绕过RLS）
let supabaseService: any = null

try {
  if (supabaseUrl && supabaseServiceKey) {
    supabaseService = createClient(supabaseUrl, supabaseServiceKey)
  }
} catch (error) {
  console.error('❌ Supabase客户端创建失败:', error)
}

/**
 * 检查用户是否为管理员
 * @param email 用户邮箱
 * @returns Promise<boolean> 是否为管理员
 */
export async function isAdmin(email: string): Promise<boolean> {
  try {
    if (!email) {
      console.log("🔍 管理员检查: 邮箱为空")
      return false
    }

    if (!supabaseService) {
      console.error("❌ Supabase服务未初始化，请检查环境变量配置")
      console.error("请参考 URGENT_ENV_SETUP.md 配置环境变量")
      return false
    }

    console.log(`🔍 检查管理员权限: ${email}`)

    // 查询admin_config表
    const { data, error } = await supabaseService
      .from('admin_config')
      .select('role')
      .eq('email', email)
      .single()

    if (error) {
      console.error("❌ 管理员权限查询失败:", error)
      return false
    }

    const isAdminUser = data && data.role === 'admin'
    console.log(`🔍 管理员检查结果: ${email} -> ${isAdminUser ? '✅ 管理员' : '❌ 普通用户'}`)
    
    return isAdminUser
  } catch (error) {
    console.error("❌ 管理员权限检查异常:", error)
    return false
  }
}

/**
 * 获取所有管理员列表
 * @returns Promise<string[]> 管理员邮箱列表
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    if (!supabaseService) {
      console.error("❌ Supabase服务未初始化，请检查环境变量配置")
      return []
    }

    const { data, error } = await supabaseService
      .from('admin_config')
      .select('email')
      .eq('role', 'admin')

    if (error) {
      console.error("❌ 获取管理员列表失败:", error)
      return []
    }

    const emails = data?.map(item => item.email) || []
    console.log(`📋 当前管理员列表:`, emails)
    
    return emails
  } catch (error) {
    console.error("❌ 获取管理员列表异常:", error)
    return []
  }
}

/**
 * 添加管理员
 * @param email 管理员邮箱
 * @returns Promise<boolean> 是否添加成功
 */
export async function addAdmin(email: string): Promise<boolean> {
  try {
    if (!supabaseService) {
      console.error("❌ Supabase服务未初始化，请检查环境变量配置")
      return false
    }

    const { error } = await supabaseService
      .from('admin_config')
      .insert({ email, role: 'admin' })

    if (error) {
      console.error("❌ 添加管理员失败:", error)
      return false
    }

    console.log(`✅ 成功添加管理员: ${email}`)
    return true
  } catch (error) {
    console.error("❌ 添加管理员异常:", error)
    return false
  }
}

/**
 * 移除管理员
 * @param email 管理员邮箱
 * @returns Promise<boolean> 是否移除成功
 */
export async function removeAdmin(email: string): Promise<boolean> {
  try {
    if (!supabaseService) {
      console.error("❌ Supabase服务未初始化，请检查环境变量配置")
      return false
    }

    const { error } = await supabaseService
      .from('admin_config')
      .delete()
      .eq('email', email)

    if (error) {
      console.error("❌ 移除管理员失败:", error)
      return false
    }

    console.log(`✅ 成功移除管理员: ${email}`)
    return true
  } catch (error) {
    console.error("❌ 移除管理员异常:", error)
    return false
  }
} 