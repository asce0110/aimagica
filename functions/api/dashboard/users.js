/**
 * Cloudflare Pages Function - Dashboard用户列表
 * 路径: /api/dashboard/users
 */

export async function onRequest(context) {
  const { request, env } = context
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('👥 获取用户列表')
    
    // 检查环境变量
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not configured',
        users: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      // 使用Supabase REST API直接查询
      const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }

      // 查询用户列表，包含基本信息
      const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,full_name,email,avatar_url,created_at&order=created_at.desc&limit=20`, {
        headers: headers
      })

      if (!usersResponse.ok) {
        console.error('❌ 查询用户失败:', usersResponse.status)
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Failed to fetch users',
          users: [] 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const users = await usersResponse.json()

      // 为每个用户获取订阅信息和图片统计
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          try {
            // 获取订阅信息
            let subscription = null
            try {
              const subResponse = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?select=subscription_tier,subscription_status&user_id=eq.${user.id}&limit=1`, {
                headers: headers
              })
              if (subResponse.ok) {
                const subs = await subResponse.json()
                subscription = subs[0] || null
              }
            } catch (error) {
              console.error('获取订阅失败:', error)
            }

            // 获取图片数量
            let imageCount = 0
            try {
              const imgResponse = await fetch(`${supabaseUrl}/rest/v1/generated_images?select=count&user_id=eq.${user.id}`, {
                headers: { ...headers, 'Prefer': 'count=exact' }
              })
              if (imgResponse.ok) {
                const countHeader = imgResponse.headers.get('content-range')
                if (countHeader) {
                  imageCount = parseInt(countHeader.split('/')[1]) || 0
                }
              }
            } catch (error) {
              console.error('获取图片数量失败:', error)
            }

            return {
              id: user.id,
              full_name: user.full_name || 'Anonymous User',
              email: user.email,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
              subscription_tier: subscription?.subscription_tier || 'free',
              subscription_status: subscription?.subscription_status || 'inactive',
              image_count: imageCount || 0
            }
          } catch (error) {
            console.error(`❌ 获取用户 ${user.id} 统计失败:`, error)
            return {
              id: user.id,
              full_name: user.full_name || 'Anonymous User',
              email: user.email,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
              subscription_tier: 'free',
              subscription_status: 'inactive',
              image_count: 0
            }
          }
        })
      )

      console.log(`✅ 成功获取 ${usersWithStats.length} 个用户`)

      return new Response(JSON.stringify({
        success: true,
        users: usersWithStats,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database query failed',
        users: [] 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
  } catch (error) {
    console.error("❌ 获取用户列表失败:", error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch users',
      users: []
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}