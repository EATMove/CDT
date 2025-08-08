import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { createSuccessResponse, createErrorResponse, withErrorHandling, generateId } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import { eq } from 'drizzle-orm';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const formData = await request.formData();
  const fd: any = formData as any;
  const file = fd.get('file') as File;
  const chapterId = (fd.get('chapterId') as string) || '';
  const sectionId = (fd.get('sectionId') as string) || '';
  const altText = (fd.get('altText') as string) || '';
  const caption = (fd.get('caption') as string) || '';
  const captionEn = (fd.get('captionEn') as string) || '';
  const usage = (fd.get('usage') as string) || 'content';
  const explicitId = (fd.get('id') as string) || '';

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

  // 章节和段落ID是可选的，用于关联图片
  // 但由于数据库约束，如果都没有提供，我们需要允许创建孤儿图片
  // 注意：这需要临时移除数据库约束或者提供默认值

  try {
    const db = getDb();

    // 计算默认ID
    let imageId: string;
    if (explicitId && explicitId.trim()) {
      const candidate = explicitId.trim();
      const valid = /^img-[a-z0-9_-]{3,64}$/i.test(candidate);
      if (!valid) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Invalid image id format. Expect: img-<slug> (3-64 chars [a-zA-Z0-9_-])',
          400
        );
      }
      const dup = await db
        .select()
        .from(handbookImages)
        .where(eq(handbookImages.id, candidate))
        .limit(1);
      if (dup.length) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Image ID already exists',
          400
        );
      }
      imageId = candidate;
    } else {
      let existingImages: any[] = [];
      if (sectionId) {
        existingImages = await db
          .select({ id: handbookImages.id })
          .from(handbookImages)
          .where(eq(handbookImages.sectionId, sectionId));
      } else if (chapterId) {
        existingImages = await db
          .select({ id: handbookImages.id })
          .from(handbookImages)
          .where(eq(handbookImages.chapterId, chapterId));
      }
      const seq = (existingImages.length + 1).toString().padStart(3, '0');
      const base = (sectionId || chapterId || 'global').replace(/[^a-z0-9_-]+/gi, '-');
      imageId = `img-${base}-${seq}`;
    }

    // 生成文件名并上传
    const fileExtension = file.name.split('.').pop();
    const fileName = `handbook/${imageId}.${fileExtension}`;
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

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
    // 如果没有提供上下文关联，创建为孤儿图片（稍后可以通过其他API关联）
    const insertData: any = {
      id: imageId,
      filename: fileName,
      originalName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      altText: altText || null,
      caption: caption || null,
      captionEn: captionEn || null,
      usage: usage as 'content' | 'cover' | 'diagram' | 'illustration',
      order,
      // uploadedBy: user.id, // TODO: 从认证中获取
    };

    // 只有在提供了上下文时才添加关联字段
    if (chapterId || sectionId) {
      insertData.chapterId = chapterId || null;
      insertData.sectionId = sectionId || null;
    }

    const newImage = await db
      .insert(handbookImages)
      .values(insertData)
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
    }, '图片上传成功');

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