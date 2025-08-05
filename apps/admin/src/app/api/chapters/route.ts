import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters } from 'database';
import { eq, desc, asc, and } from 'drizzle-orm';
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
      province: validatedData.province,
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
  const province = searchParams.get('province');

  const offset = (page - 1) * limit;
  const db = getDb();

  // 构建查询条件
  let whereConditions = [];
  
  if (status) {
    whereConditions.push(eq(handbookChapters.publishStatus, status as any));
  }
  
  if (province) {
    whereConditions.push(eq(handbookChapters.province, province as any));
  }

  // 构建排序
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

  // 执行查询
  let query = db.select().from(handbookChapters);
  let countQuery = db.select({ id: handbookChapters.id }).from(handbookChapters);
  
  // 应用where条件
  if (whereConditions.length > 0) {
    const whereClause = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);
    query = query.where(whereClause) as any;
    countQuery = countQuery.where(whereClause) as any;
  }

  // 应用排序和分页
  const chapters = await query
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
  
  const allChapters = await countQuery;
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