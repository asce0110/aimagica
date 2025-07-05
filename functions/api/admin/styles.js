/**
 * Cloudflare Pages Function - 管理员风格管理
 * 路径: /api/admin/styles
 */

export async function onRequest(context) {
  const { request, env } = context
  
  try {
    if (request.method === 'GET') {
      console.log('🎨 获取风格列表')
      
      // 模拟风格数据
      const mockStyles = [
        {
          id: '1',
          name: '动漫风格',
          description: '日式动漫插画风格',
          template: 'anime style, {prompt}, high quality, detailed',
          is_active: true,
          created_at: '2024-01-10T10:00:00Z',
          usage_count: 1250
        },
        {
          id: '2', 
          name: '写实风格',
          description: '超高写实度摄影风格',
          template: 'photorealistic, {prompt}, 8k, professional photography',
          is_active: true,
          created_at: '2024-01-12T14:30:00Z',
          usage_count: 890
        },
        {
          id: '3',
          name: '水彩风格', 
          description: '柔和的水彩画风格',
          template: 'watercolor painting, {prompt}, soft colors, artistic',
          is_active: true,
          created_at: '2024-01-15T09:15:00Z',
          usage_count: 567
        }
      ]

      return new Response(JSON.stringify({
        success: true,
        styles: mockStyles
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
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