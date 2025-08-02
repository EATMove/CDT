import { pgTable, varchar, timestamp, text, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

// 反馈类型枚举
export const feedbackTypeEnum = pgEnum('feedback_type', ['BUG', 'FEATURE', 'IMPROVEMENT', 'COMPLAINT', 'OTHER']);

// 反馈状态枚举
export const feedbackStatusEnum = pgEnum('feedback_status', ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

// 反馈表
export const feedback = pgTable('feedback', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  type: feedbackTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  email: varchar('email', { length: 255 }), // 用户可能提供邮箱以便回复
  deviceInfo: text('device_info'), // 设备信息（JSON格式）
  appVersion: varchar('app_version', { length: 50 }),
  imageUrls: text('image_urls').array(), // 截图URL数组
  status: feedbackStatusEnum('status').notNull().default('PENDING'),
  adminNotes: text('admin_notes'), // 管理员备注
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 邀请码表
export const inviteCodes = pgTable('invite_codes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  createdBy: varchar('created_by', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  usedBy: varchar('used_by', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  trialDays: integer('trial_days').notNull().default(3), // 试用天数
  maxUses: integer('max_uses').notNull().default(1), // 最大使用次数
  currentUses: integer('current_uses').notNull().default(0), // 当前使用次数
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 应用配置表
export const appConfigs = pgTable('app_configs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: varchar('description', { length: 500 }),
  isPublic: boolean('is_public').notNull().default(false), // 是否对客户端可见
  updatedBy: varchar('updated_by', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 通知表
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'SYSTEM', 'QUIZ', 'STUDY_REMINDER', etc.
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: varchar('action_url', { length: 500 }), // 点击通知后跳转的URL
  data: text('data'), // 额外数据（JSON格式）
  expiresAt: timestamp('expires_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 版本信息表
export const appVersions = pgTable('app_versions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  version: varchar('version', { length: 20 }).notNull().unique(),
  buildNumber: integer('build_number').notNull(),
  platform: varchar('platform', { length: 20 }).notNull(), // 'ios', 'android'
  isRequired: boolean('is_required').notNull().default(false), // 是否强制更新
  downloadUrl: varchar('download_url', { length: 500 }),
  releaseNotes: text('release_notes'),
  releaseNotesEn: text('release_notes_en'),
  minOsVersion: varchar('min_os_version', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertFeedbackSchema = createInsertSchema(feedback);
export const selectFeedbackSchema = createSelectSchema(feedback);
export const insertInviteCodeSchema = createInsertSchema(inviteCodes);
export const selectInviteCodeSchema = createSelectSchema(inviteCodes);
export const insertAppConfigSchema = createInsertSchema(appConfigs);
export const selectAppConfigSchema = createSelectSchema(appConfigs);
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export const insertAppVersionSchema = createInsertSchema(appVersions);
export const selectAppVersionSchema = createSelectSchema(appVersions);

// 类型推导
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type NewInviteCode = typeof inviteCodes.$inferInsert;
export type AppConfig = typeof appConfigs.$inferSelect;
export type NewAppConfig = typeof appConfigs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type AppVersion = typeof appVersions.$inferSelect;
export type NewAppVersion = typeof appVersions.$inferInsert; 