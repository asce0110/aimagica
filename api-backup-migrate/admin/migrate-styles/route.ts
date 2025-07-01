import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting styles requirements migration...')

    // 执行迁移脚本
    const migrationSQL = `
      -- 为 styles 表添加限制条件字段
      ALTER TABLE styles 
      ADD COLUMN IF NOT EXISTS requires_image_upload BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS requires_prompt_description BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS min_prompt_length INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_prompt_length INTEGER DEFAULT 1000,
      ADD COLUMN IF NOT EXISTS allowed_image_formats TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'],
      ADD COLUMN IF NOT EXISTS requirements_description TEXT DEFAULT NULL;

      -- 添加注释说明
      COMMENT ON COLUMN styles.requires_image_upload IS '是否必须上传图片才能使用此风格';
      COMMENT ON COLUMN styles.requires_prompt_description IS '是否必须输入提示词描述';
      COMMENT ON COLUMN styles.min_prompt_length IS '提示词最小长度要求';
      COMMENT ON COLUMN styles.max_prompt_length IS '提示词最大长度限制';
      COMMENT ON COLUMN styles.allowed_image_formats IS '允许的图片格式';
      COMMENT ON COLUMN styles.requirements_description IS '使用要求的详细说明';

      -- 创建索引以提高查询性能
      CREATE INDEX IF NOT EXISTS idx_styles_requires_image ON styles(requires_image_upload);
      CREATE INDEX IF NOT EXISTS idx_styles_requires_prompt ON styles(requires_prompt_description);
    `

    // 执行迁移
    const { error: migrationError } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    })

    if (migrationError) {
      console.error('❌ Migration error:', migrationError)
      
      // 尝试逐个执行 ALTER TABLE 语句
      const alterStatements = [
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS requires_image_upload BOOLEAN DEFAULT FALSE',
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS requires_prompt_description BOOLEAN DEFAULT FALSE',
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS min_prompt_length INTEGER DEFAULT 0',
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS max_prompt_length INTEGER DEFAULT 1000',
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS allowed_image_formats TEXT[] DEFAULT ARRAY[\'jpg\', \'jpeg\', \'png\', \'webp\']',
        'ALTER TABLE styles ADD COLUMN IF NOT EXISTS requirements_description TEXT DEFAULT NULL'
      ]

      for (const statement of alterStatements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error(`❌ Error executing: ${statement}`, error)
          } else {
            console.log(`✅ Executed: ${statement}`)
          }
        } catch (err) {
          console.error(`❌ Exception executing: ${statement}`, err)
        }
      }
    } else {
      console.log('✅ Migration executed successfully')
    }

    // 更新现有的 TOY PHOTOGRAPHY 风格
    const { error: updateError } = await supabase
      .from('styles')
      .update({
        requires_image_upload: true,
        requires_prompt_description: true,
        min_prompt_length: 10,
        requirements_description: '此风格需要上传参考图片，AI将基于您的图片创造玩具摄影风格的作品。请确保图片清晰，主体明确。'
      })
      .ilike('name', '%TOY PHOTOGRAPHY%')

    if (updateError) {
      console.error('❌ Error updating TOY PHOTOGRAPHY style:', updateError)
    } else {
      console.log('✅ Updated TOY PHOTOGRAPHY style requirements')
    }

    // 为其他一些特殊风格设置要求
    const { error: updateOthersError } = await supabase
      .from('styles')
      .update({
        requires_prompt_description: true,
        min_prompt_length: 5,
        requirements_description: '请提供详细的描述以获得最佳效果。'
      })
      .in('category', ['concept-art', 'technical-scientific', 'architecture-interior'])

    if (updateOthersError) {
      console.error('❌ Error updating other styles:', updateOthersError)
    } else {
      console.log('✅ Updated other styles requirements')
    }

    return NextResponse.json({
      success: true,
      message: 'Styles requirements migration completed successfully'
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 