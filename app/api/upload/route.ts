import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadToR2, generateFileName, validateImageFile } from '@/lib/storage/r2'

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string || 'image' // image, avatar, style等

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 验证文件
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 生成文件名
    const fileName = generateFileName(file.name, uploadType)
    
    // 转换为Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 上传到R2
    const result = await uploadToR2(buffer, fileName, file.type)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' }, 
        { status: 500 }
      )
    }

    console.log(`✅ File uploaded successfully: ${fileName}`)

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        url: result.url,
        size: file.size,
        type: file.type,
        uploadedBy: session.user.email,
        uploadedAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('❌ Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// 删除文件
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 })
    }

    // 这里可以添加权限检查，确保用户只能删除自己的文件
    // 暂时先允许所有登录用户删除

    const { deleteFromR2 } = await import('@/lib/storage/r2')
    const result = await deleteFromR2(fileName)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Delete failed' }, 
        { status: 500 }
      )
    }

    console.log(`✅ File deleted successfully: ${fileName}`)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 