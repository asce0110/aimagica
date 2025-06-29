// 直接测试评论表查询
async function testCommentsTable() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🔍 直接测试评论表查询...')
  
  try {
    // 创建一个简化的测试API端点
    const response = await fetch(`${baseUrl}/api/test-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: '0511fe1d-84ed-4fe2-b7c3-ac45ec825920'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 评论表测试成功:', data)
    } else {
      const errorText = await response.text()
      console.log('❌ 评论表测试失败:', response.status)
      console.log('错误内容:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

testCommentsTable() 