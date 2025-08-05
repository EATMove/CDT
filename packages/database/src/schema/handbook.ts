import { pgTable, varchar, timestamp, text, boolean, integer, pgEnum, json, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users, provinceEnum } from './users';

// 章节状态枚举
export const chapterStatusEnum = pgEnum('chapter_status', ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED']);

// 内容格式枚举
export const contentFormatEnum = pgEnum('content_format', ['HTML', 'MARKDOWN', 'PLAIN_TEXT']);

// 发布状态枚举
export const publishStatusEnum = pgEnum('publish_status', ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']);

// 付费类型枚举
export const paymentTypeEnum = pgEnum('payment_type', ['FREE', 'MEMBER_ONLY', 'TRIAL_INCLUDED', 'PREMIUM']);

// 手册章节表 - 重新设计
export const handbookChapters = pgTable('handbook_chapters', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  titleEn: varchar('title_en', { length: 200 }),
  description: text('description').notNull(),
  descriptionEn: text('description_en'),
  order: integer('order').notNull(),
  
  // 省份支持 - 新增
  province: provinceEnum('province').notNull(),
  
  // 内容相关
  contentFormat: contentFormatEnum('content_format').notNull().default('HTML'),
  estimatedReadTime: integer('estimated_read_time').notNull(), // 分钟
  
  // 封面图片
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  coverImageAlt: varchar('cover_image_alt', { length: 200 }),
  
  // 付费控制
  paymentType: paymentTypeEnum('payment_type').notNull().default('FREE'),
  freePreviewSections: integer('free_preview_sections').default(0), // 免费预览的段落数
  
  // 学习路径
  prerequisiteChapters: text('prerequisite_chapters').array(), // 前置章节ID数组
  
  // 发布控制
  publishStatus: publishStatusEnum('publish_status').notNull().default('DRAFT'),
  publishedAt: timestamp('published_at'),
  
  // 元数据
  authorId: varchar('author_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  lastEditedBy: varchar('last_edited_by', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 章节内容段落表 - 新增，支持分段管理
export const handbookSections = pgTable('handbook_sections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  chapterId: varchar('chapter_id', { length: 36 }).notNull().references(() => handbookChapters.id, { onDelete: 'cascade' }),
  
  // 段落信息
  title: varchar('title', { length: 200 }).notNull(),
  titleEn: varchar('title_en', { length: 200 }),
  order: integer('order').notNull(),
  
  // 内容
  content: text('content').notNull(), // HTML格式内容
  contentEn: text('content_en'),
  
  // 付费控制
  isFree: boolean('is_free').notNull().default(true),
  requiredUserType: text('required_user_type').array(), // ['FREE', 'TRIAL', 'MEMBER']
  
  // 阅读估算
  wordCount: integer('word_count').default(0),
  estimatedReadTime: integer('estimated_read_time').default(0), // 秒数
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 图片用途枚举
export const imageUsageEnum = pgEnum('image_usage', ['content', 'cover', 'diagram', 'illustration']);

// 图片资源表 - 专门管理handbook中的图片
// 每张图片必须关联到章节或段落中的一个（不能同时关联两者）
export const handbookImages = pgTable('handbook_images', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // 关联关系 - 必须二选一
  chapterId: varchar('chapter_id', { length: 36 }).references(() => handbookChapters.id, { onDelete: 'cascade' }),
  sectionId: varchar('section_id', { length: 36 }).references(() => handbookSections.id, { onDelete: 'cascade' }),
  
  // 图片文件信息
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // 字节
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  
  // 图片元数据
  width: integer('width'),
  height: integer('height'),
  altText: varchar('alt_text', { length: 200 }),
  caption: text('caption'),
  captionEn: text('caption_en'),
  
  // 图片用途和位置
  usage: imageUsageEnum('usage').notNull().default('content'),
  order: integer('order').notNull().default(0), // 在所属章节或段落中的排序
  
  // 上传信息
  uploadedBy: varchar('uploaded_by', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // 复合索引优化查询性能
  chapterUsageIdx: index('idx_handbook_images_chapter_usage').on(table.chapterId, table.usage),
  sectionUsageIdx: index('idx_handbook_images_section_usage').on(table.sectionId, table.usage),
  chapterOrderIdx: index('idx_handbook_images_chapter_order').on(table.chapterId, table.order),
  sectionOrderIdx: index('idx_handbook_images_section_order').on(table.sectionId, table.order),
  createdAtIdx: index('idx_handbook_images_created_at').on(table.createdAt),
  uploadedByIdx: index('idx_handbook_images_uploaded_by').on(table.uploadedBy),
}));

// 内容版本控制表 - 新增，支持内容历史和回滚
export const handbookContentVersions = pgTable('handbook_content_versions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  chapterId: varchar('chapter_id', { length: 36 }).references(() => handbookChapters.id, { onDelete: 'cascade' }),
  sectionId: varchar('section_id', { length: 36 }).references(() => handbookSections.id, { onDelete: 'cascade' }),
  
  // 版本信息
  version: varchar('version', { length: 20 }).notNull(), // 如：v1.0.0
  versionNote: text('version_note'), // 版本说明
  
  // 内容快照
  contentSnapshot: json('content_snapshot').notNull(), // 存储完整的内容快照
  
  // 变更信息
  changeType: varchar('change_type', { length: 50 }).notNull(), // 'create', 'update', 'delete'
  changeDescription: text('change_description'),
  
  // 操作信息
  createdBy: varchar('created_by', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 阅读记录表 - 更新，支持按段落追踪
export const readingRecords = pgTable('reading_records', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  chapterId: varchar('chapter_id', { length: 36 }).notNull().references(() => handbookChapters.id, { onDelete: 'cascade' }),
  sectionId: varchar('section_id', { length: 36 }).references(() => handbookSections.id, { onDelete: 'cascade' }),
  
  // 省份支持 - 新增
  province: provinceEnum('province').notNull(),
  
  // 阅读进度
  progress: integer('progress').notNull().default(0), // 0-100 百分比
  currentPosition: integer('current_position').notNull().default(0), // 在段落中的位置
  totalLength: integer('total_length').notNull(),
  timeSpent: integer('time_spent').notNull().default(0), // 秒数
  
  // 阅读状态
  isCompleted: boolean('is_completed').notNull().default(false),
  lastReadAt: timestamp('last_read_at').notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  
  // 阅读模式
  readingLanguage: varchar('reading_language', { length: 10 }).default('ZH'), // 'ZH', 'EN'
});

// 书签表 - 更新，支持段落级书签
export const bookmarks = pgTable('bookmarks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  chapterId: varchar('chapter_id', { length: 36 }).notNull().references(() => handbookChapters.id, { onDelete: 'cascade' }),
  sectionId: varchar('section_id', { length: 36 }).references(() => handbookSections.id, { onDelete: 'cascade' }),
  
  // 省份支持 - 新增
  province: provinceEnum('province').notNull(),
  
  // 书签位置
  position: integer('position').notNull(), // 在段落中的字符位置
  
  // 书签内容
  note: text('note'),
  highlightedText: text('highlighted_text'), // 高亮的文本内容
  
  // 书签元数据
  color: varchar('color', { length: 20 }).default('yellow'), // 书签颜色
  isPrivate: boolean('is_private').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertHandbookChapterSchema = createInsertSchema(handbookChapters);
export const selectHandbookChapterSchema = createSelectSchema(handbookChapters);
export const insertHandbookSectionSchema = createInsertSchema(handbookSections);
export const selectHandbookSectionSchema = createSelectSchema(handbookSections);
export const insertHandbookImageSchema = createInsertSchema(handbookImages);
export const selectHandbookImageSchema = createSelectSchema(handbookImages);
export const insertHandbookContentVersionSchema = createInsertSchema(handbookContentVersions);
export const selectHandbookContentVersionSchema = createSelectSchema(handbookContentVersions);
export const insertReadingRecordSchema = createInsertSchema(readingRecords);
export const selectReadingRecordSchema = createSelectSchema(readingRecords);
export const insertBookmarkSchema = createInsertSchema(bookmarks);
export const selectBookmarkSchema = createSelectSchema(bookmarks);

// 类型推导
export type HandbookChapter = typeof handbookChapters.$inferSelect;
export type NewHandbookChapter = typeof handbookChapters.$inferInsert;
export type HandbookSection = typeof handbookSections.$inferSelect;
export type NewHandbookSection = typeof handbookSections.$inferInsert;
export type HandbookImage = typeof handbookImages.$inferSelect;
export type NewHandbookImage = typeof handbookImages.$inferInsert;
export type HandbookContentVersion = typeof handbookContentVersions.$inferSelect;
export type NewHandbookContentVersion = typeof handbookContentVersions.$inferInsert;
export type ReadingRecord = typeof readingRecords.$inferSelect;
export type NewReadingRecord = typeof readingRecords.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert; 