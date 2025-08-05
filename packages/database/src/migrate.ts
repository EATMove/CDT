import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDatabase } from './index';
import path from 'path';

/**
 * 数据库迁移脚本
 * 从admin项目的环境变量中读取数据库连接信息
 */
async function runMigrations() {
  console.log('🚀 开始数据库迁移...');
  
  // 尝试从admin项目读取环境变量
  const adminEnvPath = path.resolve(__dirname, '../../../apps/admin/.env.local');
  
  try {
    // 尝试加载admin项目的环境变量
    const dotenv = await import('dotenv');
    dotenv.config({ path: adminEnvPath });
    console.log('✅ 已加载admin项目环境变量');
  } catch (error) {
    console.log('⚠️  未找到admin项目.env.local文件，使用默认环境变量');
  }

  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    console.log('请确保在以下位置之一设置了DATABASE_URL:');
    console.log('  1. apps/admin/.env.local');
    console.log('  2. 系统环境变量');
    process.exit(1);
  }

  console.log('📋 数据库连接信息:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')}`);

  const { db, close } = createDatabase();
  
  try {
    // 运行迁移
    const migrationsFolder = path.resolve(__dirname, './migrations');
    console.log(`📁 迁移文件目录: ${migrationsFolder}`);
    
    await migrate(db, { migrationsFolder });
    
    console.log('✅ 数据库迁移完成！');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    await close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 迁移任务完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移任务失败:', error);
      process.exit(1);
    });
}

export { runMigrations }; 