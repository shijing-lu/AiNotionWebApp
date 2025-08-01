#!/usr/bin/env node
/**
 * AI服务配置助手
 * 帮助用户快速配置OpenAI API密钥
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 AINotion - AI服务配置助手\n');

// 检查是否已存在.env.local文件
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ 发现已存在的 .env.local 文件');
  
  rl.question('是否要更新现有配置？(y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      promptForApiKey();
    } else {
      console.log('配置已取消');
      rl.close();
    }
  });
} else {
  console.log('📝 开始创建 .env.local 配置文件...\n');
  promptForApiKey();
}

function promptForApiKey() {
  console.log('请按照以下步骤获取OpenAI API密钥：');
  console.log('1. 访问: https://platform.openai.com/api-keys');
  console.log('2. 登录或注册OpenAI账户');
  console.log('3. 点击 "Create new secret key"');
  console.log('4. 复制生成的API密钥（以 sk- 开头）\n');
  
  rl.question('请粘贴您的OpenAI API密钥 (sk-...): ', (apiKey) => {
    if (!apiKey.startsWith('sk-')) {
      console.log('❌ 无效的API密钥格式，应该以 "sk-" 开头');
      rl.close();
      return;
    }
    
    createEnvFile(apiKey);
  });
}

function createEnvFile(apiKey) {
  const envContent = `# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=${apiKey}

# 自动生成时间: ${new Date().toLocaleString()}
# 
# 🔐 安全提醒：
# - 此文件包含敏感信息，不会被提交到Git
# - 请妥善保管您的API密钥
# - 定期检查OpenAI使用情况和费用
`;

  try {
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ .env.local 文件创建成功！');
    console.log('');
    console.log('🚀 下一步：');
    console.log('1. 重启开发服务器: npm run dev');
    console.log('2. 在笔记编辑器中测试AI功能');
    console.log('3. 查看OpenAI使用情况: https://platform.openai.com/usage');
    console.log('');
    console.log('💡 AI功能包括：');
    console.log('- 📄 文档总结');
    console.log('- 🌍 文本翻译');
    console.log('- 💭 概念解释');
    console.log('- ❓ 智能问答');
    console.log('- ✨ 内容优化');
    console.log('- 🏷️ 自动标签');
  } catch (error) {
    console.log('❌ 创建配置文件失败:', error.message);
  }
  
  rl.close();
}