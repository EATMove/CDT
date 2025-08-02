import { pgTable, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

// 简单的图片存储表
export const images = pgTable('images', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // 基本文件信息
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  
  // 存储路径和URL
  url: varchar('url', { length: 500 }).notNull(),           // 主要访问URL
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),  // 缩略图URL（可选）
  
  // 文件属性
  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size').notNull(),     // 字节大小
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  
  // 描述信息（可选）
  alt: varchar('alt', { length: 200 }),
  caption: text('caption'),
  
  // 使用状态
  isActive: boolean('is_active').default(true),
  
  // 上传信息
  uploadedBy: varchar('uploaded_by', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas
export const insertImageSchema = createInsertSchema(images);
export const selectImageSchema = createSelectSchema(images);

// 类型推导
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert; 