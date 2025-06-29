import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createGeneratedImage } from "@/lib/database/images"
import { createClient, createServiceRoleClient } from "@/lib/supabase-server"
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, prompt, isPublic, style, creationMode } = body

    if (!imageUrl || !prompt) {
      return NextResponse.json({ 
        error: 'Missing required fields: imageUrl, prompt' 
      }, { status: 400 })
    }

    console.log(`💾 Saving image for user ${session.user.email}:`, {
      imageUrl,
      prompt: prompt.substring(0, 50) + '...',
      isPublic,
      style,
      creationMode
    })

    // 如果style是风格ID，查找对应的风格名称
    let styleName = style || "Generated"
    if (style && style.length > 10 && style.includes('-')) {
      // 看起来像是UUID格式的风格ID，查找对应的风格名称
      console.log(`🎨 Looking up style name for ID: ${style}`)
      
      const serviceSupabase = await createServiceRoleClient()
      const { data: styleData, error: styleError } = await serviceSupabase
        .from('styles')
        .select('name')
        .eq('id', style)
        .eq('is_active', true)
        .single()
      
      if (styleData && !styleError) {
        styleName = styleData.name
        console.log(`✅ Found style name: ${styleName}`)
      } else {
        console.warn(`⚠️ Could not find style name for ID ${style}, using default`)
        styleName = "Generated"
      }
    }
    
    console.log(`🎨 Final style name to save: ${styleName}`)

    // 隐私保护提醒：确保我们保存的是生成结果，而不是用户的输入图片
    if (creationMode === 'img2img' || creationMode === 'img2video') {
      console.log(`🔒 Privacy protection: In ${creationMode} mode, only generated results are processed, not user input images`)
    }

    let finalImageUrl = imageUrl
    let r2Key: string | undefined = undefined

    // 如果需要公开展示，上传到R2
    // 注意：为保护用户隐私，在图生图和图生视频模式下，我们只上传生成结果，不上传用户输入的图片
    if (isPublic) {
      console.log(`📤 Uploading generated image to R2 for public gallery (mode: ${creationMode})...`)
      
      try {
        const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/images/upload-to-r2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '', // 传递session cookie
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
            prompt: prompt
          }),
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          if (uploadResult.success) {
            finalImageUrl = uploadResult.data.r2Url
            r2Key = uploadResult.data.r2Key
            console.log(`✅ Image uploaded to R2: ${finalImageUrl}`)
          } else {
            console.warn(`⚠️ R2 upload failed, using original URL: ${uploadResult.error}`)
          }
        } else {
          console.warn(`⚠️ R2 upload API failed, using original URL`)
        }
      } catch (error) {
        console.warn(`⚠️ R2 upload error, using original URL:`, error)
      }
    }

    // 获取或创建用户在数据库中的记录
    const supabase = await createClient()
    let userId: string
    
    // 首先尝试通过email查找用户 - 使用service role避免RLS问题
    const serviceSupabase = await createServiceRoleClient()
    const { data: existingUser, error: userFindError } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()
    
    if (existingUser) {
      userId = existingUser.id
      console.log(`✅ Found existing user: ${userId}`)
    } else {
      // 如果用户不存在，使用service role创建新用户记录
      console.log(`📝 Creating new user record for: ${session.user.email}`)
      
      try {
        // 生成一个基于email的一致UUID
        const emailHash = createHash('sha256').update(session.user.email).digest('hex')
        const consistentUserId = `${emailHash.substring(0, 8)}-${emailHash.substring(8, 12)}-${emailHash.substring(12, 16)}-${emailHash.substring(16, 20)}-${emailHash.substring(20, 32)}`
        
        // 直接使用service role插入用户，避免RLS问题
        const { data: newServiceUser, error: serviceUserError } = await serviceSupabase
          .from('users')
          .insert({
            id: consistentUserId,
            email: session.user.email,
            full_name: session.user.name || undefined,
            avatar_url: session.user.image || undefined
          })
          .select('id')
          .single()
        
        if (serviceUserError) {
          console.error('❌ Failed to create user with service role:', serviceUserError)
          return NextResponse.json({ 
            error: 'Failed to create user record',
            details: serviceUserError.message 
          }, { status: 500 })
        }
        
        userId = consistentUserId
        console.log(`✅ Created new user with service role: ${userId}`)
        
      } catch (serviceError) {
        console.error('❌ Service role user creation failed:', serviceError)
        return NextResponse.json({ 
          error: 'User creation failed',
          details: serviceError instanceof Error ? serviceError.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    console.log(`📋 Saving image with data:`, {
      user_id: userId,
      generated_image_url: finalImageUrl,
      prompt: prompt.substring(0, 100) + '...',
      style: styleName,
      is_public: isPublic || false,
      r2_key: r2Key
    })
    
    const savedImage = await createGeneratedImage({
      user_id: userId,
      generated_image_url: finalImageUrl,
      prompt: prompt,
      style: styleName,
      is_public: isPublic || false,
      r2_key: r2Key,
      original_url: imageUrl !== finalImageUrl ? imageUrl : undefined
    })

    if (!savedImage) {
      return NextResponse.json({ 
        error: 'Failed to save image to database' 
      }, { status: 500 })
    }

    console.log(`✅ Image saved successfully with ID: ${savedImage.id}`)

    return NextResponse.json({ 
      success: true,
      data: {
        id: savedImage.id,
        imageUrl: savedImage.generated_image_url,
        isPublic: savedImage.is_public,
        createdAt: savedImage.created_at
      },
      message: isPublic ? 'Image shared to gallery successfully!' : 'Image saved to your collection!'
    })

  } catch (error) {
    console.error('❌ Error saving image:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 