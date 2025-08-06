import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters, handbookSections, handbookImages } from 'database';
import { eq, and, or, isNull, desc, inArray } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

interface RouteParams {
  params: {
    id: string;
  };
}

// 移动端获取章节内容
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
    const { id } = await params;

    if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  const { searchParams } = new URL(request.url);
  const userType = searchParams.get('userType') || 'FREE'; // FREE, TRIAL, MEMBER
  const language = searchParams.get('language') || 'ZH'; // ZH, EN

  const db = getDb();

  // 获取章节信息
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter not found',
      404
    );
  }

  const chapterData = chapter[0];

  // 检查章节发布状态
  if (chapterData.publishStatus !== 'PUBLISHED') {
    return createErrorResponse(
      ApiErrorCode.FORBIDDEN,
      'Chapter is not published',
      403
    );
  }

  // 检查用户权限
  const canAccess = checkUserAccess(chapterData.paymentType, userType);
  if (!canAccess) {
    return createErrorResponse(
      ApiErrorCode.MEMBERSHIP_REQUIRED,
      'Member access required to view this chapter',
      403
    );
  }

  // 获取章节下的段落
  const sections = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.chapterId, id))
    .orderBy(handbookSections.order);

  // 获取章节相关图片
  const sectionIds = sections.map(s => s.id);
  const chapterImages = await db
    .select({
      id: handbookImages.id,
      filename: handbookImages.filename,
      originalName: handbookImages.originalName,
      fileUrl: handbookImages.fileUrl,
      width: handbookImages.width,
      height: handbookImages.height,
      altText: handbookImages.altText,
      caption: handbookImages.caption,
      captionEn: handbookImages.captionEn,
      usage: handbookImages.usage,
      order: handbookImages.order,
      sectionId: handbookImages.sectionId,
    })
    .from(handbookImages)
    .where(
      or(
        and(
          eq(handbookImages.chapterId, id),
          isNull(handbookImages.sectionId)
        ),
        ...(sectionIds.length > 0 ? [inArray(handbookImages.sectionId, sectionIds)] : [])
      )
    )
    .orderBy(handbookImages.order, desc(handbookImages.createdAt));

  // 根据用户类型过滤段落内容
  const filteredSections = sections.map((section, index) => {
    // 检查段落访问权限
    const canAccessSection = canAccessSectionContent(
      section,
      userType,
      chapterData.freePreviewSections || 0,
      index
    );

    // 获取该段落的相关图片
    const sectionImages = chapterImages
      .filter(img => img.sectionId === section.id)
      .map(img => ({
        id: img.id,
        filename: img.filename,
        originalName: img.originalName,
        fileUrl: img.fileUrl,
        thumbnailUrl: `${img.fileUrl}?w=150&h=150&fit=crop&q=80`,
        smallUrl: `${img.fileUrl}?w=300&h=300&fit=inside&q=85`,
        mediumUrl: `${img.fileUrl}?w=600&h=600&fit=inside&q=90`,
        width: img.width,
        height: img.height,
        altText: language === 'EN' && img.captionEn ? img.captionEn : (img.altText || img.caption),
        caption: language === 'EN' && img.captionEn ? img.captionEn : img.caption,
        usage: img.usage,
        order: img.order,
      }));

    if (!canAccessSection) {
      // 返回预览版本，隐藏完整内容
      return {
        id: section.id,
        title: language === 'EN' && section.titleEn ? section.titleEn : section.title,
        order: section.order,
        isFree: section.isFree,
        isLocked: true,
        content: getPreviewContent(section.content, language),
        wordCount: section.wordCount,
        estimatedReadTime: section.estimatedReadTime,
        images: sectionImages.filter(img => img.usage === 'cover'), // 只显示封面图片
      };
    }

    // 返回完整内容
    return {
      id: section.id,
      title: language === 'EN' && section.titleEn ? section.titleEn : section.title,
      order: section.order,
      isFree: section.isFree,
      isLocked: false,
      content: language === 'EN' && section.contentEn ? section.contentEn : section.content,
      wordCount: section.wordCount,
      estimatedReadTime: section.estimatedReadTime,
      images: sectionImages, // 显示所有相关图片
    };
  });

  // 获取章节级别的图片（不属于特定段落）
  const chapterLevelImages = chapterImages
    .filter(img => !img.sectionId)
    .map(img => ({
      id: img.id,
      filename: img.filename,
      originalName: img.originalName,
      fileUrl: img.fileUrl,
      thumbnailUrl: `${img.fileUrl}?w=150&h=150&fit=crop&q=80`,
      smallUrl: `${img.fileUrl}?w=300&h=300&fit=inside&q=85`,
      mediumUrl: `${img.fileUrl}?w=600&h=600&fit=inside&q=90`,
      width: img.width,
      height: img.height,
      altText: language === 'EN' && img.captionEn ? img.captionEn : (img.altText || img.caption),
      caption: language === 'EN' && img.captionEn ? img.captionEn : img.caption,
      usage: img.usage,
      order: img.order,
    }));

  // 构建响应数据
  const responseData = {
    id: chapterData.id,
    title: language === 'EN' && chapterData.titleEn ? chapterData.titleEn : chapterData.title,
    description: language === 'EN' && chapterData.descriptionEn ? chapterData.descriptionEn : chapterData.description,
    order: chapterData.order,
    estimatedReadTime: chapterData.estimatedReadTime,
    coverImageUrl: chapterData.coverImageUrl,
    coverImageAlt: chapterData.coverImageAlt,
    paymentType: chapterData.paymentType,
    sections: filteredSections,
    images: chapterLevelImages, // 章节级别图片
    totalSections: sections.length,
    freeSections: sections.filter(s => s.isFree).length,
    unlockedSections: filteredSections.filter(s => !s.isLocked).length,
    userCanAccess: canAccess,
  };

  return createSuccessResponse(responseData);
});

/**
 * 检查用户是否可以访问章节
 */
function checkUserAccess(paymentType: string, userType: string): boolean {
  switch (paymentType) {
    case 'FREE':
      return true;
    case 'TRIAL_INCLUDED':
      return ['TRIAL', 'MEMBER'].includes(userType);
    case 'MEMBER_ONLY':
    case 'PREMIUM':
      return userType === 'MEMBER';
    default:
      return false;
  }
}

/**
 * 检查用户是否可以访问段落内容
 */
function canAccessSectionContent(
  section: any,
  userType: string,
  freePreviewSections: number,
  sectionIndex: number
): boolean {
  // 如果段落本身是免费的
  if (section.isFree) {
    return true;
  }

  // 如果在免费预览范围内
  if (sectionIndex < freePreviewSections) {
    return true;
  }

  // 检查用户类型权限
  return section.requiredUserType.includes(userType);
}

/**
 * 获取预览内容（截取前100字）
 */
function getPreviewContent(content: string, language: string): string {
  const plainText = content.replace(/<[^>]*>/g, ''); // 移除HTML标签
  const maxLength = language === 'EN' ? 200 : 100; // 英文允许更多字符
  
  if (plainText.length <= maxLength) {
    return content;
  }
  
  const preview = plainText.substring(0, maxLength);
  return `<p>${preview}...</p><div class="text-muted-foreground text-sm mt-2">Member access required to view full content</div>`;
} 