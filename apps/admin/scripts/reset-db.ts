#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createDatabase } from 'database';
import { sql } from 'drizzle-orm';

// 加载环境变量
config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * 数据库重置脚本
 * 删除所有表并重新创建
 */
async function resetDatabase() {
  console.log('🗑️  数据库重置脚本');
  console.log('=' .repeat(50));

  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到DATABASE_URL环境变量');
    process.exit(1);
  }

  console.log('📋 数据库连接信息:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')}`);

  const { db, close } = createDatabase();

  try {
    console.log('\n🗑️  删除所有表...');
    
    // 删除所有表（按照依赖关系顺序）
    await db.execute(sql`DROP TABLE IF EXISTS "user_answers" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "quiz_sessions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "question_options" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "questions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "wrong_questions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "learning_stats" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "chapter_progress" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "bookmarks" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "reading_records" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "handbook_content_versions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "handbook_images" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "handbook_sections" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "handbook_chapters" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "verification_codes" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "app_configs" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "app_versions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "feedback" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "invite_codes" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "images" CASCADE`);
    
    // 删除枚举类型
    await db.execute(sql`DROP TYPE IF EXISTS "chapter_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "content_format" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "payment_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "publish_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "login_method" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "province" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "user_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "language" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "question_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "quiz_type" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "feedback_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "feedback_type" CASCADE`);
    
    // 删除drizzle迁移表
    await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
    
    console.log('✅ 所有表已删除');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 数据库重置完成！');
    console.log('\n🔗 下一步:');
    console.log('   运行: pnpm db:init');

  } catch (error) {
    console.error('\n❌ 数据库重置失败:', error);
    throw error;
  } finally {
    await close();
  }
}

resetDatabase()
  .then(() => {
    console.log('\n🎉 重置任务完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 重置任务失败:', error);
    process.exit(1);
  }); 