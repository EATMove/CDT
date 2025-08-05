import { z } from 'zod';

// 章节状态
export const ChapterStatus = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

export type ChapterStatus = typeof ChapterStatus[keyof typeof ChapterStatus];

// 内容格式
export const ContentFormat = {
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN',
  PLAIN_TEXT: 'PLAIN_TEXT'
} as const;

export type ContentFormat = typeof ContentFormat[keyof typeof ContentFormat];

// 发布状态
export const PublishStatus = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

export type PublishStatus = typeof PublishStatus[keyof typeof PublishStatus];

// 付费类型
export const PaymentType = {
  FREE: 'FREE',
  MEMBER_ONLY: 'MEMBER_ONLY',
  TRIAL_INCLUDED: 'TRIAL_INCLUDED',
  PREMIUM: 'PREMIUM'
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

// 图片用途
export const ImageUsage = {
  CONTENT: 'content',
  COVER: 'cover',
  DIAGRAM: 'diagram',
  ILLUSTRATION: 'illustration'
} as const;

export type ImageUsage = typeof ImageUsage[keyof typeof ImageUsage];

// 手册章节
export interface HandbookChapter {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  order: number;
  contentFormat: ContentFormat;
  estimatedReadTime: number; // 分钟
  
  // 封面图片
  coverImageUrl?: string;
  coverImageAlt?: string;
  
  // 付费控制
  paymentType: PaymentType;
  freePreviewSections: number; // 免费预览的段落数
  
  // 学习路径
  prerequisiteChapters: string[];
  
  // 发布控制
  publishStatus: PublishStatus;
  publishedAt?: string;
  
  // 元数据
  authorId?: string;
  lastEditedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 章节段落
export interface HandbookSection {
  id: string;
  chapterId: string;
  title: string;
  titleEn?: string;
  order: number;
  content: string; // HTML格式
  contentEn?: string;
  
  // 付费控制
  isFree: boolean;
  requiredUserType: string[]; // ['FREE', 'TRIAL', 'MEMBER']
  
  // 阅读估算
  wordCount: number;
  estimatedReadTime: number; // 秒数
  
  createdAt: string;
  updatedAt: string;
}

// 图片资源
export interface HandbookImage {
  id: string;
  chapterId?: string;
  sectionId?: string;
  
  // 图片信息
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  
  // 图片元数据
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  captionEn?: string;
  
  // 图片用途
  usage: ImageUsage;
  order: number;
  
  // 上传信息
  uploadedBy?: string;
  createdAt: string;
}

// 内容版本
export interface HandbookContentVersion {
  id: string;
  chapterId?: string;
  sectionId?: string;
  
  // 版本信息
  version: string;
  versionNote?: string;
  
  // 内容快照
  contentSnapshot: any; // JSON数据
  
  // 变更信息
  changeType: string; // 'create', 'update', 'delete'
  changeDescription?: string;
  
  // 操作信息
  createdBy: string;
  createdAt: string;
}

// 阅读记录
export interface ReadingRecord {
  id: string;
  userId: string;
  chapterId: string;
  sectionId?: string;
  
  // 阅读进度
  progress: number; // 0-100
  currentPosition: number;
  totalLength: number;
  timeSpent: number; // 秒数
  
  // 阅读状态
  isCompleted: boolean;
  lastReadAt: string;
  startedAt: string;
  completedAt?: string;
  
  // 阅读模式
  readingLanguage: string; // 'ZH', 'EN'
}

// 书签
export interface Bookmark {
  id: string;
  userId: string;
  chapterId: string;
  sectionId?: string;
  
  // 书签位置
  position: number;
  
  // 书签内容
  note?: string;
  highlightedText?: string;
  
  // 书签元数据
  color: string;
  isPrivate: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// 完整的章节数据（包含段落）
export interface ChapterWithSections extends HandbookChapter {
  sections: HandbookSection[];
  images: HandbookImage[];
  totalSections: number;
  freeSections: number;
  userCanAccess: boolean; // 基于用户状态计算
}

// 阅读进度汇总
export interface ReadingProgress {
  chapterId: string;
  totalSections: number;
  completedSections: number;
  progress: number; // 0-100
  totalTimeSpent: number; // 秒数
  isCompleted: boolean;
  lastPosition?: {
    sectionId: string;
    position: number;
  };
}

// Admin相关的Zod验证模式
export const CreateChapterSchema = z.object({
  title: z.string().min(1, '章节标题不能为空').max(200, '标题长度不能超过200字符'),
  titleEn: z.string().max(200, '英文标题长度不能超过200字符').optional(),
  description: z.string().min(1, '章节描述不能为空'),
  descriptionEn: z.string().optional(),
  order: z.number().int().min(1, '章节顺序必须大于0'),
  province: z.enum(['AB', 'BC', 'ON']),
  contentFormat: z.enum(['HTML', 'MARKDOWN', 'PLAIN_TEXT']).default('HTML'),
  estimatedReadTime: z.number().int().min(1, '预估阅读时间必须大于0'),
  coverImageUrl: z.string().url('封面图片URL格式不正确').optional(),
  coverImageAlt: z.string().max(200, 'Alt文本长度不能超过200字符').optional(),
  paymentType: z.enum(['FREE', 'MEMBER_ONLY', 'TRIAL_INCLUDED', 'PREMIUM']).default('FREE'),
  freePreviewSections: z.number().int().min(0, '免费预览段落数不能小于0').default(0),
  prerequisiteChapters: z.array(z.string()).default([]),
});

export const CreateSectionSchema = z.object({
  chapterId: z.string().min(1, '章节ID不能为空'),
  title: z.string().min(1, '段落标题不能为空').max(200, '标题长度不能超过200字符'),
  titleEn: z.string().max(200, '英文标题长度不能超过200字符').optional(),
  order: z.number().int().min(1, '段落顺序必须大于0'),
  content: z.string().min(1, '段落内容不能为空'),
  contentEn: z.string().optional(),
  isFree: z.boolean().default(true),
  requiredUserType: z.array(z.enum(['FREE', 'TRIAL', 'MEMBER'])).default(['FREE']),
});

export const UploadImageSchema = z.object({
  chapterId: z.string().optional(),
  sectionId: z.string().optional(),
  altText: z.string().max(200, 'Alt文本长度不能超过200字符').optional(),
  caption: z.string().optional(),
  captionEn: z.string().optional(),
  usage: z.enum(['content', 'cover', 'diagram', 'illustration']).default('content'),
  order: z.number().int().min(0).default(0),
}).refine((data) => {
  // 至少需要关联到章节或段落
  return data.chapterId || data.sectionId;
}, {
  message: '图片必须关联到章节或段落',
});

export const UpdateChapterStatusSchema = z.object({
  publishStatus: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']),
  versionNote: z.string().optional(),
});

export const CreateBookmarkSchema = z.object({
  chapterId: z.string().min(1, '章节ID不能为空'),
  sectionId: z.string().optional(),
  position: z.number().int().min(0, '位置不能小于0'),
  note: z.string().max(500, '备注长度不能超过500字符').optional(),
  highlightedText: z.string().max(1000, '高亮文本长度不能超过1000字符').optional(),
  color: z.string().default('yellow'),
  isPrivate: z.boolean().default(true),
});

// 搜索和过滤模式
export const HandbookSearchSchema = z.object({
  query: z.string().optional(),
  paymentType: z.enum(['FREE', 'MEMBER_ONLY', 'TRIAL_INCLUDED', 'PREMIUM']).optional(),
  publishStatus: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  authorId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// 类型推导
export type CreateChapterData = z.infer<typeof CreateChapterSchema>;
export type CreateSectionData = z.infer<typeof CreateSectionSchema>;
export type UploadImageData = z.infer<typeof UploadImageSchema>;
export type UpdateChapterStatusData = z.infer<typeof UpdateChapterStatusSchema>;
export type CreateBookmarkData = z.infer<typeof CreateBookmarkSchema>;
export type HandbookSearchData = z.infer<typeof HandbookSearchSchema>;

// 内容管理的辅助类型
export interface ContentEditor {
  chapterId?: string;
  sectionId?: string;
  content: string;
  contentEn?: string;
  images: HandbookImage[];
  isDirty: boolean; // 是否有未保存的更改
  lastSaved?: string;
}

export interface ContentPreview {
  html: string;
  wordCount: number;
  estimatedReadTime: number; // 秒数
  imageCount: number;
}

// 批量操作类型
export interface BatchOperation {
  type: 'publish' | 'archive' | 'delete' | 'reorder';
  itemIds: string[];
  params?: any;
} 