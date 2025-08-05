import { runMigrations } from './migrate';
import { seedDatabase } from './seed';
import path from 'path';

/**
 * 完整的数据库初始化脚本
 * 1. 运行迁移
 * 2. 插入种子数据
 */
async function initDatabase(options: {
  skipSeed?: boolean;
  forceSeed?: boolean;
} = {}) {
  console.log('🚀 开始数据库初始化...');
  console.log('=' .repeat(50));

  // 加载环境变量
  const adminEnvPath = path.resolve(__dirname, '../../../apps/admin/.env.local');
  
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: adminEnvPath });
    console.log('✅ 已加载admin项目环境变量');
  } catch (error) {
    console.log('⚠️  未找到admin项目.env.local文件');
  }

  // 检查数据库连接
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    console.log('\n请在以下文件中设置DATABASE_URL:');
    console.log('  📄 apps/admin/.env.local');
    console.log('\n示例:');
    console.log('  DATABASE_URL="postgresql://user:password@host:5432/dbname"');
    process.exit(1);
  }

  try {
    // 步骤1: 运行数据库迁移
    console.log('\n📦 步骤1: 运行数据库迁移');
    console.log('-'.repeat(30));
    await runMigrations();

    // 步骤2: 插入种子数据（可选）
    if (!options.skipSeed) {
      console.log('\n🌱 步骤2: 插入种子数据');
      console.log('-'.repeat(30));
      
      if (options.forceSeed) {
        console.log('⚠️  强制插入种子数据（可能会覆盖现有数据）');
      }
      
      await seedDatabase();
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
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    skipSeed: args.includes('--skip-seed'),
    forceSeed: args.includes('--force-seed'),
  };

  console.log('🛠️  加拿大驾考App - 数据库初始化');
  console.log('=' .repeat(50));

  if (options.skipSeed) {
    console.log('ℹ️  参数: --skip-seed (跳过种子数据)');
  }
  
  if (options.forceSeed) {
    console.log('ℹ️  参数: --force-seed (强制插入种子数据)');
  }

  initDatabase(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败:', error);
      process.exit(1);
    });
}

export { initDatabase }; 