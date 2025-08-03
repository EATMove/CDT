import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { createSuccessResponse, createErrorResponse, withErrorHandling, generateId } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import { eq } from 'drizzle-orm';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const chapterId = formData.get('chapterId') as string;
  const sectionId = formData.get('sectionId') as string;
  const altText = formData.get('altText') as string;
  const caption = formData.get('caption') as string;
  const captionEn = formData.get('captionEn') as string;
  const usage = (formData.get('usage') as string) || 'content';

  if (!file) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Please select a file to upload',
      400
    );
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Unsupported file format, please upload JPG, PNG, WebP, or GIF images',
      400
    );
  }

  // 验证文件大小 (4MB)
  const maxSize = 4 * 1024 * 1024;
  if (file.size > maxSize) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'File size cannot exceed 4MB',
      400
    );
  }

  // 验证必须关联到章节或段落
  if (!chapterId && !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Image must be associated with a chapter or section',
      400
    );
  }

  try {
    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop();
    const fileName = `handbook/${generateId()}.${fileExtension}`;
    
    // 上传到 Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    const db = getDb();
    const imageId = generateId();

         // 获取当前关联的图片数量，用于设置order
     let existingImages: any[] = [];
     if (chapterId) {
       existingImages = await db
         .select({ id: handbookImages.id })
         .from(handbookImages)
         .where(eq(handbookImages.chapterId, chapterId));
     } else if (sectionId) {
       existingImages = await db
         .select({ id: handbookImages.id })
         .from(handbookImages)
         .where(eq(handbookImages.sectionId, sectionId));
     }

    const order = existingImages.length;

    // 保存图片信息到数据库
    const newImage = await db
      .insert(handbookImages)
      .values({
        id: imageId,
        chapterId: chapterId || null,
        sectionId: sectionId || null,
        filename: fileName,
        originalName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
        altText: altText || null,
        caption: caption || null,
        captionEn: captionEn || null,
        usage: usage as any,
        order,
        // uploadedBy: user.id, // TODO: 从认证中获取
      })
      .returning();

    return createSuccessResponse({
      id: imageId,
      filename: fileName,
      originalName: file.name,
      url: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      altText,
      caption,
      captionEn,
      usage,
      order,
    }, 'Image uploaded successfully');

  } catch (error) {
    console.error('Image upload failed:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Image upload failed, please try again',
      500
    );
  }
});

// 获取图片列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const sectionId = searchParams.get('sectionId');
  const usage = searchParams.get('usage');

  if (!chapterId && !sectionId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID or section ID must be specified',
      400
    );
  }

     const db = getDb();
   
   // Simplified query logic
   let images: any[];
   
   if (chapterId && usage) {
     images = await db
       .select()
       .from(handbookImages)
       .where(eq(handbookImages.chapterId, chapterId))
       .orderBy(handbookImages.order);
     images = images.filter(img => img.usage === usage);
   } else if (sectionId && usage) {
     images = await db
       .select()
       .from(handbookImages)
       .where(eq(handbookImages.sectionId, sectionId))
       .orderBy(handbookImages.order);
     images = images.filter(img => img.usage === usage);
   } else if (chapterId) {
     images = await db
       .select()
       .from(handbookImages)
       .where(eq(handbookImages.chapterId, chapterId))
       .orderBy(handbookImages.order);
   } else if (sectionId) {
     images = await db
       .select()
       .from(handbookImages)
       .where(eq(handbookImages.sectionId, sectionId))
       .orderBy(handbookImages.order);
   } else {
     images = [];
   }

  return createSuccessResponse({
    images,
    total: images.length,
  });
}); 