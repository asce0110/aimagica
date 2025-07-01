import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 调试：获取所有风格数据
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Testing styles table connection...')
    
    // 测试表是否存在
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .limit(5)

    console.log('📊 Debug styles query result:', { data, error })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message,
        details: error,
        suggestion: 'The styles table may not exist. Please create it using the SQL script.'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      styles: data || [],
      count: data?.length || 0,
      message: 'Styles table connection successful'
    })
  } catch (error) {
    console.error('❌ Debug styles error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}

// 调试：创建styles表
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Debug: Creating styles table...')
    
    // 先尝试插入一条测试数据看表是否存在
    const testStyle = {
      name: 'Test Style',
      description: 'Test description',
      emoji: '🧪',
      prompt_template: '{prompt}, test style',
      type: 'image',
      category: 'art',
      is_premium: false,
      is_active: true,
      sort_order: 0
    }

    const { data, error } = await supabase
      .from('styles')
      .insert(testStyle)
      .select()
      .single()

    if (error) {
      console.error('❌ Insert failed, table may not exist:', error)
      
      // 如果表不存在，返回详细的错误信息
      return NextResponse.json({
        success: false,
        error: 'Styles table does not exist',
        details: error.message,
        sqlToRun: `
-- 请在 Supabase SQL Editor 中运行以下SQL：
CREATE TABLE IF NOT EXISTS styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    emoji VARCHAR(10) DEFAULT '🎨',
    image_url TEXT,
    prompt_template TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'both')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('photographic-realism', 'illustration-digital-painting', 'anime-comics', 'concept-art', '3d-render', 'abstract', 'fine-art-movements', 'technical-scientific', 'architecture-interior', 'design-commercial', 'genre-driven', 'vintage-retro')),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_styles_type ON styles(type);
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_active ON styles(is_active);
CREATE INDEX IF NOT EXISTS idx_styles_sort_order ON styles(sort_order);

-- 插入示例数据
INSERT INTO styles (name, description, emoji, prompt_template, type, category, is_premium, is_active, sort_order) VALUES
('Photorealistic Portrait', 'Ultra-realistic photographic style', '📸', '{prompt}, photorealistic, professional photography, high quality', 'image', 'photographic-realism', false, true, 1),
('Digital Painting', 'Modern digital artwork with painterly textures', '🎨', '{prompt}, digital painting, artistic, detailed brushwork', 'image', 'illustration-digital-painting', false, true, 2),
('Anime Style', 'Japanese anime artwork with vibrant colors', '🌸', '{prompt}, anime style, vibrant colors, detailed artwork', 'image', 'anime-comics', false, true, 3);
        `
      }, { status: 500 })
    }

    // 如果成功，删除测试数据
    if (data?.id) {
      await supabase
        .from('styles')
        .delete()
        .eq('id', data.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Styles table exists and is working correctly'
    })

  } catch (error) {
    console.error('❌ Debug create error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 