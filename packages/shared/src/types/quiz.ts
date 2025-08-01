import { z } from 'zod';

// 语言设置
export const Language = {
  ZH: 'ZH',
  EN: 'EN',
  HYBRID: 'HYBRID'
} as const;

export type Language = typeof Language[keyof typeof Language];

// 题目类型
export const QuestionType = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE'
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

// 测验类型
export const QuizType = {
  CHAPTER: 'CHAPTER',
  SIMULATION: 'SIMULATION',
  WRONG_QUESTIONS: 'WRONG_QUESTIONS'
} as const;

export type QuizType = typeof QuizType[keyof typeof QuizType];

// 选项接口
export interface QuestionOption {
  id: string;
  text: string;
  textEn?: string;
  isCorrect: boolean;
}

// 题目接口
export interface Question {
  id: string;
  chapterId: string;
  type: QuestionType;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  imageUrl?: string;
  options: QuestionOption[];
  explanation: string;
  explanationEn?: string;
  difficulty: number; // 1-5 难度等级
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 用户答题记录
export interface UserAnswer {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
  timeSpent: number; // 秒数
  timestamp: string;
}

// 测验会话
export interface QuizSession {
  id: string;
  userId: string;
  type: QuizType;
  chapterId?: string;
  questions: Question[];
  userAnswers: UserAnswer[];
  startTime: string;
  endTime?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // 总用时秒数
  isCompleted: boolean;
  isPassed?: boolean; // 仅适用于模拟考试
}

// 章节进度
export interface ChapterProgress {
  chapterId: string;
  userId: string;
  readingProgress: number; // 0-100 阅读进度
  isReadingCompleted: boolean;
  practiceCount: number; // 练习次数
  bestScore: number; // 最高分数
  averageScore: number; // 平均分数
  lastPracticeAt?: string;
  isUnlocked: boolean; // 是否解锁
}

// 错题本条目
export interface WrongQuestion {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  wrongAnswers: string[]; // 错误答案选项ID
  correctAnswers: string[]; // 正确答案选项ID
  wrongCount: number; // 答错次数
  lastWrongAt: string;
  isResolved: boolean; // 是否已掌握
  resolvedAt?: string;
}

// Zod 验证模式
export const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptions: z.array(z.string()),
  timeSpent: z.number().min(0)
});

export const StartQuizSchema = z.object({
  type: z.enum(['CHAPTER', 'SIMULATION', 'WRONG_QUESTIONS']),
  chapterId: z.string().optional(),
  language: z.enum(['ZH', 'EN', 'HYBRID']).default('HYBRID')
});

// 类型推导
export type SubmitAnswerData = z.infer<typeof SubmitAnswerSchema>;
export type StartQuizData = z.infer<typeof StartQuizSchema>; 