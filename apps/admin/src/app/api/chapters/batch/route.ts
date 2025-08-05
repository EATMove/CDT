import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters } from 'database';
import { eq, inArray } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode, UpdateChapterStatusSchema } from 'shared';

// 批量更新章节状态
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();
  const { chapterIds, publishStatus, versionNote } = data;

  if (!chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter IDs array is required',
      400
    );
  }

  // 验证状态
  const validatedData = UpdateChapterStatusSchema.parse({
    publishStatus,
    versionNote,
  });

  const db = getDb();

  // 检查所有章节是否存在
  const existingChapters = await db
    .select({ id: handbookChapters.id })
    .from(handbookChapters)
    .where(inArray(handbookChapters.id, chapterIds));

  if (existingChapters.length !== chapterIds.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Some chapters not found',
      404
    );
  }

  // 批量更新章节状态
  const updateData: any = {
    publishStatus: validatedData.publishStatus,
    updatedAt: new Date(),
  };

  // 如果设置为已发布，设置发布时间
  if (validatedData.publishStatus === 'PUBLISHED') {
    updateData.publishedAt = new Date();
  }

  const updatedChapters = await db
    .update(handbookChapters)
    .set(updateData)
    .where(inArray(handbookChapters.id, chapterIds))
    .returning();

  return createSuccessResponse({
    updatedCount: updatedChapters.length,
    chapters: updatedChapters,
  }, `Successfully updated ${updatedChapters.length} chapters`);
});

// 批量删除章节
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();
  const { chapterIds } = data;

  if (!chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter IDs array is required',
      400
    );
  }

  const db = getDb();

  // 检查所有章节是否存在
  const existingChapters = await db
    .select({ id: handbookChapters.id })
    .from(handbookChapters)
    .where(inArray(handbookChapters.id, chapterIds));

  if (existingChapters.length !== chapterIds.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Some chapters not found',
      404
    );
  }

  // 批量删除章节
  await db
    .delete(handbookChapters)
    .where(inArray(handbookChapters.id, chapterIds));

  return createSuccessResponse({
    deletedCount: chapterIds.length,
    deletedIds: chapterIds,
  }, `Successfully deleted ${chapterIds.length} chapters`);
}); 