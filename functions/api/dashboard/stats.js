/**
 * Cloudflare Pages Function - Dashboard统计数据
 * 路径: /api/dashboard/stats
 */

export async function onRequest(context) {
  const { request, env } = context
  
  // 允许GET请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('📊 获取Dashboard统计数据')
    
    // 模拟统计数据 - 在实际环境中应该连接数据库
    const mockStats = {
      totalUsers: 1250,
      activeUsers: 89,
      newUsers: 23,
      premiumUsers: 156,
      totalImages: 5678,
      imagesThisMonth: 234,
      revenue: 12450,
      revenueGrowth: 15.3,
      userImages: 45,
      userViews: 1230,
      userLikes: 89,
      userFollowers: 23
    }

    return new Response(JSON.stringify({
      success: true,
      stats: mockStats
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ 获取统计数据失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}