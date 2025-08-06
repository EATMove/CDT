import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { userProgress, handbookChapters, handbookSections } from 'database';
import { eq, and, desc } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

// 获取用户学习进度
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const chapterId = searchParams.get('chapterId');
  const sectionId = searchParams.get('sectionId');

  if (!userId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'User ID is required',
      400
    );
  }

  const db = getDb();

  try {
    if (sectionId) {
      // 获取特定段落的学习进度
      const progress = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.sectionId, sectionId)
          )
        )
        .limit(1);

      return createSuccessResponse({
        progress: progress[0] || null,
        type: 'section'
      });

    } else if (chapterId) {
      // 获取特定章节的学习进度
      const chapterProgress = await db
        .select({
          id: userProgress.id,
          userId: userProgress.userId,
          chapterId: userProgress.chapterId,
          sectionId: userProgress.sectionId,
          status: userProgress.status,
          progress: userProgress.progress,
          timeSpent: userProgress.timeSpent,
          lastAccessedAt: userProgress.lastAccessedAt,
          completedAt: userProgress.completedAt,
          createdAt: userProgress.createdAt,
          updatedAt: userProgress.updatedAt,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.chapterId, chapterId)
          )
        )
        .orderBy(desc(userProgress.lastAccessedAt));

      // 计算章节整体进度
      const totalSections = await db
        .select()
        .from(handbookSections)
        .where(eq(handbookSections.chapterId, chapterId));

      const completedSections = chapterProgress.filter(p => p.status === 'COMPLETED').length;
      const overallProgress = totalSections.length > 0 ? (completedSections / totalSections.length) * 100 : 0;

      return createSuccessResponse({
        progress: chapterProgress,
        summary: {
          totalSections: totalSections.length,
          completedSections,
          overallProgress: Math.round(overallProgress),
          totalTimeSpent: chapterProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        },
        type: 'chapter'
      });

    } else {
      // 获取用户所有学习进度概览
      const allProgress = await db
        .select({
          id: userProgress.id,
          userId: userProgress.userId,
          chapterId: userProgress.chapterId,
          sectionId: userProgress.sectionId,
          status: userProgress.status,
          progress: userProgress.progress,
          timeSpent: userProgress.timeSpent,
          lastAccessedAt: userProgress.lastAccessedAt,
          completedAt: userProgress.completedAt,
        })
        .from(userProgress)
        .where(eq(userProgress.userId, userId))
        .orderBy(desc(userProgress.lastAccessedAt));

      // 按章节分组统计
      const chapterStats = new Map();
      
      for (const progress of allProgress) {
        const chapterId = progress.chapterId;
        if (!chapterStats.has(chapterId)) {
          chapterStats.set(chapterId, {
            chapterId,
            totalSections: 0,
            completedSections: 0,
            inProgressSections: 0,
            totalTimeSpent: 0,
            lastAccessedAt: progress.lastAccessedAt,
          });
        }

        const stats = chapterStats.get(chapterId);
        stats.totalSections++;
        stats.totalTimeSpent += progress.timeSpent || 0;
        
        if (progress.status === 'COMPLETED') {
          stats.completedSections++;
        } else if (progress.status === 'IN_PROGRESS') {
          stats.inProgressSections++;
        }

        if (progress.lastAccessedAt > stats.lastAccessedAt) {
          stats.lastAccessedAt = progress.lastAccessedAt;
        }
      }

      return createSuccessResponse({
        progress: allProgress,
        chapterStats: Array.from(chapterStats.values()),
        summary: {
          totalSections: allProgress.length,
          completedSections: allProgress.filter(p => p.status === 'COMPLETED').length,
          inProgressSections: allProgress.filter(p => p.status === 'IN_PROGRESS').length,
          totalTimeSpent: allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        },
        type: 'overview'
      });
    }

  } catch (error) {
    console.error('Mobile progress API error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to fetch progress',
      500
    );
  }
});

// 更新学习进度
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, chapterId, sectionId, status, progress, timeSpent } = body;

    if (!userId || !chapterId || !sectionId) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'User ID, chapter ID and section ID are required',
        400
      );
    }

    const db = getDb();

    // 检查是否已存在进度记录
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.chapterId, chapterId),
          eq(userProgress.sectionId, sectionId)
        )
      )
      .limit(1);

    const now = new Date();
    const progressData = {
      userId,
      chapterId,
      sectionId,
      status: status || 'IN_PROGRESS',
      progress: progress || 0,
      timeSpent: timeSpent || 0,
      lastAccessedAt: now,
      ...(status === 'COMPLETED' && { completedAt: now }),
      updatedAt: now,
    };

    if (existingProgress.length > 0) {
      // 更新现有记录
      await db
        .update(userProgress)
        .set(progressData)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.chapterId, chapterId),
            eq(userProgress.sectionId, sectionId)
          )
        );

      return createSuccessResponse({
        message: 'Progress updated successfully',
        progress: { ...progressData, id: existingProgress[0].id }
      });

    } else {
      // 创建新记录
      const newProgress = await db
        .insert(userProgress)
        .values({
          ...progressData,
          createdAt: now,
        })
        .returning();

      return createSuccessResponse({
        message: 'Progress created successfully',
        progress: newProgress[0]
      });
    }

  } catch (error) {
    console.error('Mobile progress update error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to update progress',
      500
    );
  }
});