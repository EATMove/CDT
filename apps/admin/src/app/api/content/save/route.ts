import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections, handbookChapters } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling, validateRequiredFields, generateId } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

interface ContentData {
  chapterId: string;
  sectionId?: string; // 创建时将使用该ID；更新时用于定位段落
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  isPublished: boolean; // 已保留字段，但当前不参与持久化
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
  order?: number;
  estimatedReadTime?: number; // 分钟；若未提供则按字数估算
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  const data: ContentData = await request.json();

  // 验证必填字段
  validateRequiredFields(data, ['title', 'content', 'chapterId']);

  // 验证HTML内容（基本检查）
  if (data.content.length < 10) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Content is too short, please enter more content',
      400
    );
  }

  const db = getDb();

  // 验证章节是否存在
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, data.chapterId))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter not found',
      400
    );
  }

  // 如果有sectionId，则更新现有段落，否则创建新段落
  if (data.sectionId) {
    // 更新现有段落
    const isFree = data.paymentType === 'FREE';
    const requiredUserType = isFree ? ['FREE'] : ['MEMBER'];
    const computedMinutes = Math.ceil(data.content.replace(/<[^>]*>/g, '').length / 200);
    const estimatedReadTime = Number.isFinite(data.estimatedReadTime as number)
      ? Number(data.estimatedReadTime)
      : computedMinutes;
    const updatedSection = await db
      .update(handbookSections)
      .set({
        title: data.title,
        titleEn: data.titleEn,
        content: data.content,
        contentEn: data.contentEn,
        isFree,
        requiredUserType,
        // 若提供，则更新顺序
        order: typeof data.order === 'number' ? data.order : undefined,
        estimatedReadTime,
        wordCount: data.content.replace(/<[^>]*>/g, '').length,
        updatedAt: new Date(),
      })
      .where(eq(handbookSections.id, data.sectionId))
      .returning();

    if (!updatedSection.length) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Section not found',
        400
      );
    }

    return createSuccessResponse(
      {
        id: data.sectionId,
        type: 'section',
        action: 'updated',
      },
      'Section updated successfully'
    );
  } else {
    // 创建新段落（要求提供合法的 sectionId）
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section ID is required when creating a new section',
      400
    );
  }
});

// 备用路径：允许创建时显式提供 sectionId（向后兼容此前未提供 sectionId 的调用者可逐步迁移）
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const data: ContentData = await request.json();

  // 验证必填字段
  validateRequiredFields(data, ['title', 'content', 'chapterId', 'sectionId']);

  const db = getDb();

  // 验证章节是否存在
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, data.chapterId))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter not found',
      400
    );
  }

  // 如果已存在则更新，否则创建
  const existing = await db
    .select({ id: handbookSections.id })
    .from(handbookSections)
    .where(eq(handbookSections.id, data.sectionId!));

  if (existing.length) {
    const isFree = data.paymentType === 'FREE';
    const requiredUserType = isFree ? ['FREE'] : ['MEMBER'];
    const computedMinutes = Math.ceil(data.content.replace(/<[^>]*>/g, '').length / 200);
    const estimatedReadTime = Number.isFinite(data.estimatedReadTime as number)
      ? Number(data.estimatedReadTime)
      : computedMinutes;

    const updated = await db
      .update(handbookSections)
      .set({
        title: data.title,
        titleEn: data.titleEn,
        content: data.content,
        contentEn: data.contentEn,
        isFree,
        requiredUserType,
        order: typeof data.order === 'number' ? data.order : undefined,
        estimatedReadTime,
        wordCount: data.content.replace(/<[^>]*>/g, '').length,
        updatedAt: new Date(),
      })
      .where(eq(handbookSections.id, data.sectionId!))
      .returning();

    return createSuccessResponse(
      {
        id: data.sectionId,
        type: 'section',
        action: 'updated',
      },
      'Section updated successfully'
    );
  }

  // 新建（带自定义ID）
  const sectionId = data.sectionId!;
  const idValid = /^sec-[a-z]{2}-\d{3}-\d{3}$/i.test(sectionId);
  if (!idValid) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Invalid sectionId format. Expect: sec-<province>-<chapterNo>-<sectionNo>',
      400
    );
  }

  const chapMatch = /^ch-([a-z]{2})-(\d{3})$/i.exec(chapter[0].id);
  const secMatch = /^sec-([a-z]{2})-(\d{3})-(\d{3})$/i.exec(sectionId);
  if (!chapMatch || !secMatch || chapMatch[1].toLowerCase() !== secMatch[1].toLowerCase() || chapMatch[2] !== secMatch[2]) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section ID does not match the chapter ID',
      400
    );
  }

  const dup = await db
    .select({ id: handbookSections.id })
    .from(handbookSections)
    .where(eq(handbookSections.id, sectionId));
  if (dup.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Section ID already exists',
      400
    );
  }

  // 获取当前章节的段落数量，用于设置order
    const existingSections = await db
      .select()
      .from(handbookSections)
      .where(eq(handbookSections.chapterId, data.chapterId));

    const order = data.order || existingSections.length + 1;
    const isFree = data.paymentType === 'FREE';
    const requiredUserType = isFree ? ['FREE'] : ['MEMBER'];
    const computedMinutes = Math.ceil(data.content.replace(/<[^>]*>/g, '').length / 200);
    const estimatedReadTime = Number.isFinite(data.estimatedReadTime as number)
      ? Number(data.estimatedReadTime)
      : computedMinutes;

    const newSection = await db
      .insert(handbookSections)
      .values({
        id: sectionId,
        chapterId: data.chapterId,
        title: data.title,
        titleEn: data.titleEn,
        order,
        content: data.content,
        contentEn: data.contentEn,
        isFree,
        requiredUserType,
        wordCount: data.content.replace(/<[^>]*>/g, '').length, // 简单的字数统计
        estimatedReadTime,
      })
      .returning();

  return createSuccessResponse(
    {
      id: sectionId,
      type: 'section',
      action: 'created',
    },
    'Section created successfully'
  );
});

// 获取所有内容列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const db = getDb();

  // 构建查询条件
  let whereCondition;
  if (chapterId) {
    whereCondition = eq(handbookSections.chapterId, chapterId);
  }

  // 获取段落列表
  let sections: any[];
  let total: number;

  if (chapterId) {
    sections = await db
      .select({
        id: handbookSections.id,
        chapterId: handbookSections.chapterId,
        title: handbookSections.title,
        titleEn: handbookSections.titleEn,
        order: handbookSections.order,
        isFree: handbookSections.isFree,
        wordCount: handbookSections.wordCount,
        estimatedReadTime: handbookSections.estimatedReadTime,
        createdAt: handbookSections.createdAt,
        updatedAt: handbookSections.updatedAt,
      })
      .from(handbookSections)
      .where(eq(handbookSections.chapterId, chapterId))
      .orderBy(handbookSections.order)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: handbookSections.id })
      .from(handbookSections)
      .where(eq(handbookSections.chapterId, chapterId));
    total = totalResult.length;
  } else {
    sections = await db
      .select({
        id: handbookSections.id,
        chapterId: handbookSections.chapterId,
        title: handbookSections.title,
        titleEn: handbookSections.titleEn,
        order: handbookSections.order,
        isFree: handbookSections.isFree,
        wordCount: handbookSections.wordCount,
        estimatedReadTime: handbookSections.estimatedReadTime,
        createdAt: handbookSections.createdAt,
        updatedAt: handbookSections.updatedAt,
      })
      .from(handbookSections)
      .orderBy(handbookSections.order)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: handbookSections.id })
      .from(handbookSections);
    total = totalResult.length;
  }

  return createSuccessResponse({
    data: sections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
}); 