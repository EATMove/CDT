import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { eq, like, desc, asc, inArray } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import { deleteImages } from '@/lib/image-utils';

// 获取图片列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const usage = searchParams.get('usage');
  const chapterId = searchParams.get('chapterId');
  const sectionId = searchParams.get('sectionId');
  const orderBy = searchParams.get('orderBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  const offset = (page - 1) * limit;
  const db = getDb();

  // 构建查询条件
  let whereConditions = [];

  if (search) {
    whereConditions.push(
      like(handbookImages.originalName, `%${search}%`)
    );
  }

  if (usage) {
    whereConditions.push(eq(handbookImages.usage, usage as any));
  }

  if (chapterId) {
    whereConditions.push(eq(handbookImages.chapterId, chapterId));
  }

  if (sectionId) {
    whereConditions.push(eq(handbookImages.sectionId, sectionId));
  }

  // 构建排序
  const orderFunction = order === 'desc' ? desc : asc;
  let orderByClause;
  
  if (orderBy === 'createdAt') {
    orderByClause = orderFunction(handbookImages.createdAt);
  } else if (orderBy === 'filename') {
    orderByClause = orderFunction(handbookImages.filename);
  } else if (orderBy === 'fileSize') {
    orderByClause = orderFunction(handbookImages.fileSize);
  } else {
    orderByClause = desc(handbookImages.createdAt);
  }

  // 执行查询
  const images = await db
    .select()
    .from(handbookImages)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 获取总数
  const allImages = await db.select({ id: handbookImages.id }).from(handbookImages);
  const total = allImages.length;

  return createSuccessResponse({
    data: images,
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

  // 批量删除图片
  export const DELETE = withErrorHandling(async (request: NextRequest) => {
    const data = await request.json();
    const { ids } = data;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Image IDs array is required',
        400
      );
    }

    const result = await deleteImages(ids);

    if (result.success) {
      return createSuccessResponse({
        deletedCount: result.deletedCount,
        deletedIds: ids,
        errors: result.errors,
      }, `成功删除 ${result.deletedCount} 张图片`);
    } else {
      return createErrorResponse(
        ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        '批量删除图片失败，请重试',
        500
      );
    }
  }); 