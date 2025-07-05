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
    
    // 模拟图片数据
    const mockImages = [
      {
        id: '1',
        title: 'AI生成的魔法森林',
        user_name: '张三',
        created_at: '2024-01-25T16:45:00Z',
        views: 1234,
        likes: 89,
        is_public: true,
        image_url: 'https://images.aimagica.ai/gallery/magic-forest.jpg'
      },
      {
        id: '2',
        title: '赛博朋克城市夜景',
        user_name: '李四',
        created_at: '2024-01-24T12:30:00Z',
        views: 567,
        likes: 34,
        is_public: true,
        image_url: 'https://images.aimagica.ai/gallery/cyberpunk-city.jpg'
      },
      {
        id: '3',
        title: '梦幻独角兽',
        user_name: '王五',
        created_at: '2024-01-23T09:15:00Z',
        views: 890,
        likes: 67,
        is_public: false,
        image_url: 'https://images.aimagica.ai/gallery/unicorn-dream.jpg'
      }
    ]

    return new Response(JSON.stringify({
      success: true,
      images: mockImages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

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