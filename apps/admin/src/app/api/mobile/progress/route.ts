import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { chapterProgress, handbookChapters } from 'database';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

// 获取用户学习进度
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const chapterId = searchParams.get('chapterId');

  if (!userId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'User ID is required',
      400
    );
  }

  const db = getDb();

  try {
    if (chapterId) {
      // 获取特定章节的学习进度
      const progress = await db
        .select({
          id: chapterProgress.id,
          userId: chapterProgress.userId,
          chapterId: chapterProgress.chapterId,
          readingProgress: chapterProgress.readingProgress,
          isReadingCompleted: chapterProgress.isReadingCompleted,
          practiceCount: chapterProgress.practiceCount,
          bestScore: chapterProgress.bestScore,
          averageScore: chapterProgress.averageScore,
          lastPracticeAt: chapterProgress.lastPracticeAt,
          isUnlocked: chapterProgress.isUnlocked,
          unlockedAt: chapterProgress.unlockedAt,
          createdAt: chapterProgress.createdAt,
          updatedAt: chapterProgress.updatedAt,
        })
        .from(chapterProgress)
        .where(
          and(
            eq(chapterProgress.userId, userId),
            eq(chapterProgress.chapterId, chapterId)
          )
        )
        .limit(1);

      return createSuccessResponse({
        progress: progress[0] || null,
        type: 'chapter'
      });

    } else {
      // 获取用户所有学习进度概览
      const allProgress = await db
        .select({
          id: chapterProgress.id,
          userId: chapterProgress.userId,
          chapterId: chapterProgress.chapterId,
          readingProgress: chapterProgress.readingProgress,
          isReadingCompleted: chapterProgress.isReadingCompleted,
          practiceCount: chapterProgress.practiceCount,
          bestScore: chapterProgress.bestScore,
          averageScore: chapterProgress.averageScore,
          lastPracticeAt: chapterProgress.lastPracticeAt,
          isUnlocked: chapterProgress.isUnlocked,
          unlockedAt: chapterProgress.unlockedAt,
          createdAt: chapterProgress.createdAt,
          updatedAt: chapterProgress.updatedAt,
        })
        .from(chapterProgress)
        .where(eq(chapterProgress.userId, userId))
        .orderBy(desc(chapterProgress.updatedAt));

      // 获取章节信息
      const chapterIds = allProgress.map(p => p.chapterId);
      const chapters = await db
        .select({
          id: handbookChapters.id,
          title: handbookChapters.title,
          titleEn: handbookChapters.titleEn,
          order: handbookChapters.order,
        })
        .from(handbookChapters)
        .where(inArray(handbookChapters.id, chapterIds));

      // 组装进度和章节信息
      const progressWithChapters = allProgress.map(progress => {
        const chapter = chapters.find(c => c.id === progress.chapterId);
        return {
          ...progress,
          chapter: chapter || null,
        };
      });

      // 计算总体统计
      const totalChapters = chapters.length;
      const completedChapters = allProgress.filter(p => p.isReadingCompleted).length;
      const totalPracticeCount = allProgress.reduce((sum, p) => sum + p.practiceCount, 0);
      const averageBestScore = allProgress.length > 0 
        ? allProgress.reduce((sum, p) => sum + Number(p.bestScore), 0) / allProgress.length 
        : 0;

      return createSuccessResponse({
        progress: progressWithChapters,
        summary: {
          totalChapters,
          completedChapters,
          completionRate: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
          totalPracticeCount,
          averageBestScore: Math.round(averageBestScore * 100) / 100,
        },
        type: 'overview'
      });
    }

  } catch (error) {
    console.error('Mobile progress API error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to fetch user progress',
      500
    );
  }
});

// 更新用户学习进度
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, chapterId, readingProgress, practiceScore, timeSpent } = body;

    if (!userId || !chapterId) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'User ID and Chapter ID are required',
        400
      );
    }

    const db = getDb();

    // 检查现有进度记录
    const existingProgress = await db
      .select()
      .from(chapterProgress)
      .where(
        and(
          eq(chapterProgress.userId, userId),
          eq(chapterProgress.chapterId, chapterId)
        )
      )
      .limit(1);

    const now = new Date();
    const progressData: any = {
      readingProgress: readingProgress || 0,
      isReadingCompleted: readingProgress >= 100,
      practiceCount: existingProgress[0] ? existingProgress[0].practiceCount + 1 : 1,
      lastPracticeAt: now,
      updatedAt: now,
    };

    // 如果有练习分数，更新分数记录
    if (practiceScore !== undefined) {
      const currentBestScore = Number(existingProgress[0]?.bestScore || 0);
      const currentAverageScore = Number(existingProgress[0]?.averageScore || 0);
      const currentPracticeCount = existingProgress[0]?.practiceCount || 0;

      progressData.bestScore = Math.max(currentBestScore, practiceScore);
      progressData.averageScore = ((currentAverageScore * currentPracticeCount) + practiceScore) / (currentPracticeCount + 1);
    }

    if (existingProgress.length > 0) {
      // 更新现有记录
      await db
        .update(chapterProgress)
        .set(progressData)
        .where(
          and(
            eq(chapterProgress.userId, userId),
            eq(chapterProgress.chapterId, chapterId)
          )
        );
    } else {
      // 创建新记录
      await db
        .insert(chapterProgress)
        .values({
          id: crypto.randomUUID(),
          userId,
          chapterId,
          province: 'ON', // 默认省份，实际应该从用户信息获取
          ...progressData,
          createdAt: now,
        });
    }

    return createSuccessResponse({
      message: 'Progress updated successfully',
      progress: progressData
    });

  } catch (error) {
    console.error('Mobile progress update error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to update user progress',
      500
    );
  }
});