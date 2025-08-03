#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { seedDatabase } from 'database';

// 加载环境变量
config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * 种子数据插入脚本
 */
async function runSeed() {
  console.log('🌱 加拿大驾考App - 种子数据插入');
  console.log('=' .repeat(50));

  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    console.log('请确保在 apps/admin/.env.local 中设置了DATABASE_URL');
    process.exit(1);
  }

  try {
    console.log('📋 开始插入种子数据...');
    await seedDatabase();
    
    console.log('\n🎉 种子数据插入完成！');
    console.log('\n📊 插入的数据包括:');
    console.log('   ✅ 示例用户 (管理员、普通用户、试用用户)');
    console.log('   ✅ 手册章节 (交通标志、道路规则、安全驾驶)');
    console.log('   ✅ 章节段落 (详细的学习内容)');
    console.log('   ✅ 测验题目 (单选题、多选题)');
    console.log('   ✅ 应用配置 (系统参数)');
    console.log('   ✅ 邀请码 (试用邀请)');

  } catch (error) {
    console.error('\n❌ 种子数据插入失败:', error);
    throw error;
  }
}

runSeed()
  .then(() => {
    console.log('\n🎉 种子数据任务完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 种子数据任务失败:', error);
    process.exit(1);
  }); 