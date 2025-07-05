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
    
    // 模拟用户数据
    const mockUsers = [
      {
        id: '1',
        full_name: '张三',
        email: 'zhangsan@example.com',
        avatar_url: 'https://images.aimagica.ai/avatars/user1.jpg',
        created_at: '2024-01-15T10:30:00Z',
        subscription_tier: 'premium',
        subscription_status: 'active',
        image_count: 45
      },
      {
        id: '2', 
        full_name: '李四',
        email: 'lisi@example.com',
        avatar_url: 'https://images.aimagica.ai/avatars/user2.jpg',
        created_at: '2024-01-20T14:22:00Z',
        subscription_tier: 'free',
        subscription_status: 'active',
        image_count: 12
      },
      {
        id: '3',
        full_name: '王五',
        email: 'wangwu@example.com', 
        created_at: '2024-02-01T09:15:00Z',
        subscription_tier: 'premium',
        subscription_status: 'active',
        image_count: 78
      }
    ]

    return new Response(JSON.stringify({
      success: true,
      users: mockUsers
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ 获取用户列表失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}