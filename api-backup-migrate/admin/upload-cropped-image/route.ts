import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadToR2 } from "@/lib/storage/r2"
import { isAdmin } from "@/lib/database/admin"

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 验证管理员权限
    const adminStatus = await isAdmin(session.user.email)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { imageData, styleName } = body

    if (!imageData) {
      return NextResponse.json({ 
        error: 'Missing required field: imageData' 
      }, { status: 400 })
    }

    console.log(`📸 Uploading cropped image for style: ${styleName}`)

    // 解析base64图片数据
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    // 生成R2文件名
    const timestamp = new Date().getTime()
    const styleSlug = styleName ? styleName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') : 'style'
    const fileName = `styles/${styleSlug}_${timestamp}.png`

    console.log(`📁 Uploading cropped image to R2: ${fileName}`)

    // 上传到R2
    const uploadResult = await uploadToR2(imageBuffer, fileName, 'image/png')

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload cropped image to R2')
    }

    console.log(`✅ Cropped image uploaded successfully: ${uploadResult.url}`)

    return NextResponse.json({ 
      success: true,
      data: {
        r2Url: uploadResult.url,
        r2Key: fileName,
        size: imageBuffer.length
      },
      message: 'Cropped image uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Error uploading cropped image:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 