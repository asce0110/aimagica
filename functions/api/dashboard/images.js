/**
 * Cloudflare Pages Function - Dashboard图片列表
 * 路径: /api/dashboard/images
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
    console.log('🖼️ 获取图片列表')
    
    // 检查环境变量
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not configured',
        images: []
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

      // 查询生成的图片，获取基本信息
      const imagesResponse = await fetch(`${supabaseUrl}/rest/v1/generated_images?select=id,prompt,image_url,style,status,view_count,created_at,user_id&order=created_at.desc&limit=20`, {
        headers: headers
      })

      if (!imagesResponse.ok) {
        console.error('❌ 查询图片失败:', imagesResponse.status)
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch images',
          images: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const images = await imagesResponse.json()

      // 为每个图片获取用户信息和点赞统计
      const imagesWithStats = await Promise.all(
        (images || []).map(async (image) => {
          try {
            // 获取用户信息
            let user = null
            try {
              const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=full_name,email&id=eq.${image.user_id}&limit=1`, {
                headers: headers
              })
              if (userResponse.ok) {
                const users = await userResponse.json()
                user = users[0] || null
              }
            } catch (error) {
              console.error('获取用户信息失败:', error)
            }

            // 获取点赞数
            let likeCount = 0
            try {
              const likesResponse = await fetch(`${supabaseUrl}/rest/v1/image_likes?select=count&image_id=eq.${image.id}`, {
                headers: { ...headers, 'Prefer': 'count=exact' }
              })
              if (likesResponse.ok) {
                const countHeader = likesResponse.headers.get('content-range')
                if (countHeader) {
                  likeCount = parseInt(countHeader.split('/')[1]) || 0
                }
              }
            } catch (error) {
              console.error('获取点赞数失败:', error)
            }

            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: user?.full_name || user?.email || 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: likeCount || 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          } catch (error) {
            console.error(`❌ 获取图片 ${image.id} 统计失败:`, error)
            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          }
        })
      )

      console.log(`✅ 成功获取 ${imagesWithStats.length} 张图片`)

      return new Response(JSON.stringify({
        success: true,
        images: imagesWithStats,
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
        images: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ 获取图片列表失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch images',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}