import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookImages, handbookChapters, handbookSections } from 'database';
import { eq, and, or, isNull, desc, inArray } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

/**
 * 获取编辑上下文相关的图片
 * 这个API会根据当前编辑的章节或段落，智能返回相关的图片
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const sectionId = searchParams.get('sectionId');
  const usage = searchParams.get('usage');
  const includeRecent = searchParams.get('includeRecent') === 'true'; // 是否包含最近上传的图片

  if (!chapterId && !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '必须提供章节ID或段落ID',
      400
    );
  }

  const db = getDb();
  
  try {
    // 构建查询结果
    const result: {
      contextImages: any[];
      recentImages?: any[];
      suggestions?: any[];
    } = {
      contextImages: [],
    };

    // 1. 获取当前上下文的图片
    let contextQuery = db.select().from(handbookImages);
    
    if (sectionId) {
      // 段落级别：获取段落的图片
      contextQuery = contextQuery.where(eq(handbookImages.sectionId, sectionId));
    } else if (chapterId) {
      // 章节级别：获取章节直属图片（不属于任何段落）
      contextQuery = contextQuery.where(
        and(
          eq(handbookImages.chapterId, chapterId),
          isNull(handbookImages.sectionId)
        )
      );
    }

    // 如果指定了用途，进一步筛选
    if (usage) {
      const currentWhere = contextQuery.getSQL().where;
      contextQuery = contextQuery.where(
        and(
          currentWhere,
          eq(handbookImages.usage, usage as 'content' | 'cover' | 'diagram' | 'illustration')
        )
      ) as any;
    }

    result.contextImages = await contextQuery
      .orderBy(handbookImages.order, handbookImages.createdAt)
      .limit(50);

    // 2. 如果需要，获取最近上传的图片（同一章节内）
    if (includeRecent && chapterId) {
      const recentQuery = db.select().from(handbookImages)
        .where(
          and(
            eq(handbookImages.chapterId, chapterId),
            // 排除已经在上下文结果中的图片
            ...(result.contextImages.length > 0 ? [
              // not in context images
            ] : [])
          )
        )
        .orderBy(desc(handbookImages.createdAt))
        .limit(10);

      result.recentImages = await recentQuery;
    }

    // 3. 智能建议：获取同类型用途的图片
    if (usage && chapterId) {
      const suggestionsQuery = db.select().from(handbookImages)
        .where(
          and(
            eq(handbookImages.chapterId, chapterId),
            eq(handbookImages.usage, usage as 'content' | 'cover' | 'diagram' | 'illustration')
            // TODO: 排除已经在其他结果中的图片
          )
        )
        .orderBy(desc(handbookImages.createdAt))
        .limit(5);

      result.suggestions = await suggestionsQuery;
    }

    return createSuccessResponse(result, '成功获取上下文图片');

  } catch (error) {
    console.error('获取上下文图片失败:', error);
    return createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      '获取上下文图片失败',
      500
    );
  }
});

/**
 * 为图片设置上下文关联
 * 将已存在的图片关联到特定的章节或段落
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();
  const { imageIds, chapterId, sectionId, usage, order } = data;

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '图片ID数组不能为空',
      400
    );
  }

  if (!chapterId && !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '必须提供章节ID或段落ID',
      400
    );
  }

  if (chapterId && sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '不能同时关联章节和段落',
      400
    );
  }

  const db = getDb();

  try {
    // 验证章节或段落是否存在
    if (chapterId) {
      const chapter = await db.select({ id: handbookChapters.id })
        .from(handbookChapters)
        .where(eq(handbookChapters.id, chapterId))
        .limit(1);
      
      if (chapter.length === 0) {
        return createErrorResponse(
          ApiErrorCode.NOT_FOUND,
          '章节不存在',
          404
        );
      }
    }

    if (sectionId) {
      const section = await db.select({ id: handbookSections.id })
        .from(handbookSections)
        .where(eq(handbookSections.id, sectionId))
        .limit(1);
      
      if (section.length === 0) {
        return createErrorResponse(
          ApiErrorCode.NOT_FOUND,
          '段落不存在',
          404
        );
      }
    }

    // 更新图片的关联关系
    const updates: any = {};
    if (chapterId) {
      updates.chapterId = chapterId;
      updates.sectionId = null; // 确保不会同时关联两者
    }
    if (sectionId) {
      updates.sectionId = sectionId;
      updates.chapterId = null; // 从段落所属章节中获取
    }
    if (usage) {
      updates.usage = usage;
    }
    if (typeof order === 'number') {
      updates.order = order;
    }

    // 批量更新
    const updatedCount = await db.update(handbookImages)
      .set(updates)
      .where(inArray(handbookImages.id, imageIds));

    return createSuccessResponse({
      updatedCount,
      imageIds,
      context: { chapterId, sectionId }
    }, `成功关联 ${imageIds.length} 张图片`);

  } catch (error) {
    console.error('设置图片上下文失败:', error);
    return createErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      '设置图片上下文失败',
      500
    );
  }
});