import { z } from 'zod';

// 省份枚举
export const Province = {
  AB: 'AB',
  BC: 'BC', 
  ON: 'ON'
} as const;

export type Province = typeof Province[keyof typeof Province];

// 用户类型枚举
export const UserType = {
  FREE: 'FREE',
  MEMBER: 'MEMBER',
  TRIAL: 'TRIAL'
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

// 登录方式枚举
export const LoginMethod = {
  WECHAT: 'WECHAT',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE'
} as const;

export type LoginMethod = typeof LoginMethod[keyof typeof LoginMethod];

// 用户基础信息
export interface User {
  id: string;
  nickname: string;
  email?: string;
  phone?: string;
  wechatId?: string;
  province: Province;
  userType: UserType;
  trialEndDate?: string;
  membershipEndDate?: string;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Zod 验证模式
export const RegisterSchema = z.object({
  nickname: z.string()
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, '昵称只能包含中文、英文、数字和下划线'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .max(20, '密码最多20个字符')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).*$|^(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).*$|^(?=.*\d)(?=.*[!@#$%^&*]).*$/, 
           '密码必须包含字母、数字、符号中的至少两种'),
  verificationCode: z.string()
    .min(4, '验证码至少4位')
    .max(6, '验证码最多6位')
    .regex(/^\d+$/, '验证码只能是数字')
});

export const LoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码')
});

export const InviteCodeSchema = z.object({
  inviteCode: z.string()
    .min(6, '邀请码至少6位')
    .max(10, '邀请码最多10位')
    .regex(/^[A-Z0-9]+$/, '邀请码只能包含大写字母和数字')
});

// 类型推导
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type InviteCodeData = z.infer<typeof InviteCodeSchema>; 