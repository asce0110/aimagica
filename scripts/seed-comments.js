const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ 环境变量未找到，跳过自动种子数据')
  console.log('📝 请手动在Supabase Dashboard中执行种子数据插入')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sampleComments = [
  "This is absolutely stunning! The colors are so vibrant! 🎨",
  "Amazing work! The detail in this piece is incredible.",
  "I love the magical atmosphere! This could be a great inspiration for my own work 💫",
  "The composition is perfect! Every element tells a story ✨",
  "Wow, this looks so realistic! How did you achieve this effect?",
  "Beautiful use of lighting and shadows! 🌟",
  "This gives me such peaceful vibes. Love it! 💕",
  "The creativity here is mind-blowing! Keep up the great work!",
  "This would make an amazing wallpaper! 🖼️",
  "The attention to detail is incredible. Pure art! 🎭"
]

async function seedComments() {
  try {
    console.log('🌱 开始添加示例评论...')
    
    // 获取一些公共图片
    const { data: images, error: imagesError } = await supabase
      .from('generated_images')
      .select('id')
      .eq('is_public', true)
      .eq('status', 'completed')
      .limit(10)

    if (imagesError || !images || images.length === 0) {
      console.log('❌ 没有找到公共图片')
      return
    }

    console.log(`✅ 找到 ${images.length} 张公共图片`)

    // 获取管理员用户ID
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'asce3801@gmail.com')
      .single()

    if (adminError || !adminUser) {
      console.log('❌ 没有找到管理员用户，请先创建用户账户')
      return
    }

    console.log('✅ 找到管理员用户:', adminUser.id)

    // 为每张图片添加1-3条评论
    const commentsToInsert = []
    
    for (const image of images) {
      const commentCount = Math.floor(Math.random() * 3) + 1 // 1-3条评论
      
      for (let i = 0; i < commentCount; i++) {
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]
        const randomDaysAgo = Math.floor(Math.random() * 7) + 1 // 1-7天前
        const createdAt = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString()
        
        commentsToInsert.push({
          user_id: adminUser.id,
          image_id: image.id,
          content: randomComment,
          created_at: createdAt
        })
      }
    }

    // 插入评论
    const { data: insertedComments, error: insertError } = await supabase
      .from('image_comments')
      .insert(commentsToInsert)
      .select('id')

    if (insertError) {
      console.error('❌ 插入评论失败:', insertError)
      return
    }

    console.log(`✅ 成功添加 ${insertedComments.length} 条示例评论`)

    // 为一些评论添加点赞
    console.log('❤️ 添加一些评论点赞...')
    
    const likesToInsert = []
    for (const comment of insertedComments.slice(0, Math.floor(insertedComments.length / 2))) {
      likesToInsert.push({
        user_id: adminUser.id,
        comment_id: comment.id
      })
    }

    if (likesToInsert.length > 0) {
      const { error: likesError } = await supabase
        .from('comment_likes')
        .insert(likesToInsert)

      if (likesError) {
        console.error('❌ 添加评论点赞失败:', likesError)
      } else {
        console.log(`✅ 成功添加 ${likesToInsert.length} 个评论点赞`)
      }
    }

    console.log('🎉 示例评论数据添加完成!')

  } catch (error) {
    console.error('❌ 添加示例评论失败:', error)
  }
}

seedComments()