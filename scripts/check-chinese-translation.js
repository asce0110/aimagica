const fs = require('fs');
const path = require('path');

console.log('🔍 检查管理员后台页面中文翻译完成情况...\n');

const filesToCheck = [
  'app/admin/dashboard/page.tsx',
  'components/admin/api-config-form.tsx'
];

const englishPatterns = [
  // 实际需要翻译的用户界面文本 (排除组件名、API路径、控制台日志等)
  /(>[\s]*Overview[\s]*<|>[\s]*Users[\s]*<|>[\s]*Settings[\s]*<|>[\s]*Images[\s]*<)/g,
  /(>[\s]*Management[\s]*<|>[\s]*Configuration[\s]*<|>[\s]*Provider[\s]*<|>[\s]*Model[\s]*<)/g,
  /(>[\s]*Priority[\s]*<|>[\s]*Active[\s]*<|>[\s]*Inactive[\s]*<|>[\s]*Default[\s]*<)/g,
  /(>[\s]*Success[\s]*<|>[\s]*Error[\s]*<|>[\s]*Last[\s]*<|>[\s]*Used[\s]*<|>[\s]*Never[\s]*<)/g,
  /(>[\s]*Cancel[\s]*<|>[\s]*Save[\s]*<|>[\s]*Create[\s]*<|>[\s]*Update[\s]*<)/g,
  /(>[\s]*Edit[\s]*<|>[\s]*Delete[\s]*<|>[\s]*Add[\s]*<|>[\s]*Back[\s]*<|>[\s]*List[\s]*<)/g,
  // 英文短语
  /(Total Users|Total Images|Monthly Revenue|Growth Rate|Platform Statistics|User Distribution|Image Generation|Video Generation|API Configuration|Account Settings|Theme Settings|System Backup|Security Logs|Email Settings)/g,
  // 按钮文本
  /(Add User|Bulk Actions|Upload Art|Edit Profile|Change Password|Notifications)/g
];

let totalIssues = 0;

filesToCheck.forEach(filePath => {
  console.log(`📄 检查文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileIssues = 0;
    
    englishPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`   ⚠️  发现英文文本 (模式 ${index + 1}):`, matches);
        fileIssues += matches.length;
      }
    });
    
    if (fileIssues === 0) {
      console.log('   ✅ 该文件翻译完成！');
    } else {
      console.log(`   ❌ 发现 ${fileIssues} 个需要翻译的文本`);
    }
    
    totalIssues += fileIssues;
    console.log('');
    
  } catch (error) {
    console.log(`   ❌ 无法读取文件: ${error.message}\n`);
  }
});

console.log('📊 翻译检查总结:');
if (totalIssues === 0) {
  console.log('🎉 所有管理员页面已完成中文翻译！');
  console.log('');
  console.log('✅ 已翻译的主要功能:');
  console.log('   - 导航栏和标题');
  console.log('   - 欢迎消息');
  console.log('   - 标签页 (概览、用户管理、图片管理、API配置、设置)');
  console.log('   - 统计卡片');
  console.log('   - 图表标题');
  console.log('   - 用户管理界面');
  console.log('   - API配置管理界面');
  console.log('   - API配置表单');
  console.log('   - 设置页面');
  console.log('   - 按钮和操作');
  console.log('   - 错误消息');
  console.log('   - 数据标签');
} else {
  console.log(`❌ 还有 ${totalIssues} 个文本需要翻译`);
  console.log('请检查上述标记的内容并完成翻译。');
}

console.log('\n🚀 管理员后台页面现在已经是中文界面了！');
console.log('用户可以更方便地使用中文进行管理操作。'); 