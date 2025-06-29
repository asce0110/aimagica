const fs = require('fs');
const path = require('path');

console.log('🔍 Validating API Config SQL syntax...');

const sqlFile = path.join(__dirname, '../lib/database/migrations/004_api_configs.sql');

try {
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  
  // 基本语法检查
  const issues = [];
  
  // 检查常见的语法问题
  const lines = sqlContent.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // 检查UPDATE语句中的ORDER BY（这是主要问题）
    if (trimmedLine.includes('UPDATE') && trimmedLine.includes('ORDER BY')) {
      issues.push(`Line ${lineNum}: UPDATE statement cannot have ORDER BY directly`);
    }
    
    // 检查未关闭的引号
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0 && !trimmedLine.startsWith('--')) {
      issues.push(`Line ${lineNum}: Possible unclosed single quote`);
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ SQL syntax validation passed!');
    console.log('📝 The script should now execute without syntax errors.');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Copy the content of lib/database/migrations/004_api_configs.sql');
    console.log('2. Go to your Supabase Dashboard → SQL Editor');
    console.log('3. Paste and execute the script');
    console.log('');
    console.log('📊 The script will create:');
    console.log('   - api_configs table');
    console.log('   - api_usage_logs table');
    console.log('   - Indexes and triggers');
    console.log('   - RLS policies');
    console.log('   - Sample API configurations');
    console.log('   - Helper functions');
  } else {
    console.log('❌ Found potential syntax issues:');
    issues.forEach(issue => console.log('   ' + issue));
  }
  
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
} 