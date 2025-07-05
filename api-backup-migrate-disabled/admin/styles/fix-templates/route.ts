import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 开始修复风格模板...')

    // 获取所有活跃的风格
    const { data: styles, error: fetchError } = await supabase
      .from('styles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      console.error('❌ 获取风格数据失败:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch styles',
        details: fetchError.message
      }, { status: 500 })
    }

    const fixedStyles = []
    const problematicStyles = []

    // 检查每个风格的模板
    for (const style of styles || []) {
      if (!style.prompt_template.includes('{prompt}')) {
        problematicStyles.push({
          id: style.id,
          name: style.name,
          original_template: style.prompt_template,
          fixed_template: `{prompt}, ${style.prompt_template}`
        })

        // 修复模板
        const { error: updateError } = await supabase
          .from('styles')
          .update({
            prompt_template: `{prompt}, ${style.prompt_template}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', style.id)

        if (updateError) {
          console.error(`❌ 修复风格 ${style.name} 失败:`, updateError)
        } else {
          fixedStyles.push(style.name)
          console.log(`✅ 修复风格 ${style.name}`)
        }
      }
    }

    console.log(`🎯 修复完成! 总共修复了 ${fixedStyles.length} 个风格`)

    return NextResponse.json({
      success: true,
      message: `Successfully fixed ${fixedStyles.length} style templates`,
      totalStyles: styles?.length || 0,
      fixedStyles: fixedStyles,
      problematicStyles: problematicStyles,
      fixedCount: fixedStyles.length
    })

  } catch (error) {
    console.error('❌ 修复风格模板时发生错误:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 检查风格模板...')

    // 获取所有活跃的风格
    const { data: styles, error: fetchError } = await supabase
      .from('styles')
      .select('id, name, prompt_template, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch styles',
        details: fetchError.message
      }, { status: 500 })
    }

    const problematicStyles = []
    const validStyles = []

    // 检查每个风格的模板
    for (const style of styles || []) {
      if (!style.prompt_template.includes('{prompt}')) {
        problematicStyles.push({
          id: style.id,
          name: style.name,
          template: style.prompt_template
        })
      } else {
        validStyles.push({
          id: style.id,
          name: style.name,
          template: style.prompt_template
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalStyles: styles?.length || 0,
      validCount: validStyles.length,
      problematicCount: problematicStyles.length,
      problematicStyles: problematicStyles,
      validStyles: validStyles,
      allValid: problematicStyles.length === 0
    })

  } catch (error) {
    console.error('❌ 检查风格模板时发生错误:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 