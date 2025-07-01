import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadToR2, generateFileName } from "@/lib/storage/r2"

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { imageData, filename = 'img2img_input.png' } = body

    if (!imageData) {
      return NextResponse.json({ 
        error: 'Missing required field: imageData' 
      }, { status: 400 })
    }

    console.log(`📤 Uploading base64 image for img2img for user ${session.user.email}`)

    // 解析base64图片数据
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    // 检测图片类型
    const mimeMatch = imageData.match(/^data:image\/([a-z]+);base64,/)
    const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/png'
    const extension = mimeMatch ? mimeMatch[1] : 'png'
    
    // 生成R2文件名
    const userId = session.user.id || session.user.email.replace(/[@.]/g, '_')
    const timestamp = new Date().getTime()
    const fileName = `img2img_inputs/${userId}/${timestamp}_input.${extension}`

    console.log(`📁 Uploading base64 image to R2: ${fileName}`)

    // 上传到R2
    const uploadResult = await uploadToR2(imageBuffer, fileName, mimeType)

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload image to R2')
    }

    console.log(`✅ Base64 image uploaded successfully: ${uploadResult.url}`)

    return NextResponse.json({ 
      success: true,
      data: {
        url: uploadResult.url,
        r2Key: fileName,
        size: imageBuffer.length,
        contentType: mimeType
      },
      message: 'Base64 image uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading base64 image:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 