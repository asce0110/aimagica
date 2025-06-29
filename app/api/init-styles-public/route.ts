import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 公共：初始化styles表（无需权限验证，仅用于应急）
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Public init: Creating styles table...')
    
    // 示例风格数据
    const sampleStyles = [
      {
        name: 'Photorealistic Portrait',
        description: 'Ultra-realistic photographic style with professional lighting',
        emoji: '📸',
        prompt_template: '{prompt}, photorealistic, professional photography, high quality, detailed, studio lighting',
        type: 'image',
        category: 'photographic-realism',
        is_premium: false,
        is_active: true,
        sort_order: 1
      },
      {
        name: 'Digital Painting',
        description: 'Modern digital artwork with painterly textures',
        emoji: '🎨',
        prompt_template: '{prompt}, digital painting, artistic, detailed brushwork, vibrant colors',
        type: 'image',
        category: 'illustration-digital-painting',
        is_premium: false,
        is_active: true,
        sort_order: 2
      },
      {
        name: 'Anime Style',
        description: 'Japanese anime artwork with vibrant colors and detailed characters',
        emoji: '🌸',
        prompt_template: '{prompt}, anime style, vibrant colors, detailed artwork, manga inspired',
        type: 'image',
        category: 'anime-comics',
        is_premium: false,
        is_active: true,
        sort_order: 3
      },
      {
        name: 'Game Concept Art',
        description: 'Professional concept art for games and films',
        emoji: '🎭',
        prompt_template: '{prompt}, concept art, game design, cinematic, professional artwork',
        type: 'image',
        category: 'concept-art',
        is_premium: true,
        is_active: true,
        sort_order: 4
      },
      {
        name: 'Abstract Modern',
        description: 'Contemporary abstract art with bold forms and colors',
        emoji: '🌀',
        prompt_template: '{prompt}, abstract art, modern, contemporary, bold colors, geometric forms',
        type: 'image',
        category: 'abstract',
        is_premium: false,
        is_active: true,
        sort_order: 5
      }
    ]

    // 首先检查表是否已经有数据
    const { data: existingData, error: checkError } = await supabase
      .from('styles')
      .select('count')
      .limit(1)

    if (checkError) {
      console.error('❌ Table check failed:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Styles table does not exist',
        message: 'Please create the table first using the SQL script',
        sqlScript: 'See CREATE_STYLES_TABLE.sql or docs/database/styles-table.sql',
        checkError: checkError.message
      }, { status: 500 })
    }

    // 获取当前数据数量
    const { count } = await supabase
      .from('styles')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return NextResponse.json({
        success: true,
        message: `Styles table already has ${count} records`,
        existingCount: count,
        action: 'no_action_needed'
      })
    }

    // 插入示例数据
    console.log('📝 Inserting sample styles...')
    const { data, error: insertError } = await supabase
      .from('styles')
      .insert(sampleStyles)
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert sample styles',
        details: insertError.message,
        insertError: insertError
      }, { status: 500 })
    }

    console.log(`✅ Inserted ${data?.length || 0} sample styles`)

    return NextResponse.json({
      success: true,
      message: 'Styles table initialized successfully',
      insertedCount: data?.length || 0,
      action: 'data_inserted'
    })

  } catch (error) {
    console.error('❌ Public init error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      message: 'Initialization failed'
    }, { status: 500 })
  }
} 