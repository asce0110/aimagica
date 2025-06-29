import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadToR2, generateFileName } from "@/lib/storage/r2"

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, prompt } = body

    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Missing required field: imageUrl' 
      }, { status: 400 })
    }

    console.log(`📥 Downloading and uploading image for user ${session.user.email}`)
    console.log(`🔗 Original URL: ${imageUrl}`)

    // 下载图片
    const downloadResponse = await fetch(imageUrl)
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download image: ${downloadResponse.statusText}`)
    }

    // 获取图片数据
    const imageBuffer = Buffer.from(await downloadResponse.arrayBuffer())
    const contentType = downloadResponse.headers.get('content-type') || 'image/png'
    
    // 生成文件扩展名
    const extension = contentType.split('/')[1] || 'png'
    
    // 生成R2文件名
    const userId = session.user.id || session.user.email.replace(/[@.]/g, '_')
    const timestamp = new Date().getTime()
    const promptSlug = prompt ? prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_') : 'generated'
    const fileName = `gallery/${userId}/${timestamp}_${promptSlug}.${extension}`

    console.log(`📁 Uploading to R2 with filename: ${fileName}`)

    // 上传到R2
    const uploadResult = await uploadToR2(imageBuffer, fileName, contentType)

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload to R2')
    }

    console.log(`✅ Image uploaded successfully to R2: ${uploadResult.url}`)

    return NextResponse.json({ 
      success: true,
      data: {
        originalUrl: imageUrl,
        r2Url: uploadResult.url,
        r2Key: fileName,
        contentType,
        size: imageBuffer.length
      },
      message: 'Image uploaded to R2 successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading image to R2:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 