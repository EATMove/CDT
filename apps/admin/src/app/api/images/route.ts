import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { eq, like, desc, asc, inArray, and, or, isNull, isNotNull } from 'drizzle-orm';
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
  const contextOnly = searchParams.get('contextOnly') === 'true'; // 新增：只返回有上下文的图片

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
    whereConditions.push(eq(handbookImages.usage, usage as 'content' | 'cover' | 'diagram' | 'illustration'));
  }

  // 优化：支持更智能的上下文筛选
  if (chapterId && sectionId) {
    // 如果同时提供章节和段落，优先按段落筛选
    whereConditions.push(eq(handbookImages.sectionId, sectionId));
  } else if (chapterId) {
    // 如果只提供章节，可以选择是否包含其下的段落图片
    const includeSubSections = searchParams.get('includeSubSections') === 'true';
    if (includeSubSections) {
      // 包含章节直属图片和其下段落的图片
      whereConditions.push(
        and(
          eq(handbookImages.chapterId, chapterId),
          // 这里可以通过join来包含段落图片，但为了简化先只查章节直属图片
        )
      );
    } else {
      // 只查章节直属图片（不属于任何段落的图片）
      whereConditions.push(
        and(
          eq(handbookImages.chapterId, chapterId),
          isNull(handbookImages.sectionId)
        )
      );
    }
  } else if (sectionId) {
    whereConditions.push(eq(handbookImages.sectionId, sectionId));
  } else if (contextOnly) {
    // 只返回有上下文关联的图片（排除孤儿图片）
    whereConditions.push(
      or(
        isNotNull(handbookImages.chapterId),
        isNotNull(handbookImages.sectionId)
      )
    );
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
  let query = db.select().from(handbookImages);
  let countQuery = db.select({ id: handbookImages.id }).from(handbookImages);
  
  // 应用where条件
  if (whereConditions.length > 0) {
    const whereClause = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);
    query = query.where(whereClause) as any;
    countQuery = countQuery.where(whereClause) as any;
  }

  // 应用排序和分页
  const images = await query
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 获取总数
  const allImages = await countQuery;
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