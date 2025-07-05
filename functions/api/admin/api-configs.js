/**
 * Cloudflare Pages Function - 管理员API配置
 * 路径: /api/admin/api-configs
 */

import { createClient } from '@supabase/supabase-js'

export async function onRequest(context) {
  const { request, env } = context
  
  try {
    if (request.method === 'GET') {
      console.log('⚙️ 获取API配置列表')
      
      // 创建Supabase客户端
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Supabase环境变量未配置')
        return new Response(JSON.stringify({
          success: false,
          error: 'Database not configured',
          configs: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const supabase = createClient(supabaseUrl, serviceRoleKey)

      try {
        // 查询API配置
        const { data: configs, error } = await supabase
          .from('api_configs')
          .select('*')
          .order('priority', { ascending: true })

        if (error) {
          console.error('❌ 查询API配置失败:', error)
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch configs',
            configs: []
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // 隐藏敏感信息（API密钥）
        const safeConfigs = (configs || []).map(config => ({
          ...config,
          api_key: config.api_key ? config.api_key.substring(0, 8) + '***************' : null
        }))

        console.log(`✅ 成功获取 ${safeConfigs.length} 个API配置`)

        return new Response(JSON.stringify({
          success: true,
          configs: safeConfigs
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      } catch (dbError) {
        console.error("❌ 数据库查询失败:", dbError)
        return new Response(JSON.stringify({
          success: false,
          error: 'Database query failed',
          configs: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    if (request.method === 'POST') {
      const body = await request.json()
      console.log('➕ 创建新API配置:', body.name)
      
      // 创建Supabase客户端
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !serviceRoleKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Database not configured'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const supabase = createClient(supabaseUrl, serviceRoleKey)

      try {
        // 插入新的API配置
        const { data, error } = await supabase
          .from('api_configs')
          .insert([{
            name: body.name,
            endpoint: body.endpoint,
            api_key: body.api_key,
            model: body.model,
            is_active: body.is_active || true,
            priority: body.priority || 1,
            timeout_seconds: body.timeout_seconds || 60,
            rate_limit_per_minute: body.rate_limit_per_minute || 10,
            config_data: body.config_data || {}
          }])
          .select()
          .single()

        if (error) {
          console.error('❌ 创建API配置失败:', error)
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to create config',
            message: error.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        console.log('✅ API配置创建成功:', data.id)

        return new Response(JSON.stringify({
          success: true,
          message: '配置创建成功',
          id: data.id
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        })

      } catch (dbError) {
        console.error("❌ 数据库插入失败:", dbError)
        return new Response(JSON.stringify({
          success: false,
          error: 'Database insert failed',
          message: dbError.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ API配置操作失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to handle API configs',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}