// 应用配置常量
export const APP_CONFIG = {
  // 免费用户限制
  FREE_CHAPTER_LIMIT: 1, // 免费用户只能访问第1章
  
  // 试用期设置
  TRIAL_DAYS: 3, // 试用期天数
  
  // 模拟考试设置
  SIMULATION_QUESTIONS_COUNT: 30, // 模拟考试题目数量
  SIMULATION_PASS_SCORE: 25, // 模拟考试及格分数
  
  // 验证码设置
  VERIFICATION_CODE_LENGTH: 6, // 验证码长度
  VERIFICATION_CODE_EXPIRES: 300, // 验证码过期时间（秒）
  
  // 密码规则
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 20,
  
  // 昵称规则
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
  
  // 邀请码规则
  INVITE_CODE_LENGTH: 8,
  
  // 分页设置
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;

// 省份信息
export const PROVINCE_INFO = {
  AB: {
    name: '阿尔伯塔省',
    nameEn: 'Alberta',
    code: 'AB'
  },
  BC: {
    name: '不列颠哥伦比亚省',
    nameEn: 'British Columbia',
    code: 'BC'
  },
  ON: {
    name: '安大略省',
    nameEn: 'Ontario',
    code: 'ON'
  }
} as const;

// 错误代码
export const ERROR_CODES = {
  // 认证相关
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 用户相关
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // 验证码相关
  INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',
  VERIFICATION_CODE_EXPIRED: 'VERIFICATION_CODE_EXPIRED',
  
  // 权限相关
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CHAPTER_LOCKED: 'CHAPTER_LOCKED',
  MEMBERSHIP_REQUIRED: 'MEMBERSHIP_REQUIRED',
  
  // 业务逻辑
  QUIZ_SESSION_NOT_FOUND: 'QUIZ_SESSION_NOT_FOUND',
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
  
  // 系统错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

// API端点
export const API_ENDPOINTS = {
  // 认证
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  
  // 用户
  USER_PROFILE: '/api/user/profile',
  UPDATE_PROFILE: '/api/user/update',
  VERIFY_INVITE_CODE: '/api/user/invite-code',
  
  // 手册
  HANDBOOK_TOC: '/api/handbook/toc',
  HANDBOOK_CHAPTER: '/api/handbook/chapter',
  READING_PROGRESS: '/api/handbook/progress',
  
  // 测验
  START_QUIZ: '/api/quiz/start',
  SUBMIT_ANSWER: '/api/quiz/answer',
  FINISH_QUIZ: '/api/quiz/finish',
  QUIZ_HISTORY: '/api/quiz/history',
  
  // 错题本
  WRONG_QUESTIONS: '/api/wrong-questions',
  REMOVE_WRONG_QUESTION: '/api/wrong-questions/remove',
  
  // 管理员
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_QUESTIONS: '/api/admin/questions'
} as const; 