// 调试评论API的脚本
async function debugCommentsAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 开始调试评论API...')
  
  try {
    // 1. 获取图片列表
    console.log('\n1️⃣ 获取图片列表...')
    const galleryResponse = await fetch(`${baseUrl}/api/gallery/public?limit=5`)
    
    if (!galleryResponse.ok) {
      const errorText = await galleryResponse.text()
      console.log('❌ 图片列表错误:', galleryResponse.status, errorText)
      return
    }
    
    const galleryData = await galleryResponse.json()
    console.log('✅ 图片列表成功:', galleryData.success ? `${galleryData.data.length} 张图片` : '无数据')
    
    if (galleryData.success && galleryData.data.length > 0) {
      const firstImage = galleryData.data[0]
      console.log('📸 第一张图片:', {
        id: firstImage.id,
        style: firstImage.style
      })
      
      // 2. 获取评论
      console.log('\n2️⃣ 获取评论...')
      const commentsResponse = await fetch(`${baseUrl}/api/gallery/${firstImage.id}/comments`)
      
      if (!commentsResponse.ok) {
        const errorText = await commentsResponse.text()
        console.log('❌ 评论API错误:', commentsResponse.status)
        console.log('错误内容:', errorText)
        return
      }
      
      const commentsData = await commentsResponse.json()
      console.log('✅ 评论获取成功:', {
        success: commentsData.success,
        count: commentsData.data ? commentsData.data.length : 0
      })
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message)
  }
}

debugCommentsAPI() 