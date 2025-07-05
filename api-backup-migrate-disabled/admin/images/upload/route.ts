import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadToR2, validateImageFile } from "@/lib/storage/r2"
import { createGeneratedImage } from "@/lib/database/images"
import { isAdmin } from "@/lib/database/admin"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  console.log('🚀 Admin image upload API called')
  
  try {
    // 验证管理员登录
    console.log('🔐 Getting session...')
    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session?.user?.email || 'No session')
    
    if (!session?.user?.email) {
      console.log('❌ Not authenticated')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 验证管理员权限
    console.log('👑 Checking admin permissions...')
    const isAdminUser = await isAdmin(session.user.email)
    console.log('🔍 Is admin:', isAdminUser)
    
    if (!isAdminUser) {
      console.log('❌ Not authorized')
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // 解析表单数据
    console.log('📋 Parsing form data...')
    const formData = await request.formData()
    console.log('📋 Form data keys:', Array.from(formData.keys()))
    
    const file = formData.get('file') as File
    const title = formData.get('title') as string || 'Admin Upload'
    const prompt = formData.get('prompt') as string || 'Admin uploaded image'
    const style = formData.get('style') as string || 'Admin'
    const isPublic = formData.get('isPublic') === 'true'

    console.log('📊 Upload parameters:', { title, prompt, style, isPublic })

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ 
        error: 'No file provided' 
      }, { status: 400 })
    }

    console.log(`📤 Admin uploading image: ${file.name} (${file.size} bytes, ${file.type})`)

    // 验证文件
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 })
    }

    // 准备文件数据
    const buffer = Buffer.from(await file.arrayBuffer())
    const extension = file.name.split('.').pop() || 'png'
    
    // 生成R2文件名
    const adminId = session.user.id || session.user.email.replace(/[@.]/g, '_')
    const timestamp = new Date().getTime()
    const titleSlug = title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `admin_uploads/${adminId}/${timestamp}_${titleSlug}.${extension}`
    
    // 获取管理员用户ID
    const supabase = await createClient()
    
    console.log(`🔍 Looking for user with email: ${session.user.email}`)
    
    // 方案1: 尝试查找现有用户
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .single()
    
    console.log(`🔍 User lookup result:`, { existingUser, userError })
    
    let userId: string
    
    if (existingUser) {
      // 用户已存在，使用现有ID
      userId = existingUser.id
      console.log(`👤 Found existing admin user: ${userId}`)
    } else {
      // 方案2: 查找任意一个现有用户作为临时方案
      console.log(`⚠️ Admin user not found, looking for any existing user...`)
      const { data: anyUser, error: anyUserError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1)
        .single()
      
      console.log(`🔍 Any user lookup result:`, { anyUser, anyUserError })
      
      if (anyUser) {
        userId = anyUser.id
        console.log(`👤 Using existing user ID as fallback: ${userId}`)
        console.log(`⚠️ This is a temporary solution for admin: ${session.user.email}`)
      } else {
        // 方案3: 如果完全没有用户，创建一个基础用户记录
        console.log(`👤 No users found, attempting to create admin user...`)
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: '00000000-0000-0000-0000-000000000001',
            email: session.user.email
          })
          .select('id')
          .single()
        
        if (newUser && !createError) {
          userId = newUser.id
          console.log(`✅ Created admin user: ${userId}`)
        } else {
          console.error('❌ Failed to create user:', createError)
          console.log(`🔧 Using known admin UUID as final fallback`)
          // 使用我们知道存在的管理员UUID
          userId = 'cb3f3db6-fbce-4d13-8a6d-b202b9a98c12'
        }
      }
    }

    console.log(`📁 Uploading to R2 with filename: ${fileName}`)

    // 上传到R2
    const uploadResult = await uploadToR2(buffer, fileName, file.type)

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload to R2')
    }

    console.log(`✅ Image uploaded to R2: ${uploadResult.url}`)

    // 保存到数据库
    console.log('💾 Saving image to database...')
    console.log('📋 Database save data:', {
      user_id: userId,
      generated_image_url: uploadResult.url,
      prompt: prompt,
      style: style,
      is_public: isPublic,
      r2_key: fileName,
      original_url: uploadResult.url
    })
    
    const savedImage = await createGeneratedImage({
      user_id: userId,
      generated_image_url: uploadResult.url!,
      prompt: prompt,
      style: style,
      is_public: isPublic,
      r2_key: fileName,
      original_url: uploadResult.url! // 对于管理员上传，R2 URL就是原始URL
    })

    console.log('💾 Database save result:', savedImage)

    if (!savedImage) {
      console.error('❌ Database save returned null')
      throw new Error('Failed to save image to database')
    }

    console.log(`✅ Image saved to database with ID: ${savedImage.id}`)

    return NextResponse.json({ 
      success: true,
      data: {
        id: savedImage.id,
        title: title,
        imageUrl: uploadResult.url,
        r2Key: fileName,
        isPublic: isPublic,
        createdAt: savedImage.created_at
      },
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading admin image:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 