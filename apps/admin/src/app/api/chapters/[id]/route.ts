import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters, handbookSections, handbookImages, readingRecords, bookmarks, handbookContentVersions } from 'database';
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
  const { id } = await params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
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
      'Chapter not found',
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
  const { id } = await params;
  const rawData = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  // 仅允许白名单内的字段被更新，并移除为 null/undefined 的字段，避免 Zod 校验报错
  const allowedFields = [
    'title',
    'titleEn',
    'description',
    'descriptionEn',
    'order',
    'province',
    'contentFormat',
    'estimatedReadTime',
    'coverImageUrl',
    'coverImageAlt',
    'paymentType',
    'freePreviewSections',
    'prerequisiteChapters',
    'publishStatus',
    'publishedAt',
  ] as const;

  const sanitizedInput: Record<string, unknown> = {};
  for (const key of allowedFields) {
    const value = rawData[key as keyof typeof rawData];
    // 将空字符串视为未提供，避免如 coverImageUrl 对空串做 URL 校验
    if (value === '' || value === null || value === undefined) continue;
    sanitizedInput[key] = value;
  }

  // 验证数据（partial 允许只传部分字段）
  const validatedData = CreateChapterSchema.partial().parse(sanitizedInput);

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
      'Chapter not found',
      404
    );
  }

  // 若请求中包含新的 id 字段，支持重命名章节ID（需唯一且格式有效）
  if (typeof (rawData?.id) === 'string' && rawData.id.trim() && rawData.id.trim() !== id) {
    const newId = rawData.id.trim();
    const valid = /^ch-[a-z]{2}-\d{3}$/i.test(newId) || /^[a-zA-Z0-9_-]{3,36}$/.test(newId);
    if (!valid) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid chapter id format. Use ch-<province>-<nnn> or 3-36 chars [a-zA-Z0-9_-]'
      );
    }
    const dup = await db
      .select()
      .from(handbookChapters)
      .where(eq(handbookChapters.id, newId))
      .limit(1);
    if (dup.length) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Chapter ID already exists'
      );
    }

    // 事务：复制章节为新ID，迁移所有外键引用，然后删除旧章节
    await db.transaction(async (tx) => {
      const current = existingChapter[0];
      // 创建新章节记录（复制旧数据）
      await tx
        .insert(handbookChapters)
        .values({
          id: newId,
          title: (current as any).title,
          titleEn: (current as any).titleEn,
          description: (current as any).description,
          descriptionEn: (current as any).descriptionEn,
          order: (current as any).order,
          province: (current as any).province,
          contentFormat: (current as any).contentFormat,
          estimatedReadTime: (current as any).estimatedReadTime,
          coverImageUrl: (current as any).coverImageUrl,
          coverImageAlt: (current as any).coverImageAlt,
          paymentType: (current as any).paymentType,
          freePreviewSections: (current as any).freePreviewSections,
          prerequisiteChapters: (current as any).prerequisiteChapters,
          publishStatus: (current as any).publishStatus,
          publishedAt: (current as any).publishedAt,
          authorId: (current as any).authorId,
          lastEditedBy: (current as any).lastEditedBy,
          createdAt: (current as any).createdAt,
          updatedAt: new Date(),
        });

      // 迁移所有引用
      await tx.update(handbookSections).set({ chapterId: newId }).where(eq(handbookSections.chapterId, id));
      await tx.update(handbookImages).set({ chapterId: newId }).where(eq(handbookImages.chapterId, id));
      await tx.update(readingRecords).set({ chapterId: newId }).where(eq(readingRecords.chapterId, id));
      await tx.update(bookmarks).set({ chapterId: newId }).where(eq(bookmarks.chapterId, id));
      await tx.update(handbookContentVersions).set({ chapterId: newId }).where(eq(handbookContentVersions.chapterId, id));

      // 删除旧章节
      await tx.delete(handbookChapters).where(eq(handbookChapters.id, id));
    });

    return createSuccessResponse({ id: newId }, 'Chapter ID updated successfully');
  }

  // 更新其他字段
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
    'Chapter updated successfully'
  );
});

// 删除章节
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = await params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
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
      'Chapter not found',
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
      'Cannot delete: There are sections under this chapter, please delete all sections first',
      400
    );
  }

  // 删除章节
  await db
    .delete(handbookChapters)
    .where(eq(handbookChapters.id, id));

  return createSuccessResponse(
    { id, deleted: true },
    'Chapter deleted successfully'
  );
}); 