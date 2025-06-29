const { upsertUser, getUserByEmail } = require('../lib/database/users')
const { createLoginLog } = require('../lib/database/auth-logs')
const { isAdmin } = require('../lib/database/admin')
require('dotenv').config({ path: '.env.local' })

async function testNextAuthFlow() {
  console.log('🧪 测试NextAuth登录流程...\n')
  
  // 测试用户信息
  const testUser = {
    email: 'test.nextauth@example.com',
    name: 'NextAuth Test User',
    image: 'https://via.placeholder.com/150'
  }
  
  console.log('1️⃣ 测试用户同步 (upsertUser)...')
  try {
    const syncedUser = await upsertUser({
      email: testUser.email,
      full_name: testUser.name,
      avatar_url: testUser.image,
      google_id: 'test_google_id_123'
    })
    
    if (syncedUser) {
      console.log('✅ 用户同步成功!')
      console.log('   用户ID:', syncedUser.id)
      console.log('   邮箱:', syncedUser.email)
      console.log('   姓名:', syncedUser.full_name)
      
      console.log('\n2️⃣ 测试管理员权限检查...')
      const isAdminUser = await isAdmin(syncedUser.email)
      console.log('   管理员权限:', isAdminUser ? '是' : '否')
      
      console.log('\n3️⃣ 测试登录日志记录...')
      const loginLogData = {
        user_id: syncedUser.id,
        email: syncedUser.email,
        login_method: 'google',
        success: true,
        is_admin_login: isAdminUser
      }
      
      console.log('   即将记录的数据:', loginLogData)
      
      const loginLogResult = await createLoginLog(loginLogData)
      
      if (loginLogResult) {
        console.log('✅ 登录日志记录成功!')
        console.log('   日志ID:', loginLogResult.id)
        console.log('   记录邮箱:', loginLogResult.email)
        console.log('   登录时间:', loginLogResult.login_time)
      } else {
        console.error('❌ 登录日志记录失败')
      }
      
    } else {
      console.error('❌ 用户同步失败')
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
  
  console.log('\n4️⃣ 检查现有真实用户...')
  try {
    // 测试现有用户
    const existingUserEmail = 'sakami55@gmail.com'
    const existingUser = await getUserByEmail(existingUserEmail)
    
    if (existingUser) {
      console.log('✅ 找到现有用户:', existingUser.email)
      console.log('   用户ID:', existingUser.id)
      
      // 为现有用户创建测试登录日志
      console.log('\n5️⃣ 为现有用户创建测试登录日志...')
      const existingUserLog = await createLoginLog({
        user_id: existingUser.id,
        email: existingUser.email,
        login_method: 'google',
        success: true,
        is_admin_login: await isAdmin(existingUser.email)
      })
      
      if (existingUserLog) {
        console.log('✅ 现有用户登录日志创建成功!')
        console.log('   日志ID:', existingUserLog.id)
      } else {
        console.error('❌ 现有用户登录日志创建失败')
      }
      
    } else {
      console.error('❌ 未找到现有用户:', existingUserEmail)
    }
    
  } catch (error) {
    console.error('❌ 测试现有用户时发生错误:', error)
  }
}

testNextAuthFlow().catch(console.error) 