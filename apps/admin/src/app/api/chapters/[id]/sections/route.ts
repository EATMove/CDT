import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections, handbookChapters } from 'database';
import { eq, and } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling, generateId } from '@/lib/utils';
import { ApiErrorCode, CreateSectionSchema } from 'shared';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取章节下的所有段落
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  const db = getDb();

  // 检查章节是否存在
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

  // 获取段落列表
  const sections = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.chapterId, id))
    .orderBy(handbookSections.order);

  return createSuccessResponse({
    chapter: chapter[0],
    sections,
    totalSections: sections.length,
    freeSections: sections.filter(s => s.isFree).length,
  });
});

// 创建新段落
export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;
  const data = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  // 验证数据
  const validatedData = CreateSectionSchema.parse({
    ...data,
    chapterId: id,
  });

  const db = getDb();

  // 检查章节是否存在
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

  const sectionId = generateId();

  // 创建新段落
  const newSection = await db
    .insert(handbookSections)
    .values({
      id: sectionId,
      chapterId: id,
      title: validatedData.title,
      titleEn: validatedData.titleEn,
      order: validatedData.order,
      content: validatedData.content,
      contentEn: validatedData.contentEn,
      isFree: validatedData.isFree,
      requiredUserType: validatedData.requiredUserType,
      wordCount: validatedData.content.length,
      estimatedReadTime: Math.ceil(validatedData.content.length / 200), // 简单估算：200字符/分钟
    })
    .returning();

  return createSuccessResponse(
    newSection[0],
    '段落创建成功'
  );
}); 