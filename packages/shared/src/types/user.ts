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

// 登录方式枚举 - 更新为支持邮箱/手机/Google登录
export const LoginMethod = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  GOOGLE: 'GOOGLE'
} as const;

export type LoginMethod = typeof LoginMethod[keyof typeof LoginMethod];

// 用户基础信息
export interface User {
  id: string;
  nickname: string;
  email?: string;
  phone?: string;
  googleId?: string;
  primaryLoginMethod: LoginMethod;
  province: Province;
  userType: UserType;
  trialEndDate?: string;
  membershipEndDate?: string;
  inviteCode?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  googleVerified: boolean;
  lastLoginMethod?: LoginMethod;
  createdAt: string;
  updatedAt: string;
}

// Zod 验证模式
export const RegisterSchema = z.object({
  nickname: z.string()
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, '昵称只能包含中文、英文、数字和下划线'),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  phone: z.string()
    .regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, '请输入有效的北美手机号码')
    .optional(),
  password: z.string()
    .min(8, '密码至少8个字符')
    .max(20, '密码最多20个字符')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).*$|^(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).*$|^(?=.*\d)(?=.*[!@#$%^&*]).*$/, 
           '密码必须包含字母、数字、符号中的至少两种'),
  verificationCode: z.string()
    .min(4, '验证码至少4位')
    .max(6, '验证码最多6位')
    .regex(/^\d+$/, '验证码只能是数字'),
  loginMethod: z.enum(['EMAIL', 'PHONE'])
}).refine((data) => {
  // 确保邮箱注册时提供邮箱，手机注册时提供手机号
  if (data.loginMethod === 'EMAIL') {
    return !!data.email;
  }
  if (data.loginMethod === 'PHONE') {
    return !!data.phone;
  }
  return true;
}, {
  message: '请根据选择的登录方式提供对应的邮箱或手机号',
});

export const LoginSchema = z.discriminatedUnion('loginMethod', [
  // 邮箱登录
  z.object({
    loginMethod: z.literal('EMAIL'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(1, '请输入密码')
  }),
  // 手机登录
  z.object({
    loginMethod: z.literal('PHONE'),
    phone: z.string().regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, '请输入有效的北美手机号码'),
    password: z.string().min(1, '请输入密码')
  }),
  // Google登录
  z.object({
    loginMethod: z.literal('GOOGLE'),
    googleToken: z.string().min(1, 'Google登录令牌不能为空'),
    googleId: z.string().min(1, 'Google ID不能为空')
  })
]);

export const InviteCodeSchema = z.object({
  inviteCode: z.string()
    .min(6, '邀请码至少6位')
    .max(10, '邀请码最多10位')
    .regex(/^[A-Z0-9]+$/, '邀请码只能包含大写字母和数字')
});

// 手机验证码验证
export const PhoneVerificationSchema = z.object({
  phone: z.string().regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, '请输入有效的北美手机号码'),
  code: z.string()
    .min(4, '验证码至少4位')
    .max(6, '验证码最多6位')
    .regex(/^\d+$/, '验证码只能是数字')
});

// 邮箱验证码验证
export const EmailVerificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string()
    .min(4, '验证码至少4位')
    .max(6, '验证码最多6位')
    .regex(/^\d+$/, '验证码只能是数字')
});

// 忘记密码
export const ForgotPasswordSchema = z.object({
  loginMethod: z.enum(['EMAIL', 'PHONE']),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  phone: z.string().regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, '请输入有效的北美手机号码').optional()
}).refine((data) => {
  if (data.loginMethod === 'EMAIL') {
    return !!data.email;
  }
  if (data.loginMethod === 'PHONE') {
    return !!data.phone;
  }
  return true;
}, {
  message: '请根据选择的方式提供对应的邮箱或手机号',
});

// 重置密码
export const ResetPasswordSchema = z.object({
  loginMethod: z.enum(['EMAIL', 'PHONE']),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/).optional(),
  code: z.string()
    .min(4, '验证码至少4位')
    .max(6, '验证码最多6位')
    .regex(/^\d+$/, '验证码只能是数字'),
  newPassword: z.string()
    .min(8, '密码至少8个字符')
    .max(20, '密码最多20个字符')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).*$|^(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).*$|^(?=.*\d)(?=.*[!@#$%^&*]).*$/, 
           '密码必须包含字母、数字、符号中的至少两种')
}).refine((data) => {
  if (data.loginMethod === 'EMAIL') {
    return !!data.email;
  }
  if (data.loginMethod === 'PHONE') {
    return !!data.phone;
  }
  return true;
});

// 类型推导
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type InviteCodeData = z.infer<typeof InviteCodeSchema>;
export type PhoneVerificationData = z.infer<typeof PhoneVerificationSchema>;
export type EmailVerificationData = z.infer<typeof EmailVerificationSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>; 