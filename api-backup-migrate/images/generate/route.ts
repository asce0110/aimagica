import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createGeneratedImage, updateImageStatus } from '@/lib/database/images'
import { getUserByEmail, incrementDailyRenderCount } from '@/lib/database/users'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { sketchUrl, style, prompt } = await request.json()

    if (!sketchUrl || !style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email!)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check daily render limit based on subscription
    const dailyLimit = user.subscription_tier === 'free' ? 3 : 
                      user.subscription_tier === 'pro' ? 20 : 50
    
    if (user.daily_render_count >= dailyLimit) {
      return NextResponse.json({ 
        error: 'Daily render limit exceeded',
        limit: dailyLimit 
      }, { status: 429 })
    }

    // Create image record in database
    const tempImageUrl = `placeholder-${Date.now()}.jpg` // This will be updated when generation completes
    const imageRecord = await createGeneratedImage({
      user_id: user.id,
      original_sketch_url: sketchUrl,
      generated_image_url: tempImageUrl,
      style,
      prompt
    })

    if (!imageRecord) {
      return NextResponse.json({ error: 'Failed to create image record' }, { status: 500 })
    }

    // Increment daily render count
    await incrementDailyRenderCount(user.id)

    // Update status to processing
    await updateImageStatus(imageRecord.id, 'processing')

    // Here you would typically:
    // 1. Queue the image generation job
    // 2. Call your AI service (Stable Diffusion, etc.)
    // 3. Update the image record when generation is complete
    
    // For now, we'll simulate a successful generation
    setTimeout(async () => {
      // Simulate AI processing time
      const simulatedImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`
      await updateImageStatus(imageRecord.id, 'completed', undefined, 8)
      
      // Update with actual generated image URL
      // This would be done in your actual AI generation service
    }, 2000)

    return NextResponse.json({ 
      success: true, 
      imageId: imageRecord.id,
      status: 'processing',
      message: 'Image generation started'
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    // Here you would check the status of the image generation
    // For now, we'll return a mock response
    return NextResponse.json({ 
      imageId,
      status: 'completed',
      generated_image_url: `https://picsum.photos/512/512?random=${imageId}`,
      render_time_seconds: 8
    })
  } catch (error) {
    console.error('Error checking image status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 