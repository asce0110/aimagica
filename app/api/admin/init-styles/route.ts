import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from '@/lib/supabase'

// 初始化styles表
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 临时：允许所有登录用户访问风格管理 (用于调试)
    const isAdmin = true // 临时设置为true
    // const isAdmin = session.user.email === 'admin@example.com' || 
    //                session.user.email?.includes('admin')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔄 Initializing styles table...')

    // 创建styles表的SQL
    const createTableSQL = `
      -- 创建风格表
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
    `

    // 执行创建表的SQL
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.error('Error creating styles table:', createError)
      // 如果rpc方法不存在，尝试直接创建表
      try {
        // 尝试插入测试数据来验证表是否存在
        const { error: testError } = await supabase
          .from('styles')
          .select('count')
          .limit(1)
        
        if (testError) {
          return NextResponse.json({ 
            error: 'Styles table does not exist and cannot be created automatically. Please create it manually in Supabase.',
            details: testError.message
          }, { status: 500 })
        }
      } catch (e) {
        return NextResponse.json({ 
          error: 'Styles table does not exist. Please create it manually using the SQL script in docs/database/styles-table.sql',
          sqlScript: 'docs/database/styles-table.sql'
        }, { status: 500 })
      }
    }

    // 检查表是否已有数据
    const { data: existingStyles, error: checkError } = await supabase
      .from('styles')
      .select('count')
      .limit(1)

    if (checkError) {
      return NextResponse.json({ 
        error: 'Failed to check existing styles',
        details: checkError.message,
        suggestion: 'Please create the styles table manually using docs/database/styles-table.sql'
      }, { status: 500 })
    }

    // 如果表为空，插入示例数据
    const { count } = await supabase
      .from('styles')
      .select('*', { count: 'exact', head: true })

    if (count === 0) {
      console.log('📝 Inserting sample styles...')
      
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
          name: '3D Rendered',
          description: 'High-quality 3D rendered artwork with realistic materials',
          emoji: '🧊',
          prompt_template: '{prompt}, 3d render, octane render, realistic materials, high quality',
          type: 'image',
          category: '3d-render',
          is_premium: true,
          is_active: true,
          sort_order: 5
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
          sort_order: 6
        }
      ]

      const { data, error: insertError } = await supabase
        .from('styles')
        .insert(sampleStyles)
        .select()

      if (insertError) {
        console.error('Error inserting sample styles:', insertError)
        return NextResponse.json({ 
          error: 'Failed to insert sample styles',
          details: insertError.message
        }, { status: 500 })
      }

      console.log(`✅ Inserted ${data?.length || 0} sample styles`)
    }

    console.log('✅ Styles table initialization completed')

    return NextResponse.json({ 
      success: true,
      message: 'Styles table initialized successfully',
      stylesCount: count
    })

  } catch (error) {
    console.error('Error initializing styles table:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please create the styles table manually using docs/database/styles-table.sql'
    }, { status: 500 })
  }
} 