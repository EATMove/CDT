import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { quizQuestions, quizOptions, handbookChapters } from 'database';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

// 获取题目列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const type = searchParams.get('type') || 'practice'; // practice, simulation
  const language = searchParams.get('language') || 'ZH';
  const limit = parseInt(searchParams.get('limit') || '10');
  const userType = searchParams.get('userType') || 'FREE';

  if (!chapterId && type === 'practice') {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required for practice mode',
      400
    );
  }

  const db = getDb();

  try {
    let questions;

    if (type === 'simulation') {
      // 模拟考试：从所有已发布章节中随机抽取题目
      const publishedChapters = await db
        .select({ id: handbookChapters.id })
        .from(handbookChapters)
        .where(eq(handbookChapters.publishStatus, 'PUBLISHED'));

      const chapterIds = publishedChapters.map(c => c.id);

      if (chapterIds.length === 0) {
        return createSuccessResponse({
          questions: [],
          type: 'simulation',
          message: 'No published chapters available'
        });
      }

      // 随机选择30道题目（模拟考试标准）
      questions = await db
        .select({
          id: quizQuestions.id,
          chapterId: quizQuestions.chapterId,
          questionText: quizQuestions.questionText,
          questionTextEn: quizQuestions.questionTextEn,
          explanation: quizQuestions.explanation,
          explanationEn: quizQuestions.explanationEn,
          difficulty: quizQuestions.difficulty,
          imageUrl: quizQuestions.imageUrl,
          order: quizQuestions.order,
        })
        .from(quizQuestions)
        .where(
          and(
            inArray(quizQuestions.chapterId, chapterIds),
            eq(quizQuestions.isActive, true)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(Math.min(limit, 30));

    } else {
      // 章节练习：获取指定章节的题目
      questions = await db
        .select({
          id: quizQuestions.id,
          chapterId: quizQuestions.chapterId,
          questionText: quizQuestions.questionText,
          questionTextEn: quizQuestions.questionTextEn,
          explanation: quizQuestions.explanation,
          explanationEn: quizQuestions.explanationEn,
          difficulty: quizQuestions.difficulty,
          imageUrl: quizQuestions.imageUrl,
          order: quizQuestions.order,
        })
        .from(quizQuestions)
        .where(
          and(
            eq(quizQuestions.chapterId, chapterId!),
            eq(quizQuestions.isActive, true)
          )
        )
        .orderBy(quizQuestions.order)
        .limit(limit);
    }

    if (questions.length === 0) {
      return createSuccessResponse({
        questions: [],
        type,
        message: 'No questions available'
      });
    }

    // 获取题目选项
    const questionIds = questions.map(q => q.id);
    const options = await db
      .select({
        id: quizOptions.id,
        questionId: quizOptions.questionId,
        optionText: quizOptions.optionText,
        optionTextEn: quizOptions.optionTextEn,
        isCorrect: quizOptions.isCorrect,
        order: quizOptions.order,
      })
      .from(quizOptions)
      .where(inArray(quizOptions.questionId, questionIds))
      .orderBy(quizOptions.order);

    // 组装题目和选项
    const questionsWithOptions = questions.map(question => {
      const questionOptions = options
        .filter(opt => opt.questionId === question.id)
        .map(opt => ({
          id: opt.id,
          text: language === 'EN' && opt.optionTextEn ? opt.optionTextEn : opt.optionText,
          order: opt.order,
          // 在练习模式下显示正确答案，模拟考试模式下不显示
          ...(type === 'practice' && { isCorrect: opt.isCorrect })
        }));

      return {
        id: question.id,
        chapterId: question.chapterId,
        text: language === 'EN' && question.questionTextEn ? question.questionTextEn : question.questionText,
        explanation: type === 'practice' ? 
          (language === 'EN' && question.explanationEn ? question.explanationEn : question.explanation) : 
          null, // 模拟考试模式下不显示解释
        difficulty: question.difficulty,
        imageUrl: question.imageUrl,
        order: question.order,
        options: questionOptions,
      };
    });

    return createSuccessResponse({
      questions: questionsWithOptions,
      type,
      metadata: {
        totalQuestions: questionsWithOptions.length,
        chapterId: type === 'practice' ? chapterId : null,
        language,
        userType,
        timeLimit: type === 'simulation' ? 45 : null, // 模拟考试45分钟
        passingScore: type === 'simulation' ? 25 : null, // 模拟考试需要答对25题
      }
    });

  } catch (error) {
    console.error('Mobile quiz API error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to fetch quiz questions',
      500
    );
  }
});

// 提交答题结果
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, answers, type, chapterId, timeSpent } = body;

    if (!userId || !answers || !Array.isArray(answers)) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'User ID and answers are required',
        400
      );
    }

    const db = getDb();

    // 获取题目的正确答案
    const questionIds = answers.map(a => a.questionId);
    const correctAnswers = await db
      .select({
        questionId: quizOptions.questionId,
        optionId: quizOptions.id,
      })
      .from(quizOptions)
      .where(
        and(
          inArray(quizOptions.questionId, questionIds),
          eq(quizOptions.isCorrect, true)
        )
      );

    // 计算得分
    let correctCount = 0;
    const results = answers.map(answer => {
      const correctAnswer = correctAnswers.find(ca => ca.questionId === answer.questionId);
      const isCorrect = correctAnswer && correctAnswer.optionId === answer.selectedOptionId;
      
      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: correctAnswer?.optionId,
        isCorrect,
      };
    });

    const totalQuestions = answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = type === 'simulation' ? correctCount >= 25 : score >= 60;

    // 这里可以保存答题记录到数据库
    // TODO: 实现 quizAttempts 表来保存答题历史

    return createSuccessResponse({
      results,
      summary: {
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        score,
        passed,
        timeSpent,
        type,
        chapterId,
      },
      message: passed ? 'Congratulations! You passed!' : 'Keep studying and try again!'
    });

  } catch (error) {
    console.error('Mobile quiz submission error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to process quiz submission',
      500
    );
  }
});