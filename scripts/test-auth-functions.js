// 测试NextAuth中使用的数据库函数
const { getUserByEmail, upsertUser } = require('../lib/database/users')
const { isAdmin } = require('../lib/database/admin')
const { createLoginLog } = require('../lib/database/auth-logs')
require('dotenv').config({ path: '.env.local' })

async function testAuthFunctions() {
  console.log('🧪 测试NextAuth相关的数据库函数...')
  
  const testEmail = 'asce3801@gmail.com'
  
  try {
    // 1. 测试 getUserByEmail
    console.log('\n1️⃣ 测试 getUserByEmail...')
    const user = await getUserByEmail(testEmail)
    console.log('✅ getUserByEmail成功:', user ? `找到用户 ${user.email}` : '未找到用户')
    
    // 2. 测试 isAdmin
    console.log('\n2️⃣ 测试 isAdmin...')
    const adminStatus = await isAdmin(testEmail)
    console.log('✅ isAdmin成功:', adminStatus ? '是管理员' : '不是管理员')
    
    // 3. 测试 upsertUser
    console.log('\n3️⃣ 测试 upsertUser...')
    const upsertResult = await upsertUser({
      email: testEmail,
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      google_id: 'test_google_id'
    })
    console.log('✅ upsertUser成功:', upsertResult ? `用户ID: ${upsertResult.id}` : '失败')
    
    // 4. 测试 createLoginLog（如果upsert成功）
    if (upsertResult) {
      console.log('\n4️⃣ 测试 createLoginLog...')
      const loginLog = await createLoginLog({
        user_id: upsertResult.id,
        email: testEmail,
        login_method: 'google',
        success: true,
        is_admin_login: adminStatus
      })
      console.log('✅ createLoginLog成功:', loginLog ? `日志ID: ${loginLog.id}` : '失败')
    }
    
    console.log('\n🎉 所有测试完成!')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.error('详细错误:', error)
  }
}

testAuthFunctions() 