// 章节状态
export const ChapterStatus = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

export type ChapterStatus = typeof ChapterStatus[keyof typeof ChapterStatus];

// 手册章节
export interface HandbookChapter {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  order: number;
  content: string; // 章节内容（Markdown格式）
  contentEn?: string;
  estimatedReadTime: number; // 预估阅读时间（分钟）
  imageUrl?: string;
  isFree: boolean; // 是否免费章节
  prerequisiteChapters: string[]; // 前置章节ID
  createdAt: string;
  updatedAt: string;
}

// 手册目录
export interface HandbookToc {
  id: string;
  title: string;
  titleEn?: string;
  chapters: HandbookChapter[];
  totalChapters: number;
  freeChapters: number;
  estimatedTotalTime: number; // 总预估时间
}

// 阅读记录
export interface ReadingRecord {
  id: string;
  userId: string;
  chapterId: string;
  progress: number; // 0-100 阅读进度百分比
  currentPosition: number; // 当前阅读位置（字符位置）
  totalLength: number; // 章节总长度
  timeSpent: number; // 阅读时间（秒）
  isCompleted: boolean;
  lastReadAt: string;
  startedAt: string;
  completedAt?: string;
}

// 书签
export interface Bookmark {
  id: string;
  userId: string;
  chapterId: string;
  position: number; // 书签位置
  note?: string; // 书签备注
  createdAt: string;
}

export interface ReadingProgress {
  chapterId: string;
  progress: number;
  isCompleted: boolean;
  lastPosition: number;
} 