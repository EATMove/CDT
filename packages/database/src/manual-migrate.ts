#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createDatabase } from './index';
import { sql } from 'drizzle-orm';
import fs from 'fs';

// 加载环境变量
config({ path: path.resolve(__dirname, '../../../apps/admin/.env.local') });

/**
 * 手动执行迁移文件
 */
async function manualMigrate() {
  console.log('🔧 手动执行迁移...');
  
  const { db, close } = createDatabase();
  
  try {
    // 读取迁移文件
    const migrationPath = path.resolve(__dirname, './migrations/0000_flat_maria_hill.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 读取迁移文件:', migrationPath);
    
    // 按语句分割并执行
    const statements = migrationContent.split('--> statement-breakpoint');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`执行语句 ${i + 1}/${statements.length}...`);
          await db.execute(sql.raw(statement));
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        } catch (error) {
          console.log(`⚠️  语句 ${i + 1} 执行失败 (可能是已存在):`, (error as Error).message);
        }
      }
    }
    
    console.log('✅ 手动迁移完成');
    
  } catch (error) {
    console.error('❌ 手动迁移失败:', error);
  } finally {
    await close();
  }
}

manualMigrate()
  .then(() => {
    console.log('🎉 手动迁移任务完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 手动迁移任务失败:', error);
    process.exit(1);
  }); 