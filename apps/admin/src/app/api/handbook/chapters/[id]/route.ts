import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters, handbookSections } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode, CreateChapterSchema } from 'shared';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取单个章节详情（包含段落）
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '缺少章节ID',
      400
    );
  }

  const db = getDb();

  // 获取章节信息
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '章节不存在',
      404
    );
  }

  // 获取章节下的段落
  const sections = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.chapterId, id))
    .orderBy(handbookSections.order);

  // 组合数据
  const chapterWithSections = {
    ...chapter[0],
    sections,
    totalSections: sections.length,
    freeSections: sections.filter(s => s.isFree).length,
  };

  return createSuccessResponse(chapterWithSections);
});

// 更新章节
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;
  const data = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '缺少章节ID',
      400
    );
  }

  // 验证数据
  const validatedData = CreateChapterSchema.partial().parse(data);

  const db = getDb();

  // 检查章节是否存在
  const existingChapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!existingChapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '章节不存在',
      404
    );
  }

  // 更新章节
  const updatedChapter = await db
    .update(handbookChapters)
    .set({
      ...validatedData,
      updatedAt: new Date(),
    })
    .where(eq(handbookChapters.id, id))
    .returning();

  return createSuccessResponse(
    updatedChapter[0],
    '章节更新成功'
  );
});

// 删除章节
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '缺少章节ID',
      400
    );
  }

  const db = getDb();

  // 检查章节是否存在
  const existingChapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!existingChapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '章节不存在',
      404
    );
  }

  // 检查是否有关联的段落
  const sectionsCount = await db
    .select({ id: handbookSections.id })
    .from(handbookSections)
    .where(eq(handbookSections.chapterId, id));

  if (sectionsCount.length > 0) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      '无法删除：该章节下还有段落内容，请先删除所有段落',
      400
    );
  }

  // 删除章节
  await db
    .delete(handbookChapters)
    .where(eq(handbookChapters.id, id));

  return createSuccessResponse(
    { id, deleted: true },
    '章节删除成功'
  );
}); 