import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters } from 'database';
import { eq, like, desc, asc, and, or } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode, HandbookSearchSchema } from 'shared';

// 搜索章节
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // 解析搜索参数
  const searchQuery = searchParams.get('query') || '';
  const paymentType = searchParams.get('paymentType');
  const publishStatus = searchParams.get('publishStatus');
  const province = searchParams.get('province');
  const authorId = searchParams.get('authorId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const orderBy = searchParams.get('orderBy') || 'order';
  const order = searchParams.get('order') || 'asc';

  const offset = (page - 1) * limit;
  const db = getDb();

  // 构建查询条件
  let whereConditions = [];

  // 文本搜索
  if (searchQuery) {
    whereConditions.push(
      or(
        like(handbookChapters.title, `%${searchQuery}%`),
        like(handbookChapters.titleEn, `%${searchQuery}%`),
        like(handbookChapters.description, `%${searchQuery}%`),
        like(handbookChapters.descriptionEn, `%${searchQuery}%`)
      )
    );
  }

  // 付费类型过滤
  if (paymentType) {
    whereConditions.push(eq(handbookChapters.paymentType, paymentType as any));
  }

  // 发布状态过滤
  if (publishStatus) {
    whereConditions.push(eq(handbookChapters.publishStatus, publishStatus as any));
  }

  // 省份过滤
  if (province) {
    whereConditions.push(eq(handbookChapters.province, province as any));
  }

  // 作者过滤
  if (authorId) {
    whereConditions.push(eq(handbookChapters.authorId, authorId));
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
  } else if (orderBy === 'title') {
    orderByClause = orderFunction(handbookChapters.title);
  } else {
    orderByClause = asc(handbookChapters.order);
  }

  // 执行查询
  let dbQuery = db.select().from(handbookChapters);
  let countQuery = db.select({ id: handbookChapters.id }).from(handbookChapters);
  
  // 应用where条件
  if (whereConditions.length > 0) {
    const whereClause = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);
    dbQuery = dbQuery.where(whereClause) as any;
    countQuery = countQuery.where(whereClause) as any;
  }

  // 应用排序和分页
  const chapters = await dbQuery
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 获取总数
  const allChapters = await countQuery;
  const total = allChapters.length;

  // 统计信息
  const stats = {
    total,
    byProvince: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byPaymentType: {} as Record<string, number>,
  };

  // 获取统计信息（简化版本）
  const allChaptersForStats = await db.select({
    province: handbookChapters.province,
    publishStatus: handbookChapters.publishStatus,
    paymentType: handbookChapters.paymentType,
  }).from(handbookChapters);

  allChaptersForStats.forEach(chapter => {
    stats.byProvince[chapter.province] = (stats.byProvince[chapter.province] || 0) + 1;
    stats.byStatus[chapter.publishStatus] = (stats.byStatus[chapter.publishStatus] || 0) + 1;
    stats.byPaymentType[chapter.paymentType] = (stats.byPaymentType[chapter.paymentType] || 0) + 1;
  });

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
    stats,
    searchParams: {
      query: searchQuery,
      paymentType,
      publishStatus,
      province,
      authorId,
    },
  });
}); 