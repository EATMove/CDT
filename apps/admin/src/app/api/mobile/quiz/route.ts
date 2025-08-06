import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { questions, questionOptions, handbookChapters } from 'database';
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
    let questionsList;

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
      questionsList = await db
        .select({
          id: questions.id,
          chapterId: questions.chapterId,
          title: questions.title,
          titleEn: questions.titleEn,
          content: questions.content,
          contentEn: questions.contentEn,
          explanation: questions.explanation,
          explanationEn: questions.explanationEn,
          difficulty: questions.difficulty,
          imageUrl: questions.imageUrl,
        })
        .from(questions)
        .where(
          and(
            inArray(questions.chapterId, chapterIds)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(Math.min(limit, 30));

    } else {
      // 章节练习：获取指定章节的题目
      questionsList = await db
        .select({
          id: questions.id,
          chapterId: questions.chapterId,
          title: questions.title,
          titleEn: questions.titleEn,
          content: questions.content,
          contentEn: questions.contentEn,
          explanation: questions.explanation,
          explanationEn: questions.explanationEn,
          difficulty: questions.difficulty,
          imageUrl: questions.imageUrl,
        })
        .from(questions)
        .where(eq(questions.chapterId, chapterId!))
        .limit(limit);
    }

    if (questionsList.length === 0) {
      return createSuccessResponse({
        questions: [],
        type,
        message: 'No questions available'
      });
    }

    // 获取题目选项
    const questionIds = questionsList.map(q => q.id);
    const options = await db
      .select({
        id: questionOptions.id,
        questionId: questionOptions.questionId,
        text: questionOptions.text,
        textEn: questionOptions.textEn,
        isCorrect: questionOptions.isCorrect,
        order: questionOptions.order,
      })
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds))
      .orderBy(questionOptions.order);

    // 组装题目和选项
    const questionsWithOptions = questionsList.map(question => {
      const questionOptionsList = options
        .filter(opt => opt.questionId === question.id)
        .map(opt => ({
          id: opt.id,
          text: language === 'EN' && opt.textEn ? opt.textEn : opt.text,
          order: opt.order,
          // 在练习模式下显示正确答案，模拟考试模式下不显示
          ...(type === 'practice' && { isCorrect: opt.isCorrect })
        }));

      return {
        id: question.id,
        chapterId: question.chapterId,
        text: language === 'EN' && question.titleEn ? question.titleEn : question.title,
        content: language === 'EN' && question.contentEn ? question.contentEn : question.content,
        explanation: type === 'practice' ? 
          (language === 'EN' && question.explanationEn ? question.explanationEn : question.explanation) : 
          null, // 模拟考试模式下不显示解释
        difficulty: question.difficulty,
        imageUrl: question.imageUrl,
        options: questionOptionsList,
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
        questionId: questionOptions.questionId,
        optionId: questionOptions.id,
      })
      .from(questionOptions)
      .where(
        and(
          inArray(questionOptions.questionId, questionIds),
          eq(questionOptions.isCorrect, true)
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