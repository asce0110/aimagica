// 测试Gallery API的脚本
async function testGalleryAPI() {
  const baseUrl = 'http://localhost:3000' // 根据实际端口调整
  
  console.log('🧪 开始测试Gallery API...')
  
  try {
    // 1. 测试获取公共图片列表
    console.log('\n1️⃣ 测试获取公共图片列表...')
    const galleryResponse = await fetch(`${baseUrl}/api/gallery/public?limit=5`)
    
    if (!galleryResponse.ok) {
      console.log('❌ 获取图片列表失败:', galleryResponse.status, galleryResponse.statusText)
      return
    }
    
    const galleryData = await galleryResponse.json()
    console.log('✅ 图片列表获取成功:', galleryData.success ? `${galleryData.data.length} 张图片` : '无数据')
    
    if (galleryData.success && galleryData.data.length > 0) {
      const firstImage = galleryData.data[0]
      console.log('📸 第一张图片信息:', {
        id: firstImage.id,
        style: firstImage.style,
        likes: firstImage.likes_count
      })
      
      // 2. 测试获取图片详情
      console.log('\n2️⃣ 测试获取图片详情...')
      const detailResponse = await fetch(`${baseUrl}/api/gallery/${firstImage.id}`)
      
      if (!detailResponse.ok) {
        console.log('❌ 获取图片详情失败:', detailResponse.status, detailResponse.statusText)
        return
      }
      
      const detailData = await detailResponse.json()
      console.log('✅ 图片详情获取成功:', {
        title: detailData.title,
        likes: detailData.likes,
        views: detailData.views,
        comments: detailData.comments,
        tags: detailData.tags?.slice(0, 3) // 只显示前3个标签
      })
      
      // 3. 测试获取评论
      console.log('\n3️⃣ 测试获取评论...')
      const commentsResponse = await fetch(`${baseUrl}/api/gallery/${firstImage.id}/comments`)
      
      if (!commentsResponse.ok) {
        console.log('❌ 获取评论失败:', commentsResponse.status, commentsResponse.statusText)
        return
      }
      
      const commentsData = await commentsResponse.json()
      console.log('✅ 评论获取成功:', commentsData.success ? `${commentsData.data.length} 条评论` : '无评论')
      
      if (commentsData.success && commentsData.data.length > 0) {
        console.log('💬 第一条评论:', {
          author: commentsData.data[0].author,
          content: commentsData.data[0].content.substring(0, 50) + '...',
          likes: commentsData.data[0].likes
        })
      }
    }
    
    console.log('\n🎉 所有API测试完成!')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.log('\n💡 请确保:')
    console.log('1. 开发服务器正在运行 (pnpm dev)')
    console.log('2. 数据库连接正常')
    console.log('3. 环境变量配置正确')
  }
}

// 如果是直接运行此脚本
if (typeof window === 'undefined') {
  testGalleryAPI()
}

module.exports = { testGalleryAPI } 