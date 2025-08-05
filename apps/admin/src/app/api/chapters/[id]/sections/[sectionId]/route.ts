import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections, handbookChapters } from 'database';
import { eq, and } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode, CreateSectionSchema } from 'shared';

interface RouteParams {
  params: {
    id: string;
    sectionId: string;
  };
}

// 获取单个段落详情
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id, sectionId } = params;

  if (!id || !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID and Section ID are required',
      400
    );
  }

  const db = getDb();

  // 获取段落信息
  const section = await db
    .select()
    .from(handbookSections)
    .where(
      and(
        eq(handbookSections.id, sectionId),
        eq(handbookSections.chapterId, id)
      )
    )
    .limit(1);

  if (!section.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section not found',
      404
    );
  }

  return createSuccessResponse(section[0]);
});

// 更新段落
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id, sectionId } = params;
  const data = await request.json();

  if (!id || !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID and Section ID are required',
      400
    );
  }

  // 验证数据
  const validatedData = CreateSectionSchema.partial().parse(data);

  const db = getDb();

  // 检查段落是否存在
  const existingSection = await db
    .select()
    .from(handbookSections)
    .where(
      and(
        eq(handbookSections.id, sectionId),
        eq(handbookSections.chapterId, id)
      )
    )
    .limit(1);

  if (!existingSection.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section not found',
      404
    );
  }

  // 更新段落
  const updatedSection = await db
    .update(handbookSections)
    .set({
      ...validatedData,
      wordCount: validatedData.content ? validatedData.content.length : undefined,
      estimatedReadTime: validatedData.content ? Math.ceil(validatedData.content.length / 200) : undefined,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(handbookSections.id, sectionId),
        eq(handbookSections.chapterId, id)
      )
    )
    .returning();

  return createSuccessResponse(
    updatedSection[0],
    'Section updated successfully'
  );
});

// 删除段落
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id, sectionId } = params;

  if (!id || !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID and Section ID are required',
      400
    );
  }

  const db = getDb();

  // 检查段落是否存在
  const existingSection = await db
    .select()
    .from(handbookSections)
    .where(
      and(
        eq(handbookSections.id, sectionId),
        eq(handbookSections.chapterId, id)
      )
    )
    .limit(1);

  if (!existingSection.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section not found',
      404
    );
  }

  // 删除段落
  await db
    .delete(handbookSections)
    .where(
      and(
        eq(handbookSections.id, sectionId),
        eq(handbookSections.chapterId, id)
      )
    );

  return createSuccessResponse(
    { id: sectionId, deleted: true },
    'Section deleted successfully'
  );
}); 