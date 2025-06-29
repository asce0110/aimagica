// 通过API检查表是否存在的脚本
async function checkTablesViaAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 通过API检查数据库表...')
  
  try {
    // 1. 检查generated_images表（通过gallery API）
    console.log('\n1️⃣ 检查generated_images表...')
    const galleryResponse = await fetch(`${baseUrl}/api/gallery/public?limit=1`)
    
    if (galleryResponse.ok) {
      const galleryData = await galleryResponse.json()
      console.log('✅ generated_images表正常:', galleryData.success ? '可访问' : '有问题')
    } else {
      console.log('❌ generated_images表有问题:', galleryResponse.status)
    }
    
    // 2. 检查image_comments表（通过comments API）
    console.log('\n2️⃣ 检查image_comments表...')
    
    // 先获取一个图片ID
    if (galleryResponse.ok) {
      const galleryData2 = await fetch(`${baseUrl}/api/gallery/public?limit=1`)
      const galleryData = await galleryData2.json()
      if (galleryData.success && galleryData.data.length > 0) {
        const imageId = galleryData.data[0].id
        console.log('使用图片ID:', imageId)
        
        const commentsResponse = await fetch(`${baseUrl}/api/gallery/${imageId}/comments`)
        
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          console.log('✅ image_comments表正常:', commentsData.success ? '可访问' : '有问题')
        } else {
          const errorText = await commentsResponse.text()
          console.log('❌ image_comments表有问题:', commentsResponse.status)
          console.log('错误详情:', errorText)
          
          // 如果是500错误，很可能是表不存在
          if (commentsResponse.status === 500) {
            console.log('\n💡 建议：image_comments表可能不存在，需要执行数据库迁移')
            console.log('请运行: node scripts/execute-database-migration.js')
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message)
  }
}

checkTablesViaAPI() 