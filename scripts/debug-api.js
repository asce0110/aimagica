// 调试Gallery API的脚本
async function debugAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 开始调试Gallery API...')
  
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
        style: firstImage.style,
        has_user_id: !!firstImage.user_id
      })
      
      // 2. 获取图片详情
      console.log('\n2️⃣ 获取图片详情...')
      const detailResponse = await fetch(`${baseUrl}/api/gallery/${firstImage.id}`)
      
      if (!detailResponse.ok) {
        const errorText = await detailResponse.text()
        console.log('❌ 图片详情错误:', detailResponse.status)
        console.log('错误内容:', errorText)
        return
      }
      
      const detailData = await detailResponse.json()
      console.log('✅ 图片详情成功:', {
        title: detailData.title,
        likes: detailData.likes,
        views: detailData.views
      })
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message)
  }
}

debugAPI() 