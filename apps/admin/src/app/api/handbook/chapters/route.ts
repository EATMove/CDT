import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters } from 'database';
import { eq, desc, asc } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling, validateRequiredFields, generateId } from '@/lib/utils';
import { ApiErrorCode, CreateChapterSchema } from 'shared';

// 创建章节
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();

  // 使用Zod验证数据
  const validatedData = CreateChapterSchema.parse(data);

  const db = getDb();
  const chapterId = generateId();

  // 创建新章节
  const newChapter = await db
    .insert(handbookChapters)
    .values({
      id: chapterId,
      title: validatedData.title,
      titleEn: validatedData.titleEn,
      description: validatedData.description,
      descriptionEn: validatedData.descriptionEn,
      order: validatedData.order,
      contentFormat: validatedData.contentFormat,
      estimatedReadTime: validatedData.estimatedReadTime,
      coverImageUrl: validatedData.coverImageUrl,
      coverImageAlt: validatedData.coverImageAlt,
      paymentType: validatedData.paymentType,
      freePreviewSections: validatedData.freePreviewSections,
      prerequisiteChapters: validatedData.prerequisiteChapters,
      publishStatus: 'DRAFT',
      // authorId: user.id, // TODO: 从认证中获取
    })
    .returning();

  return createSuccessResponse(
    newChapter[0],
    '章节创建成功'
  );
});

// 获取章节列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const orderBy = searchParams.get('orderBy') || 'order';
  const order = searchParams.get('order') || 'asc';
  const status = searchParams.get('status');

  const offset = (page - 1) * limit;
  const db = getDb();

  // 构建查询
  let chapters: any[];
  
  if (status) {
    const orderFunction = order === 'desc' ? desc : asc;
    let orderByClause;
    
    if (orderBy === 'order') {
      orderByClause = orderFunction(handbookChapters.order);
    } else if (orderBy === 'createdAt') {
      orderByClause = orderFunction(handbookChapters.createdAt);
    } else if (orderBy === 'updatedAt') {
      orderByClause = orderFunction(handbookChapters.updatedAt);
    } else {
      orderByClause = asc(handbookChapters.order);
    }

    chapters = await db
      .select()
      .from(handbookChapters)
      .where(eq(handbookChapters.publishStatus, status as any))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
  } else {
    const orderFunction = order === 'desc' ? desc : asc;
    let orderByClause;
    
    if (orderBy === 'order') {
      orderByClause = orderFunction(handbookChapters.order);
    } else if (orderBy === 'createdAt') {
      orderByClause = orderFunction(handbookChapters.createdAt);
    } else if (orderBy === 'updatedAt') {
      orderByClause = orderFunction(handbookChapters.updatedAt);
    } else {
      orderByClause = asc(handbookChapters.order);
    }

    chapters = await db
      .select()
      .from(handbookChapters)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
  }

  // 获取总数 (简化版本)
  const allChapters = await db.select({ id: handbookChapters.id }).from(handbookChapters);
  const total = allChapters.length;

  return createSuccessResponse({
    data: chapters,
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