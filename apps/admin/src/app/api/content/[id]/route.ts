import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

interface RouteParams {
  params: {
    id: string;
  };
}

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content ID is required',
      400
    );
  }

  const db = getDb();

  // 从数据库获取段落内容
  const section = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.id, id))
    .limit(1);

  if (!section.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content not found',
      404
    );
  }

  return createSuccessResponse(section[0]);
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;
  const data = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content ID is required',
      400
    );
  }

  // 验证必填字段
  if (!data.title || !data.content) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Title and content are required',
      400
    );
  }

  const db = getDb();

  // 检查段落是否存在
  const existingSection = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.id, id))
    .limit(1);

  if (!existingSection.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content not found',
      404
    );
  }

  // 更新段落内容
  const updatedSection = await db
    .update(handbookSections)
    .set({
      title: data.title,
      titleEn: data.titleEn,
      content: data.content,
      contentEn: data.contentEn,
      isFree: data.paymentType === 'FREE',
      requiredUserType: data.paymentType === 'FREE' ? ['FREE'] : ['MEMBER'],
      wordCount: data.content.replace(/<[^>]*>/g, '').length,
      estimatedReadTime: Math.ceil(data.content.replace(/<[^>]*>/g, '').length / 200),
      updatedAt: new Date(),
    })
    .where(eq(handbookSections.id, id))
    .returning();

  return createSuccessResponse(
    updatedSection[0],
    'Content updated successfully'
  );
});

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content ID is required',
      400
    );
  }

  const db = getDb();

  // 检查段落是否存在
  const existingSection = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.id, id))
    .limit(1);

  if (!existingSection.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content not found',
      404
    );
  }

  // 删除段落
  await db
    .delete(handbookSections)
    .where(eq(handbookSections.id, id));

  return createSuccessResponse(
    { id, deleted: true },
    'Content deleted successfully'
  );
}); 