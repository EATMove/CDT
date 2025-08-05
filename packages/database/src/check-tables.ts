#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createDatabase } from './index';
import { sql } from 'drizzle-orm';

// 加载环境变量
config({ path: path.resolve(__dirname, '../../../apps/admin/.env.local') });

/**
 * 检查数据库表是否存在
 */
async function checkTables() {
  console.log('🔍 检查数据库表...');
  
  const { db, close } = createDatabase();
  
  try {
    // 检查表是否存在
    const tables = [
      'users',
      'handbook_chapters',
      'handbook_sections',
      'questions',
      'question_options',
      'app_configs',
      'invite_codes'
    ];
    
    for (const table of tables) {
      try {
        const result = await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
        console.log(`✅ ${table} 表存在`);
      } catch (error) {
        console.log(`❌ ${table} 表不存在`);
      }
    }
    
    // 检查枚举类型
    const enums = [
      'province',
      'user_type',
      'login_method'
    ];
    
    for (const enumType of enums) {
      try {
        const result = await db.execute(sql`SELECT 1 FROM pg_type WHERE typname = ${enumType}`);
        if (result.length > 0) {
          console.log(`✅ ${enumType} 枚举存在`);
        } else {
          console.log(`❌ ${enumType} 枚举不存在`);
        }
      } catch (error) {
        console.log(`❌ ${enumType} 枚举检查失败`);
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await close();
  }
}

checkTables()
  .then(() => {
    console.log('检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('检查失败:', error);
    process.exit(1);
  }); 