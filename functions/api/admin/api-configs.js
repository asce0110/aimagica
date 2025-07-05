/**
 * Cloudflare Pages Function - 管理员API配置
 * 路径: /api/admin/api-configs
 */

export async function onRequest(context) {
  const { request, env } = context
  
  try {
    if (request.method === 'GET') {
      console.log('⚙️ 获取API配置列表')
      
      // 模拟API配置数据
      const mockConfigs = [
        {
          id: '1',
          name: 'DALLE-3 API',
          endpoint: 'https://api.openai.com/v1/images/generations',
          api_key: 'sk-***************',
          model: 'dall-e-3',
          is_active: true,
          priority: 1,
          timeout_seconds: 60,
          rate_limit_per_minute: 10,
          config_data: {
            size: '1024x1024',
            quality: 'standard'
          }
        },
        {
          id: '2',
          name: 'Midjourney API',
          endpoint: 'https://api.midjourney.com/v1/imagine',
          api_key: 'mj_***************',
          model: 'midjourney-v6',
          is_active: true,
          priority: 2,
          timeout_seconds: 120,
          rate_limit_per_minute: 5,
          config_data: {
            aspect: '16:9',
            style: 'photographic'
          }
        }
      ]

      return new Response(JSON.stringify({
        success: true,
        configs: mockConfigs
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (request.method === 'POST') {
      const body = await request.json()
      console.log('➕ 创建新API配置:', body.name)
      
      return new Response(JSON.stringify({
        success: true,
        message: '配置创建成功',
        id: Date.now().toString()
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
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