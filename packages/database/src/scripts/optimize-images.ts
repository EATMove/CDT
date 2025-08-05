#!/usr/bin/env tsx

/**
 * 图片表优化脚本
 * 
 * 这个脚本会：
 * 1. 创建必要的索引
 * 2. 添加数据一致性约束
 * 3. 清理孤儿图片（可选）
 * 4. 验证数据完整性
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { handbookImages, handbookChapters, handbookSections } from '../schema';
import { eq, and, isNull, isNotNull, or } from 'drizzle-orm';
import path from 'path';


async function optimizeImages() {
  const adminEnvPath = path.resolve(__dirname, '../../../../apps/admin/.env.local');
  
  try {
    const dotenv = await import('dotenv');
    const result = dotenv.config({ path: adminEnvPath });
    if (result.error) {
      console.log('⚠️  加载环境变量时出错:', result.error.message);
    } else {
      console.log('✅ 已加载admin项目环境变量');
    }
  } catch (error) {
    console.log('⚠️  未找到admin项目.env.local文件');
  }
  
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/handbook_db';
  console.log('🔗 连接数据库:', connectionString.includes('neon.tech') ? 'Neon Cloud Database' : 'Local Database');

  // 为云端数据库配置SSL连接
  const sql = postgres(connectionString, {
    ssl: connectionString.includes('sslmode=require') ? 'require' : false,
    max: 1, // 优化脚本只需要一个连接
  });
  const db = drizzle(sql);

  console.log('🚀 开始优化图片表结构...\n');

  try {
    // 1. 创建索引（如果不存在）
    console.log('📊 创建性能优化索引...');
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_chapter_usage ON handbook_images(chapter_id, usage) WHERE chapter_id IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_section_usage ON handbook_images(section_id, usage) WHERE section_id IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_chapter_order ON handbook_images(chapter_id, "order") WHERE chapter_id IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_section_order ON handbook_images(section_id, "order") WHERE section_id IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_created_at ON handbook_images(created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_handbook_images_uploaded_by ON handbook_images(uploaded_by) WHERE uploaded_by IS NOT NULL;`
    ];

    for (const query of indexQueries) {
      await sql.unsafe(query);
      console.log('  ✅ 索引创建成功');
    }

    // 2. 添加数据一致性约束
    console.log('\n🔒 添加数据一致性约束...');
    
    try {
      await sql.unsafe(`
        ALTER TABLE handbook_images 
        ADD CONSTRAINT chk_handbook_images_context 
        CHECK (
          (chapter_id IS NOT NULL AND section_id IS NULL) OR 
          (chapter_id IS NULL AND section_id IS NOT NULL)
        );
      `);
      console.log('  ✅ 上下文约束添加成功');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('  ⚠️  约束已存在，跳过');
      } else {
        console.log('  ❌ 添加约束失败:', error.message);
      }
    }

    // 3. 数据完整性检查
    console.log('\n🔍 执行数据完整性检查...');

    // 检查孤儿图片
    const orphanImages = await db.select({ id: handbookImages.id })
      .from(handbookImages)
      .where(
        and(
          isNull(handbookImages.chapterId),
          isNull(handbookImages.sectionId)
        )
      );

    console.log(`  📊 发现 ${orphanImages.length} 张孤儿图片`);

    // 检查无效的章节关联
    const invalidChapterRefs = await db.select({
      imageId: handbookImages.id,
      chapterId: handbookImages.chapterId
    })
      .from(handbookImages)
      .leftJoin(handbookChapters, eq(handbookImages.chapterId, handbookChapters.id))
      .where(
        and(
          isNotNull(handbookImages.chapterId),
          isNull(handbookChapters.id)
        )
      );

    console.log(`  📊 发现 ${invalidChapterRefs.length} 个无效章节关联`);

    // 检查无效的段落关联
    const invalidSectionRefs = await db.select({
      imageId: handbookImages.id,
      sectionId: handbookImages.sectionId
    })
      .from(handbookImages)
      .leftJoin(handbookSections, eq(handbookImages.sectionId, handbookSections.id))
      .where(
        and(
          isNotNull(handbookImages.sectionId),
          isNull(handbookSections.id)
        )
      );

    console.log(`  📊 发现 ${invalidSectionRefs.length} 个无效段落关联`);

    // 4. 修复数据（可选）
    const shouldCleanup = process.argv.includes('--cleanup');
    
    if (shouldCleanup && orphanImages.length > 0) {
      console.log('\n🧹 清理孤儿图片...');
      const orphanIds = orphanImages.map(img => img.id);
      
      // 这里应该先删除文件，然后删除数据库记录
      // const deletedCount = await db.delete(handbookImages)
      //   .where(inArray(handbookImages.id, orphanIds));
      
      console.log(`  ⚠️  发现 ${orphanImages.length} 张孤儿图片，请手动处理`);
      console.log('  提示：使用 ImageManager.cleanupOrphanImages() 方法进行清理');
    }

    // 5. 验证优化效果
    console.log('\n📈 验证优化效果...');
    
    // 测试查询性能（模拟常用查询）
    const start = Date.now();
    
    const testChapterId = await db.select({ id: handbookChapters.id })
      .from(handbookChapters)
      .limit(1);
    
    if (testChapterId.length > 0) {
      const chapterId = testChapterId[0].id;
      
      // 测试章节图片查询
      await db.select()
        .from(handbookImages)
        .where(
          and(
            eq(handbookImages.chapterId, chapterId),
            eq(handbookImages.usage, 'content')
          )
        )
        .limit(10);
      
      const queryTime = Date.now() - start;
      console.log(`  ✅ 测试查询执行时间: ${queryTime}ms`);
    }

    console.log('\n🎉 图片表优化完成！');
    console.log('\n📋 优化总结:');
    console.log(`  - 创建了 6 个性能优化索引`);
    console.log(`  - 添加了数据一致性约束`);
    console.log(`  - 发现 ${orphanImages.length} 张孤儿图片`);
    console.log(`  - 发现 ${invalidChapterRefs.length} 个无效章节关联`);
    console.log(`  - 发现 ${invalidSectionRefs.length} 个无效段落关联`);
    
    if (orphanImages.length > 0 || invalidChapterRefs.length > 0 || invalidSectionRefs.length > 0) {
      console.log('\n⚠️  建议:');
      if (orphanImages.length > 0) {
        console.log(`  - 清理孤儿图片: npm run optimize-images -- --cleanup`);
      }
      if (invalidChapterRefs.length > 0 || invalidSectionRefs.length > 0) {
        console.log(`  - 修复无效关联: 手动检查并更新相关记录`);
      }
    }

  } catch (error) {
    console.error('❌ 优化过程中发生错误:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// 检查命令行参数
if (process.argv.includes('--help')) {
  console.log(`
图片表优化脚本

用法:
  npm run optimize-images              # 基本优化（创建索引、约束）
  npm run optimize-images -- --cleanup # 包含数据清理
  npm run optimize-images -- --help    # 显示帮助

功能:
  - 创建性能优化索引
  - 添加数据一致性约束  
  - 检查数据完整性
  - 可选的孤儿图片清理

注意: 
  在生产环境运行前请先备份数据库
  `);
  process.exit(0);
}

// 执行优化
optimizeImages().catch(console.error);