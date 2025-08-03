import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookChapters, handbookSections } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, withErrorHandling } from '@/lib/utils';

// 移动端获取章节列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userType = searchParams.get('userType') || 'FREE'; // FREE, TRIAL, MEMBER
  const language = searchParams.get('language') || 'ZH'; // ZH, EN
  const province = searchParams.get('province') || 'ON'; // AB, BC, ON

  const db = getDb();

  // 获取已发布的章节列表
  const chapters = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.publishStatus, 'PUBLISHED'))
    .orderBy(handbookChapters.order);

  // 为每个章节获取段落信息并计算访问权限
  const chaptersWithAccess = await Promise.all(
    chapters.map(async (chapter) => {
      // 获取章节下的段落数量
      const sections = await db
        .select()
        .from(handbookSections)
        .where(eq(handbookSections.chapterId, chapter.id));

      // 计算用户可访问的段落数量
      const totalSections = sections.length;
      const freeSections = sections.filter(s => s.isFree).length;
      const freePreviewSections = chapter.freePreviewSections || 0;
      
      // 检查章节访问权限
      const canAccessChapter = checkChapterAccess(chapter.paymentType, userType);
      
      // 计算可访问的段落数量
      let accessibleSections = 0;
      if (canAccessChapter) {
        accessibleSections = totalSections;
      } else {
        // 免费用户可以访问：免费段落 + 预览段落
        accessibleSections = freeSections + Math.min(freePreviewSections, totalSections - freeSections);
      }

      // 计算学习状态
      const status = getChapterStatus(canAccessChapter, accessibleSections, totalSections);

      return {
        id: chapter.id,
        title: language === 'EN' && chapter.titleEn ? chapter.titleEn : chapter.title,
        description: language === 'EN' && chapter.descriptionEn ? chapter.descriptionEn : chapter.description,
        order: chapter.order,
        estimatedReadTime: chapter.estimatedReadTime,
        coverImageUrl: chapter.coverImageUrl,
        coverImageAlt: chapter.coverImageAlt,
        paymentType: chapter.paymentType,
        
        // 访问权限信息
        canAccess: canAccessChapter,
        status, // LOCKED, UNLOCKED, IN_PROGRESS, COMPLETED
        
        // 段落统计
        totalSections,
        freeSections,
        accessibleSections,
        freePreviewSections,
        
        // 学习进度（暂时返回0，后续可以从progress表获取）
        completedSections: 0,
        readingProgress: 0, // 0-100
        
        // 是否需要升级
        requiresUpgrade: !canAccessChapter && chapter.paymentType !== 'FREE',
      };
    })
  );

  // 根据用户类型和学习进度排序
  const sortedChapters = chaptersWithAccess.sort((a, b) => {
    // 优先显示可访问的章节
    if (a.canAccess !== b.canAccess) {
      return a.canAccess ? -1 : 1;
    }
    // 然后按order排序
    return a.order - b.order;
  });

  return createSuccessResponse({
    chapters: sortedChapters,
    userInfo: {
      userType,
      language,
      province,
      canAccessPremium: userType === 'MEMBER',
      canAccessTrial: ['TRIAL', 'MEMBER'].includes(userType),
    },
    summary: {
      totalChapters: chapters.length,
      accessibleChapters: chaptersWithAccess.filter(c => c.canAccess).length,
      lockedChapters: chaptersWithAccess.filter(c => !c.canAccess).length,
      completedChapters: chaptersWithAccess.filter(c => c.status === 'COMPLETED').length,
    },
  });
});

/**
 * 检查用户是否可以访问章节
 */
function checkChapterAccess(paymentType: string, userType: string): boolean {
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
 * 获取章节状态
 */
function getChapterStatus(canAccess: boolean, accessibleSections: number, totalSections: number): string {
  if (!canAccess && accessibleSections === 0) {
    return 'LOCKED';
  }
  
  if (accessibleSections === 0) {
    return 'LOCKED';
  }
  
  // 暂时返回UNLOCKED，后续可以根据实际的学习进度来判断
  return 'UNLOCKED';
} 