// 导出所有数据表schema
export * from './users';
export * from './handbook';
export * from './quiz';
export * from './progress';
export * from './system';

// 重新导出主要类型以便于使用
import { 
  users, 
  verificationCodes,
  type User, 
  type NewUser,
  type VerificationCode,
  type NewVerificationCode
} from './users';

import { 
  handbookChapters, 
  handbookSections,
  handbookImages,
  handbookContentVersions,
  readingRecords, 
  bookmarks,
  type HandbookChapter,
  type NewHandbookChapter,
  type HandbookSection,
  type NewHandbookSection,
  type HandbookImage,
  type NewHandbookImage,
  type HandbookContentVersion,
  type NewHandbookContentVersion,
  type ReadingRecord,
  type NewReadingRecord,
  type Bookmark,
  type NewBookmark
} from './handbook';

import { 
  questions, 
  questionOptions, 
  quizSessions, 
  userAnswers,
  type Question,
  type NewQuestion,
  type QuestionOption,
  type NewQuestionOption,
  type QuizSession,
  type NewQuizSession,
  type UserAnswer,
  type NewUserAnswer
} from './quiz';

import { 
  chapterProgress, 
  wrongQuestions, 
  learningStats,
  type ChapterProgress,
  type NewChapterProgress,
  type WrongQuestion,
  type NewWrongQuestion,
  type LearningStats,
  type NewLearningStats
} from './progress';

import { 
  feedback, 
  inviteCodes, 
  appConfigs, 
  notifications, 
  appVersions,
  type Feedback,
  type NewFeedback,
  type InviteCode,
  type NewInviteCode,
  type AppConfig,
  type NewAppConfig,
  type Notification,
  type NewNotification,
  type AppVersion,
  type NewAppVersion
} from './system';

// 统一导出所有表
export const allTables = {
  // 用户相关
  users,
  verificationCodes,
  
  // 手册相关
  handbookChapters,
  handbookSections,
  handbookImages,
  handbookContentVersions,
  readingRecords,
  bookmarks,
  
  // 测验相关
  questions,
  questionOptions,
  quizSessions,
  userAnswers,
  
  // 进度相关
  chapterProgress,
  wrongQuestions,
  learningStats,
  
  // 系统相关
  feedback,
  inviteCodes,
  appConfigs,
  notifications,
  appVersions,
};

// 数据库表类型映射
export type DatabaseTables = typeof allTables;

// 导出主要类型接口
export type {
  // 用户相关
  User,
  NewUser,
  VerificationCode,
  NewVerificationCode,
  
  // 手册相关
  HandbookChapter,
  NewHandbookChapter,
  HandbookSection,
  NewHandbookSection,
  HandbookImage,
  NewHandbookImage,
  HandbookContentVersion,
  NewHandbookContentVersion,
  ReadingRecord,
  NewReadingRecord,
  Bookmark,
  NewBookmark,
  
  // 测验相关
  Question,
  NewQuestion,
  QuestionOption,
  NewQuestionOption,
  QuizSession,
  NewQuizSession,
  UserAnswer,
  NewUserAnswer,
  
  // 进度相关
  ChapterProgress,
  NewChapterProgress,
  WrongQuestion,
  NewWrongQuestion,
  LearningStats,
  NewLearningStats,
  
  // 系统相关
  Feedback,
  NewFeedback,
  InviteCode,
  NewInviteCode,
  AppConfig,
  NewAppConfig,
  Notification,
  NewNotification,
  AppVersion,
  NewAppVersion,
}; 