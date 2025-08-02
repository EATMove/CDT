import { User, LoginMethod } from './user';

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 认证相关API
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends ApiResponse<{
  user: User;
  tokens: AuthTokens;
  isFirstLogin?: boolean; // 是否首次登录
}> {}

// 注册响应
export interface RegisterResponse extends ApiResponse<{
  user: User;
  tokens: AuthTokens;
  requiresVerification?: boolean; // 是否需要验证
  verificationMethod?: LoginMethod; // 验证方式
}> {}

// 验证码发送响应
export interface VerificationCodeResponse extends ApiResponse<{
  expiresIn: number; // 验证码有效期（秒）
  canResendAfter: number; // 多少秒后可以重新发送
}> {}

// 密码重置响应
export interface PasswordResetResponse extends ApiResponse<{
  resetToken?: string; // 重置令牌（某些情况下可能需要）
  expiresIn: number;
}> {}

// Google登录验证响应
export interface GoogleAuthResponse extends ApiResponse<{
  isNewUser: boolean; // 是否是新用户
  needsProfileCompletion: boolean; // 是否需要完善个人资料
  user: User;
  tokens: AuthTokens;
}> {}

// 用户资料更新响应
export interface ProfileUpdateResponse extends ApiResponse<{
  user: User;
}> {}

// 文件上传响应
export interface UploadResponse extends ApiResponse<{
  fileId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}> {}

// WebSocket消息类型
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

// 用户状态检查响应
export interface UserStatusResponse extends ApiResponse<{
  isLoggedIn: boolean;
  user?: User;
  membershipStatus: {
    isMember: boolean;
    isTrialActive: boolean;
    trialDaysLeft?: number;
    membershipDaysLeft?: number;
  };
}> {}

// 邀请码使用响应
export interface InviteCodeUseResponse extends ApiResponse<{
  trialDays: number;
  trialEndDate: string;
  user: User;
}> {}

// 常用状态码
export enum ApiErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 认证错误
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  PHONE_EXISTS = 'PHONE_EXISTS',
  GOOGLE_ID_EXISTS = 'GOOGLE_ID_EXISTS',
  
  // 验证码错误
  INVALID_VERIFICATION_CODE = 'INVALID_VERIFICATION_CODE',
  VERIFICATION_CODE_EXPIRED = 'VERIFICATION_CODE_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  
  // 权限错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // 业务错误
  MEMBERSHIP_REQUIRED = 'MEMBERSHIP_REQUIRED',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  CHAPTER_LOCKED = 'CHAPTER_LOCKED',
  INVALID_INVITE_CODE = 'INVALID_INVITE_CODE',
  INVITE_CODE_EXPIRED = 'INVITE_CODE_EXPIRED',
  INVITE_CODE_USED = 'INVITE_CODE_USED',
  
  // 系统错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
} 