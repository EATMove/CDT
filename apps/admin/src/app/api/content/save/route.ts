import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections, handbookChapters } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling, validateRequiredFields, generateId } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

interface ContentData {
  chapterId: string;
  sectionId?: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  isPublished: boolean;
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
  order?: number;
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
    const updatedSection = await db
      .update(handbookSections)
      .set({
        title: data.title,
        titleEn: data.titleEn,
        content: data.content,
        contentEn: data.contentEn,
        isFree: data.paymentType === 'FREE',
        requiredUserType: data.paymentType === 'FREE' ? ['FREE'] : ['MEMBER'],
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
    // 创建新段落
    // 获取当前章节的段落数量，用于设置order
    const existingSections = await db
      .select()
      .from(handbookSections)
      .where(eq(handbookSections.chapterId, data.chapterId));

    const order = data.order || existingSections.length + 1;
    const sectionId = generateId();

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
        isFree: data.paymentType === 'FREE',
        requiredUserType: data.paymentType === 'FREE' ? ['FREE'] : ['MEMBER'],
        wordCount: data.content.replace(/<[^>]*>/g, '').length, // 简单的字数统计
        estimatedReadTime: Math.ceil(data.content.replace(/<[^>]*>/g, '').length / 200), // 估算阅读时间（每分钟200字）
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
  }
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