import { pgTable, varchar, timestamp, text, boolean, integer, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';
import { handbookChapters } from './handbook';

// 题目类型枚举
export const questionTypeEnum = pgEnum('question_type', ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE']);

// 测验类型枚举
export const quizTypeEnum = pgEnum('quiz_type', ['CHAPTER', 'SIMULATION', 'WRONG_QUESTIONS']);

// 语言设置枚举
export const languageEnum = pgEnum('language', ['ZH', 'EN', 'HYBRID']);

// 题目表
export const questions = pgTable('questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  chapterId: varchar('chapter_id', { length: 36 }).notNull().references(() => handbookChapters.id, { onDelete: 'cascade' }),
  type: questionTypeEnum('type').notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  titleEn: varchar('title_en', { length: 300 }),
  content: text('content').notNull(),
  contentEn: text('content_en'),
  imageUrl: varchar('image_url', { length: 500 }),
  explanation: text('explanation').notNull(),
  explanationEn: text('explanation_en'),
  difficulty: integer('difficulty').notNull().default(1), // 1-5 难度等级
  tags: text('tags').array(), // 标签数组
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 题目选项表
export const questionOptions = pgTable('question_options', {
  id: varchar('id', { length: 36 }).primaryKey(),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  textEn: text('text_en'),
  isCorrect: boolean('is_correct').notNull().default(false),
  order: integer('order').notNull(), // 选项顺序
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 测验会话表
export const quizSessions = pgTable('quiz_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: quizTypeEnum('type').notNull(),
  chapterId: varchar('chapter_id', { length: 36 }).references(() => handbookChapters.id, { onDelete: 'cascade' }),
  language: languageEnum('language').notNull().default('HYBRID'),
  questionIds: text('question_ids').array().notNull(), // 题目ID数组
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  score: decimal('score', { precision: 5, scale: 2 }).notNull().default('0'),
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull().default(0),
  timeSpent: integer('time_spent').notNull().default(0), // 总用时秒数
  isCompleted: boolean('is_completed').notNull().default(false),
  isPassed: boolean('is_passed'), // 仅适用于模拟考试
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 用户答题记录表
export const userAnswers = pgTable('user_answers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  sessionId: varchar('session_id', { length: 36 }).notNull().references(() => quizSessions.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  selectedOptions: text('selected_options').array().notNull(), // 选择的选项ID数组
  isCorrect: boolean('is_correct').notNull(),
  timeSpent: integer('time_spent').notNull().default(0), // 答题用时秒数
  answeredAt: timestamp('answered_at').notNull(),
});

// Zod schemas for validation
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertQuestionOptionSchema = createInsertSchema(questionOptions);
export const selectQuestionOptionSchema = createSelectSchema(questionOptions);
export const insertQuizSessionSchema = createInsertSchema(quizSessions);
export const selectQuizSessionSchema = createSelectSchema(quizSessions);
export const insertUserAnswerSchema = createInsertSchema(userAnswers);
export const selectUserAnswerSchema = createSelectSchema(userAnswers);

// 类型推导
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;
export type QuizSession = typeof quizSessions.$inferSelect;
export type NewQuizSession = typeof quizSessions.$inferInsert;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert; 