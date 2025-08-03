#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createDatabase } from 'database';
import { sql } from 'drizzle-orm';

// 加载环境变量
config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * 数据库连接检查脚本
 */
async function checkDatabaseConnection() {
  console.log('🔍 加拿大驾考App - 数据库连接检查');
  console.log('=' .repeat(50));

  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    console.log('\n请在以下文件中设置DATABASE_URL:');
    console.log('  📄 apps/admin/.env.local');
    console.log('\n示例:');
    console.log('  DATABASE_URL="postgresql://user:password@host:5432/dbname"');
    process.exit(1);
  }

  console.log('📋 数据库连接信息:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')}`);

  const { db, close } = createDatabase();
  
  try {
    console.log('\n🔗 正在测试数据库连接...');
    
    // 执行简单查询测试连接
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    
    console.log('✅ 数据库连接成功！');
    console.log(`   当前时间: ${result[0]?.current_time}`);
    
    // 检查表是否存在
    console.log('\n📊 检查数据库表...');
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.length > 0) {
      console.log('✅ 发现以下表:');
      tables.forEach((table: any) => {
        console.log(`   📋 ${table.table_name}`);
      });
    } else {
      console.log('⚠️  数据库中没有发现表，可能需要运行迁移');
    }

  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  } finally {
    await close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

checkDatabaseConnection()
  .then(() => {
    console.log('\n🎉 数据库连接检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 数据库连接检查失败:', error);
    process.exit(1);
  }); 