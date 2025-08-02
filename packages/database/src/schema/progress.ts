import { pgTable, varchar, timestamp, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';
import { handbookChapters } from './handbook';
import { questions } from './quiz';

// 章节进度表
export const chapterProgress = pgTable('chapter_progress', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  chapterId: varchar('chapter_id', { length: 36 }).notNull().references(() => handbookChapters.id, { onDelete: 'cascade' }),
  readingProgress: integer('reading_progress').notNull().default(0), // 0-100 阅读进度
  isReadingCompleted: boolean('is_reading_completed').notNull().default(false),
  practiceCount: integer('practice_count').notNull().default(0), // 练习次数
  bestScore: decimal('best_score', { precision: 5, scale: 2 }).notNull().default('0'), // 最高分数
  averageScore: decimal('average_score', { precision: 5, scale: 2 }).notNull().default('0'), // 平均分数
  lastPracticeAt: timestamp('last_practice_at'),
  isUnlocked: boolean('is_unlocked').notNull().default(false), // 是否解锁
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 错题本表
export const wrongQuestions = pgTable('wrong_questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  wrongAnswers: varchar('wrong_answers', { length: 500 }).array().notNull(), // 错误答案选项ID数组
  correctAnswers: varchar('correct_answers', { length: 500 }).array().notNull(), // 正确答案选项ID数组
  wrongCount: integer('wrong_count').notNull().default(1), // 答错次数
  lastWrongAt: timestamp('last_wrong_at').notNull(),
  isResolved: boolean('is_resolved').notNull().default(false), // 是否已掌握
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 学习统计表 - 用于存储用户的整体学习统计数据
export const learningStats = pgTable('learning_stats', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalStudyTime: integer('total_study_time').notNull().default(0), // 总学习时间（秒）
  totalQuestions: integer('total_questions').notNull().default(0), // 总题目数
  correctQuestions: integer('correct_questions').notNull().default(0), // 答对题目数
  chaptersCompleted: integer('chapters_completed').notNull().default(0), // 已完成章节数
  simulationAttempts: integer('simulation_attempts').notNull().default(0), // 模拟考试次数
  simulationPassed: integer('simulation_passed').notNull().default(0), // 模拟考试通过次数
  currentStreak: integer('current_streak').notNull().default(0), // 当前连续学习天数
  longestStreak: integer('longest_streak').notNull().default(0), // 最长连续学习天数
  lastStudyDate: timestamp('last_study_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertChapterProgressSchema = createInsertSchema(chapterProgress);
export const selectChapterProgressSchema = createSelectSchema(chapterProgress);
export const insertWrongQuestionSchema = createInsertSchema(wrongQuestions);
export const selectWrongQuestionSchema = createSelectSchema(wrongQuestions);
export const insertLearningStatsSchema = createInsertSchema(learningStats);
export const selectLearningStatsSchema = createSelectSchema(learningStats);

// 类型推导
export type ChapterProgress = typeof chapterProgress.$inferSelect;
export type NewChapterProgress = typeof chapterProgress.$inferInsert;
export type WrongQuestion = typeof wrongQuestions.$inferSelect;
export type NewWrongQuestion = typeof wrongQuestions.$inferInsert;
export type LearningStats = typeof learningStats.$inferSelect;
export type NewLearningStats = typeof learningStats.$inferInsert; 