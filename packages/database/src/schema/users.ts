import { pgTable, varchar, timestamp, pgEnum, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// 枚举定义
export const provinceEnum = pgEnum('province', ['AB', 'BC', 'ON']);
export const userTypeEnum = pgEnum('user_type', ['FREE', 'MEMBER', 'TRIAL']);
export const loginMethodEnum = pgEnum('login_method', ['EMAIL', 'PHONE', 'GOOGLE']);

// 用户表
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  nickname: varchar('nickname', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  googleId: varchar('google_id', { length: 100 }).unique(),
  passwordHash: text('password_hash'), // 邮箱/手机登录需要密码，Google登录不需要
  primaryLoginMethod: loginMethodEnum('primary_login_method').notNull(), // 用户主要使用的登录方式
  province: provinceEnum('province').notNull(),
  userType: userTypeEnum('user_type').notNull().default('FREE'),
  trialEndDate: timestamp('trial_end_date'),
  membershipEndDate: timestamp('membership_end_date'),
  inviteCode: varchar('invite_code', { length: 10 }).unique(),
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  googleVerified: boolean('google_verified').default(false), // Google账号验证状态
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginMethod: loginMethodEnum('last_login_method'), // 最后一次使用的登录方式
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 验证码表
export const verificationCodes = pgTable('verification_codes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  code: varchar('code', { length: 6 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'register', 'reset_password', 'login', 'phone_verification', 'email_verification'
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertVerificationCodeSchema = createInsertSchema(verificationCodes);
export const selectVerificationCodeSchema = createSelectSchema(verificationCodes);

// 类型推导
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert; 