#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { runMigrations, seedDatabase } from 'database';

// 加载环境变量
config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * 数据库初始化脚本
 * 从admin项目的.env.local读取数据库连接信息
 */
async function initDatabase(options: {
  skipSeed?: boolean;
  forceSeed?: boolean;
  clearFirst?: boolean;
  skipMigrate?: boolean;
} = {}) {
  console.log('🚀 加拿大驾考App - 数据库初始化');
  console.log('=' .repeat(50));

  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    console.log('\n请在以下文件中设置DATABASE_URL:');
    console.log('  📄 apps/admin/.env.local');
    console.log('\n示例:');
    console.log('  DATABASE_URL="postgresql://user:password@host:5432/dbname"');
    console.log('  JWT_SECRET="your-secret-key"');
    console.log('  BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"');
    process.exit(1);
  }

  console.log('📋 数据库连接信息:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')}`);

  try {
    // 步骤1: 运行数据库迁移
    if (!options.skipMigrate) {
      console.log('\n📦 步骤1: 运行数据库迁移');
      console.log('-'.repeat(30));
      await runMigrations();
    } else {
      console.log('\n⏭️  跳过数据库迁移');
    }

    // 步骤2: 插入种子数据（可选）
    if (!options.skipSeed) {
      console.log('\n🌱 步骤2: 插入种子数据');
      console.log('-'.repeat(30));
      
      if (options.forceSeed) {
        console.log('⚠️  强制插入种子数据（可能会覆盖现有数据）');
      }
      
      if (options.clearFirst) {
        console.log('🗑️  清空现有数据后重新插入');
      }
      
      await seedDatabase({ clearFirst: options.clearFirst });
    } else {
      console.log('\n⏭️  跳过种子数据插入');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 数据库初始化完成！');
    console.log('\n📊 初始化内容:');
    console.log('   ✅ 数据库表结构');
    console.log('   ✅ 示例用户数据');
    console.log('   ✅ 手册章节和内容');
    console.log('   ✅ 测验题目');
    console.log('   ✅ 应用配置');
    
    console.log('\n🔗 下一步:');
    console.log('   1. 启动admin应用: pnpm admin');
    console.log('   2. 访问: http://localhost:3000');
    console.log('   3. 查看数据库: pnpm db:studio');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const options = {
  skipSeed: args.includes('--skip-seed'),
  forceSeed: args.includes('--force-seed'),
  clearFirst: args.includes('--clear-first'),
  skipMigrate: args.includes('--skip-migrate'),
};

if (options.skipSeed) {
  console.log('ℹ️  参数: --skip-seed (跳过种子数据)');
}

if (options.forceSeed) {
  console.log('ℹ️  参数: --force-seed (强制插入种子数据)');
}

if (options.clearFirst) {
  console.log('ℹ️  参数: --clear-first (清空现有数据)');
}

if (options.skipMigrate) {
  console.log('ℹ️  参数: --skip-migrate (跳过数据库迁移)');
}

initDatabase(options)
  .then(() => {
    console.log('\n🎉 初始化任务完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 初始化任务失败:', error);
    process.exit(1);
  }); 