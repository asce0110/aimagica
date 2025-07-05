/**
 * Cloudflare Pages Function - 管理员风格管理
 * 路径: /api/admin/styles
 */

export async function onRequest(context) {
  const { request, env } = context
  
  try {
    if (request.method === 'GET') {
      console.log('🎨 获取风格列表')
      
      // 检查环境变量
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Supabase环境变量未配置')
        return new Response(JSON.stringify({
          success: false,
          error: 'Database not configured',
          styles: []
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

        // 获取所有风格数据（管理员视图）
        const stylesResponse = await fetch(`${supabaseUrl}/rest/v1/styles?select=*&order=sort_order.asc`, {
          headers: headers
        })

        if (!stylesResponse.ok) {
          console.error('❌ 查询风格失败:', stylesResponse.status)
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch styles',
            styles: []
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        const styles = await stylesResponse.json()

        console.log(`✅ 成功获取 ${styles?.length || 0} 个风格`)

        return new Response(JSON.stringify({
          success: true,
          styles: styles || []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })

      } catch (dbError) {
        console.error("❌ 数据库查询失败:", dbError)
        return new Response(JSON.stringify({
          success: false,
          error: 'Database query failed',
          styles: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ 风格操作失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to handle styles',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}