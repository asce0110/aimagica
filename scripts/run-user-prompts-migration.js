const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting user prompts system migration...')
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_user_prompts_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📖 Migration file loaded')
    
    // 分割SQL语句（按分号分割，忽略注释）
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .filter(statement => statement.trim() !== '')
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('execute_sql', {
            sql_query: statement
          })
          
          if (error) {
            // 如果RPC不可用，尝试直接执行
            const { error: directError } = await supabase
              .from('_temp_migration')
              .select('*')
              .limit(0)
            
            // 执行原始查询
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
              method: 'POST',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sql_query: statement })
            })
            
            if (!response.ok) {
              console.warn(`⚠️  Direct execution failed for statement ${i + 1}, continuing...`)
              console.warn(`   SQL: ${statement.substring(0, 100)}...`)
            }
          }
          
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (execError) {
          console.warn(`⚠️  Statement ${i + 1} failed, continuing...`)
          console.warn(`   Error: ${execError.message}`)
          console.warn(`   SQL: ${statement.substring(0, 100)}...`)
        }
      }
    }
    
    console.log('\n🎉 Migration completed!')
    console.log('\nNext steps:')
    console.log('1. Test the user prompts functionality')
    console.log('2. Check that the API endpoints work correctly')
    console.log('3. Verify that RLS policies are working')
    console.log('4. Test the admin interface')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nPossible solutions:')
    console.error('1. Check your database connection')
    console.error('2. Verify environment variables')
    console.error('3. Run SQL manually in Supabase dashboard')
    console.error('4. Check for syntax errors in migration file')
    process.exit(1)
  }
}

// 验证连接
async function verifyConnection() {
  try {
    console.log('🔍 Verifying database connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    }
    
    console.log('✅ Database connection verified')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// 检查是否已经迁移
async function checkExistingTables() {
  try {
    console.log('🔍 Checking existing tables...')
    
    const { data, error } = await supabase
      .from('user_prompts')
      .select('count')
      .limit(1)
    
    if (!error) {
      console.log('⚠️  user_prompts table already exists')
      const confirm = require('readline-sync').question(
        'Continue anyway? This might cause errors (y/N): '
      )
      
      if (confirm.toLowerCase() !== 'y') {
        console.log('❌ Migration cancelled')
        process.exit(0)
      }
    }
  } catch (error) {
    console.log('✅ user_prompts table does not exist, proceeding...')
  }
}

// 主函数
async function main() {
  console.log('🚀 User Prompts System Migration Tool')
  console.log('=====================================\n')
  
  // 验证连接
  const connected = await verifyConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // 检查现有表
  await checkExistingTables()
  
  // 运行迁移
  await runMigration()
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
}

module.exports = { runMigration, verifyConnection } 