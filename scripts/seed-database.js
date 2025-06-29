const { createClient } = require('@supabase/supabase-js')

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  try {
    console.log('🌱 开始填充数据库...')

    // 1. 清理现有数据（可选）
    console.log('🧹 清理现有数据...')
    await supabase.from('image_likes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('generated_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('user_subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. 创建示例用户
    console.log('👥 创建示例用户...')
    const users = [
      {
        email: 'sarah.chen@example.com',
        full_name: 'Sarah Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30天前
      },
      {
        email: 'mike.johnson@example.com',
        full_name: 'Mike Johnson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25天前
      },
      {
        email: 'emma.wilson@example.com',
        full_name: 'Emma Wilson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20天前
      },
      {
        email: 'alex.zhang@example.com',
        full_name: 'Alex Zhang',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15天前
      },
      {
        email: 'lisa.park@example.com',
        full_name: 'Lisa Park',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10天前
      },
      {
        email: 'john.doe@example.com',
        full_name: 'John Doe',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
      }
    ]

    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select()

    if (usersError) {
      console.error('❌ 创建用户失败:', usersError)
      return
    }

    console.log(`✅ 成功创建 ${insertedUsers.length} 个用户`)

    // 3. 创建订阅记录
    console.log('💳 创建订阅记录...')
    const subscriptions = insertedUsers.map((user, index) => {
      const tiers = ['free', 'pro', 'wizard']
      const statuses = ['active', 'active', 'inactive']
      return {
        user_id: user.id,
        subscription_tier: tiers[index % 3],
        subscription_status: statuses[index % 3],
        created_at: user.created_at
      }
    })

    const { error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .insert(subscriptions)

    if (subscriptionsError) {
      console.error('❌ 创建订阅失败:', subscriptionsError)
      // 不返回，继续创建其他数据
    } else {
      console.log(`✅ 成功创建 ${subscriptions.length} 个订阅记录`)
    }

    // 4. 创建示例图片
    console.log('🎨 创建示例图片...')
    const imageStyles = ['Fantasy', 'Cyberpunk', 'Anime', 'Sci-Fi', 'Watercolor', 'Oil Painting']
    const imageStatuses = ['approved', 'approved', 'pending', 'approved', 'rejected']
    const prompts = [
      'A magical forest with glowing trees and fairy lights',
      'A futuristic cyberpunk city with neon lights',
      'A powerful dragon soaring through the clouds',
      'An epic space adventure with distant planets',
      'A peaceful ocean scene with gentle waves',
      'A majestic mountain landscape at sunset',
      'A robotic warrior in battle armor',
      'A beautiful princess castle on a hill',
      'An alien planet with strange creatures',
      'A sunset beach with palm trees'
    ]

    const images = []
    for (let i = 0; i < 30; i++) {
      const user = insertedUsers[i % insertedUsers.length]
      images.push({
        user_id: user.id,
        prompt: prompts[i % prompts.length] + ` (variation ${i + 1})`,
        style: imageStyles[i % imageStyles.length],
        status: imageStatuses[i % imageStatuses.length],
        image_url: `https://picsum.photos/512/512?random=${i + 1}`,
        view_count: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    const { data: insertedImages, error: imagesError } = await supabase
      .from('generated_images')
      .insert(images)
      .select()

    if (imagesError) {
      console.error('❌ 创建图片失败:', imagesError)
      return
    }

    console.log(`✅ 成功创建 ${insertedImages.length} 张图片`)

    // 5. 创建点赞记录
    console.log('❤️ 创建点赞记录...')
    const likes = []
    for (let i = 0; i < 100; i++) {
      const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)]
      const image = insertedImages[Math.floor(Math.random() * insertedImages.length)]
      
      // 避免重复点赞
      const existingLike = likes.find(like => 
        like.user_id === user.id && like.image_id === image.id
      )
      
      if (!existingLike) {
        likes.push({
          user_id: user.id,
          image_id: image.id,
          created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    const { error: likesError } = await supabase
      .from('image_likes')
      .insert(likes)

    if (likesError) {
      console.error('❌ 创建点赞失败:', likesError)
      return
    }

    console.log(`✅ 成功创建 ${likes.length} 个点赞记录`)

    // 6. 创建用户统计记录
    console.log('📊 创建用户统计记录...')
    const userStats = insertedUsers.map(user => ({
      user_id: user.id,
      total_images: Math.floor(Math.random() * 50) + 5,
      total_views: Math.floor(Math.random() * 5000) + 500,
      total_likes: Math.floor(Math.random() * 200) + 20,
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }))

    const { error: statsError } = await supabase
      .from('user_stats')
      .insert(userStats)

    if (statsError) {
      console.error('❌ 创建统计记录失败:', statsError)
      return
    }

    console.log(`✅ 成功创建 ${userStats.length} 个统计记录`)

    console.log('🎉 数据库填充完成！')
    console.log('\n📊 填充统计:')
    console.log(`- 用户: ${insertedUsers.length}`)
    console.log(`- 订阅: ${subscriptions.length}`)
    console.log(`- 图片: ${insertedImages.length}`)
    console.log(`- 点赞: ${likes.length}`)
    console.log(`- 统计记录: ${userStats.length}`)

  } catch (error) {
    console.error('❌ 填充数据库失败:', error)
  }
}

// 运行脚本
seedDatabase() 