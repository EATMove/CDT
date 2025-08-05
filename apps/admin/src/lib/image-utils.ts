import { del } from '@vercel/blob';
import { getDb } from '@/lib/database';
import { handbookImages } from 'database';
import { eq, inArray } from 'drizzle-orm';

/**
 * 删除单个图片（包括Blob文件和数据库记录）
 */
export async function deleteImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  const db = getDb();

  try {
    // 1. 获取图片信息
    const image = await db
      .select()
      .from(handbookImages)
      .where(eq(handbookImages.id, imageId))
      .limit(1);

    if (!image.length) {
      return { success: false, error: '图片不存在' };
    }

    const imageData = image[0];

    // 2. 删除Blob文件
    if (imageData.filename) {
      try {
        await del(imageData.filename);
      } catch (blobError) {
        console.error(`删除Blob文件失败: ${imageData.filename}`, blobError);
        // 即使Blob删除失败，也继续删除数据库记录
      }
    }

    // 3. 删除数据库记录
    await db
      .delete(handbookImages)
      .where(eq(handbookImages.id, imageId));

    return { success: true };
  } catch (error) {
    console.error('删除图片失败:', error);
    return { success: false, error: '删除图片失败' };
  }
}

/**
 * 批量删除图片（包括Blob文件和数据库记录）
 */
export async function deleteImages(imageIds: string[]): Promise<{ 
  success: boolean; 
  deletedCount: number; 
  errors: string[] 
}> {
  const db = getDb();
  const errors: string[] = [];

  try {
    // 1. 获取所有要删除的图片信息
    const imagesToDelete = await db
      .select()
      .from(handbookImages)
      .where(inArray(handbookImages.id, imageIds));

    // 2. 删除Blob文件
    for (const image of imagesToDelete) {
      if (image.filename) {
        try {
          await del(image.filename);
        } catch (blobError) {
          console.error(`删除Blob文件失败: ${image.filename}`, blobError);
          errors.push(`删除Blob文件失败: ${image.filename}`);
          // 继续删除其他文件，不中断整个流程
        }
      }
    }

    // 3. 删除数据库记录
    for (const imageId of imageIds) {
      try {
        await db
          .delete(handbookImages)
          .where(eq(handbookImages.id, imageId));
      } catch (dbError) {
        console.error(`删除数据库记录失败: ${imageId}`, dbError);
        errors.push(`删除数据库记录失败: ${imageId}`);
      }
    }

    const deletedCount = imageIds.length - errors.length;
    return { 
      success: deletedCount > 0, 
      deletedCount, 
      errors 
    };
  } catch (error) {
    console.error('批量删除图片失败:', error);
    return { 
      success: false, 
      deletedCount: 0, 
      errors: ['批量删除图片失败'] 
    };
  }
}

/**
 * 清理孤立的Blob文件（数据库记录已删除但Blob文件仍存在）
 */
export async function cleanupOrphanedBlobs(): Promise<{ 
  success: boolean; 
  cleanedCount: number; 
  errors: string[] 
}> {
  // 这个函数可以用于定期清理孤立的Blob文件
  // 实现逻辑：获取所有Blob文件，检查数据库中是否存在对应记录
  // 如果不存在，则删除Blob文件
  // 注意：这个功能需要额外的权限和API支持
  
  return { 
    success: true, 
    cleanedCount: 0, 
    errors: ['功能待实现'] 
  };
} 