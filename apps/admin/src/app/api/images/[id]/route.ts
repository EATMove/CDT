import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import { deleteImage } from '@/lib/image-utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取单个图片详情
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Image ID is required',
      400
    );
  }

  const db = getDb();

  const image = await db
    .select()
    .from(handbookImages)
    .where(eq(handbookImages.id, id))
    .limit(1);

  if (!image.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Image not found',
      404
    );
  }

  return createSuccessResponse(image[0]);
});

// 更新图片信息
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params;
  const data = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Image ID is required',
      400
    );
  }

  const db = getDb();

  // 检查图片是否存在
  const existingImage = await db
    .select()
    .from(handbookImages)
    .where(eq(handbookImages.id, id))
    .limit(1);

  if (!existingImage.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Image not found',
      404
    );
  }

  // 更新图片信息
  const updatedImage = await db
    .update(handbookImages)
    .set({
      altText: data.altText,
      caption: data.caption,
      captionEn: data.captionEn,
      usage: data.usage,
      order: data.order,
    })
    .where(eq(handbookImages.id, id))
    .returning();

  return createSuccessResponse(
    updatedImage[0],
    'Image updated successfully'
  );
});

  // 删除图片
  export const DELETE = withErrorHandling(async (
    request: NextRequest,
    { params }: RouteParams
  ) => {
    const { id } = params;

    if (!id) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Image ID is required',
        400
      );
    }

    const result = await deleteImage(id);

    if (result.success) {
      return createSuccessResponse(
        { id, deleted: true },
        '图片删除成功'
      );
    } else {
      return createErrorResponse(
        ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        result.error || '删除图片失败，请重试',
        500
      );
    }
  }); 