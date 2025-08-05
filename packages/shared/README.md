# Shared Package - 共享类型和工具

🔗 加拿大驾考App的共享类型定义和工具函数包，为所有应用提供统一的类型安全保障。

## ✅ 完成状态

- ✅ **完整类型定义**: API、数据模型、业务逻辑类型
- ✅ **运行时验证**: Zod Schema 验证规则
- ✅ **工具函数**: 常用工具和常量定义
- ✅ **类型安全**: 严格的 TypeScript 类型检查
- ✅ **跨平台兼容**: 支持 Node.js 和 React Native
- ✅ **文档完善**: 详细的类型说明和使用示例

## 📦 包结构

```
packages/shared/
├── src/
│   ├── types/              # 类型定义
│   │   ├── api.ts         # API 相关类型
│   │   ├── user.ts        # 用户系统类型
│   │   ├── handbook.ts    # 手册系统类型
│   │   ├── quiz.ts        # 测验系统类型
│   │   └── index.ts       # 类型总导出
│   ├── utils/             # 工具函数
│   │   ├── constants.ts   # 常量定义
│   │   ├── validation.ts  # 验证工具
│   │   └── index.ts       # 工具总导出
│   └── index.ts           # 包主入口
├── package.json
└── README.md
```

## 🏗️ 类型系统架构

### 📋 类型分类

1. **基础类型** - 基本数据模型
2. **API类型** - 请求/响应/错误处理
3. **业务类型** - 业务逻辑相关
4. **验证Schema** - 运行时数据验证
5. **工具类型** - TypeScript 辅助类型

## 📊 API 类型系统

### 🔄 统一响应格式

```typescript
// 成功响应
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
```

### 🔑 认证相关类型

```typescript
// 用户认证
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends ApiResponse<{
  user: User;
  tokens: AuthTokens;
  isFirstLogin?: boolean;
}> {}

// 注册响应
export interface RegisterResponse extends ApiResponse<{
  user: User;
  tokens: AuthTokens;
  requiresVerification?: boolean;
  verificationMethod?: LoginMethod;
}> {}
```

### 🚨 错误代码枚举

```typescript
export enum ApiErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 认证错误
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 业务错误
  MEMBERSHIP_REQUIRED = 'MEMBERSHIP_REQUIRED',
  CHAPTER_LOCKED = 'CHAPTER_LOCKED',
  INVITE_CODE_EXPIRED = 'INVITE_CODE_EXPIRED',
  
  // 系统错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

## 👥 用户系统类型

### 🔐 用户基础类型

```typescript
// 枚举定义
export const Province = {
  AB: 'AB',    // Alberta
  BC: 'BC',    // British Columbia  
  ON: 'ON'     // Ontario
} as const;

export const UserType = {
  FREE: 'FREE',         // 免费用户
  TRIAL: 'TRIAL',       // 试用用户
  MEMBER: 'MEMBER'      // 会员用户
} as const;

export const LoginMethod = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  GOOGLE: 'GOOGLE'
} as const;

// 用户信息
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
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建用户数据
export interface NewUser {
  nickname: string;
  email?: string;
  phone?: string;
  googleId?: string;
  passwordHash?: string;
  primaryLoginMethod: LoginMethod;
  province: Province;
}
```

### ✅ 用户验证Schema

```typescript
// 用户注册验证
export const UserRegistrationSchema = z.object({
  nickname: z.string()
    .min(2, '昵称至少2个字符')
    .max(20, '昵称不能超过20个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, '昵称只能包含中文、英文、数字和下划线'),
    
  email: z.string()
    .email('邮箱格式不正确')
    .optional(),
    
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .optional(),
    
  password: z.string()
    .min(8, '密码至少8位')
    .max(20, '密码不能超过20位')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '密码必须包含字母和数字'),
    
  province: z.enum(['AB', 'BC', 'ON'], {
    errorMap: () => ({ message: '请选择有效的省份' })
  }),
}).refine(
  (data) => data.email || data.phone,
  {
    message: '邮箱或手机号至少填写一项',
    path: ['email']
  }
);

// 登录验证
export const LoginSchema = z.object({
  loginValue: z.string().min(1, '请输入登录账号'),
  password: z.string().min(1, '请输入密码'),
  loginMethod: z.enum(['EMAIL', 'PHONE']),
});
```

## 📚 手册系统类型

### 📖 章节和内容类型

```typescript
// 章节状态
export const ChapterStatus = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED', 
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

// 内容格式
export const ContentFormat = {
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN',
  PLAIN_TEXT: 'PLAIN_TEXT'
} as const;

// 发布状态
export const PublishStatus = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

// 付费类型
export const PaymentType = {
  FREE: 'FREE',                    // 免费内容
  MEMBER_ONLY: 'MEMBER_ONLY',      // 仅会员
  TRIAL_INCLUDED: 'TRIAL_INCLUDED', // 试用包含
  PREMIUM: 'PREMIUM'               // 高级内容
} as const;

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
  coverImageUrl?: string;
  paymentType: PaymentType;
  freePreviewSections: number;
  prerequisiteChapters: string[];
  publishStatus: PublishStatus;
  publishedAt?: string;
  authorId?: string;
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
  isFree: boolean;
  requiredUserType: string[];
  wordCount: number;
  estimatedReadTime: number; // 秒数
  createdAt: string;
  updatedAt: string;
}

// 完整章节数据（包含段落）
export interface ChapterWithSections extends HandbookChapter {
  sections: HandbookSection[];
  totalSections: number;
  freeSections: number;
  userCanAccess: boolean;
}
```

### 🖼️ 图片和版本类型

```typescript
// 图片用途
export const ImageUsage = {
  CONTENT: 'content',        // 内容图片
  COVER: 'cover',           // 封面图片
  DIAGRAM: 'diagram',       // 图表
  ILLUSTRATION: 'illustration' // 插图
} as const;

// 图片资源
export interface HandbookImage {
  id: string;
  chapterId?: string;
  sectionId?: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  captionEn?: string;
  usage: ImageUsage;
  order: number;
  uploadedBy?: string;
  createdAt: string;
}

// 阅读进度
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
```

### ✅ 手册验证Schema

```typescript
// 创建章节验证
export const CreateChapterSchema = z.object({
  title: z.string()
    .min(1, '章节标题不能为空')
    .max(200, '标题长度不能超过200字符'),
    
  titleEn: z.string()
    .max(200, '英文标题长度不能超过200字符')
    .optional(),
    
  description: z.string()
    .min(1, '章节描述不能为空'),
    
  order: z.number()
    .int()
    .min(1, '章节顺序必须大于0'),
    
  estimatedReadTime: z.number()
    .int()
    .min(1, '预估阅读时间必须大于0'),
    
  paymentType: z.enum(['FREE', 'MEMBER_ONLY', 'TRIAL_INCLUDED', 'PREMIUM'])
    .default('FREE'),
    
  freePreviewSections: z.number()
    .int()
    .min(0, '免费预览段落数不能小于0')
    .default(0),
});

// 创建段落验证
export const CreateSectionSchema = z.object({
  chapterId: z.string().min(1, '章节ID不能为空'),
  title: z.string()
    .min(1, '段落标题不能为空')
    .max(200, '标题长度不能超过200字符'),
  order: z.number().int().min(1, '段落顺序必须大于0'),
  content: z.string().min(1, '段落内容不能为空'),
  isFree: z.boolean().default(true),
});
```

## 🧠 测验系统类型

### 🎯 题目和测验类型

```typescript
// 题目类型
export const QuestionType = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',     // 单选题
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE', // 多选题
  TRUE_FALSE: 'TRUE_FALSE'            // 判断题
} as const;

// 测验类型
export const QuizType = {
  CHAPTER: 'CHAPTER',                 // 章节练习
  SIMULATION: 'SIMULATION',           // 模拟考试
  WRONG_QUESTIONS: 'WRONG_QUESTIONS'  // 错题练习
} as const;

// 语言设置
export const Language = {
  ZH: 'ZH',      // 中文
  EN: 'EN',      // 英文
  HYBRID: 'HYBRID' // 混合（中英文）
} as const;

// 题目
export interface Question {
  id: string;
  chapterId: string;
  type: QuestionType;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  imageUrl?: string;
  explanation: string;
  explanationEn?: string;
  difficulty: number; // 1-5 难度等级
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 题目选项
export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  textEn?: string;
  isCorrect: boolean;
  order: number;
  createdAt: string;
}

// 完整题目（包含选项）
export interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}
```

### 📊 测验会话和答题类型

```typescript
// 测验会话
export interface QuizSession {
  id: string;
  userId: string;
  type: QuizType;
  chapterId?: string;
  language: Language;
  questionIds: string[];
  startTime: string;
  endTime?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // 秒数
  isCompleted: boolean;
  isPassed?: boolean; // 仅模拟考试
  createdAt: string;
}

// 用户答题记录
export interface UserAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: string;
}

// 测验统计
export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  completionRate: number;
  passRate: number; // 仅模拟考试
}

// 错题记录
export interface WrongQuestion {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  incorrectCount: number;
  firstAttemptAt: string;
  lastAttemptAt: string;
  isMastered: boolean;
  masteredAt?: string;
  createdAt: string;
}
```

## 🔧 工具函数和常量

### 📊 常量定义

```typescript
// constants.ts

// 应用配置
export const APP_CONFIG = {
  // 分页配置
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 时间配置
  TOKEN_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
  VERIFICATION_CODE_EXPIRE: 10 * 60 * 1000, // 10分钟
  
  // 文件上传
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // 测验配置
  SIMULATION_QUESTION_COUNT: 30,
  SIMULATION_PASS_SCORE: 25,
  CHAPTER_QUIZ_MIN_QUESTIONS: 5,
  
  // 阅读配置
  WORDS_PER_MINUTE_ZH: 200,
  WORDS_PER_MINUTE_EN: 250,
} as const;

// 路由常量
export const API_ROUTES = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  
  // 手册相关
  HANDBOOK: {
    CHAPTERS: '/api/handbook/chapters',
    CHAPTER_BY_ID: (id: string) => `/api/handbook/chapters/${id}`,
    SECTIONS: '/api/content/save',
    SECTION_BY_ID: (id: string) => `/api/content/${id}`,
  },
  
  // 移动端API
  MOBILE: {
    CHAPTERS: '/api/mobile/chapters',
    CONTENT: (id: string) => `/api/mobile/content/${id}`,
  },
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足，无法执行此操作',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入信息有误，请检查后重试',
  SERVER_ERROR: '服务器暂时无法响应，请稍后重试',
} as const;
```

### 🔍 验证工具

```typescript
// validation.ts

// 手机号验证
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 邮箱验证
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 密码强度检查
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('密码至少需要8位字符');
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('密码需要包含小写字母');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('密码需要包含大写字母');
  
  if (/\d/.test(password)) score++;
  else feedback.push('密码需要包含数字');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push('密码建议包含特殊字符');
  
  return {
    isValid: score >= 3,
    score,
    feedback,
  };
}

// 验证码格式检查
export function isValidVerificationCode(code: string): boolean {
  return /^\d{4,6}$/.test(code);
}

// 昵称验证
export function validateNickname(nickname: string): {
  isValid: boolean;
  error?: string;
} {
  if (nickname.length < 2) {
    return { isValid: false, error: '昵称至少需要2个字符' };
  }
  
  if (nickname.length > 20) {
    return { isValid: false, error: '昵称不能超过20个字符' };
  }
  
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(nickname)) {
    return { isValid: false, error: '昵称只能包含中文、英文、数字和下划线' };
  }
  
  return { isValid: true };
}
```

### 🕒 时间工具

```typescript
// 时间格式化
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 阅读时间估算
export function estimateReadingTime(content: string, language: Language = 'ZH'): number {
  const plainText = content.replace(/<[^>]*>/g, ''); // 移除HTML标签
  const wordCount = plainText.length;
  
  const wordsPerMinute = language === 'EN' 
    ? APP_CONFIG.WORDS_PER_MINUTE_EN 
    : APP_CONFIG.WORDS_PER_MINUTE_ZH;
    
  return Math.ceil(wordCount / wordsPerMinute * 60); // 返回秒数
}

// 相对时间显示
export function getRelativeTime(date: string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return target.toLocaleDateString('zh-CN');
}
```

## 🎯 使用示例

### 在 Admin 应用中使用

```typescript
// apps/admin/src/app/api/content/route.ts
import { CreateSectionSchema, ApiErrorCode, createSuccessResponse } from 'shared';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = CreateSectionSchema.parse(data);
    
    // 使用验证后的数据
    const section = await createSection(validatedData);
    
    return createSuccessResponse(section, '段落创建成功');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        '数据验证失败',
        400,
        error.errors
      );
    }
    throw error;
  }
}
```

### 在 Mobile 应用中使用

```typescript
// apps/mobile/stores/userStore.ts
import { User, UserType, Province } from 'shared';
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  isLoggedIn: boolean;
  canAccessContent: (paymentType: PaymentType) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoggedIn: () => !!get().user,
  
  canAccessContent: (paymentType) => {
    const { user } = get();
    if (!user) return paymentType === 'FREE';
    
    switch (paymentType) {
      case 'FREE': return true;
      case 'TRIAL_INCLUDED': return ['TRIAL', 'MEMBER'].includes(user.userType);
      case 'MEMBER_ONLY': 
      case 'PREMIUM': return user.userType === 'MEMBER';
      default: return false;
    }
  },
}));
```

### API 调用示例

```typescript
// apps/mobile/hooks/useApi.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiResponse, ChapterWithSections, QuizSession } from 'shared';

export function useChapters(userType: UserType, language: Language) {
  return useQuery({
    queryKey: ['chapters', userType, language],
    queryFn: async (): Promise<ChapterWithSections[]> => {
      const response = await fetch(
        `/api/mobile/chapters?userType=${userType}&language=${language}`
      );
      const data: ApiResponse<ChapterWithSections[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || '获取章节失败');
      }
      
      return data.data || [];
    },
  });
}

export function useCreateQuizSession() {
  return useMutation({
    mutationFn: async (data: { chapterId: string; type: QuizType }): Promise<QuizSession> => {
      const response = await fetch('/api/quiz/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<QuizSession> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '创建测验失败');
      }
      
      return result.data!;
    },
  });
}
```

## 📦 构建和发布

### 构建命令

```bash
# 构建类型定义
pnpm build

# 监听模式构建
pnpm dev

# 类型检查
pnpm type-check

# 清理构建产物
pnpm clean
```

### 版本管理

```typescript
// 类型版本兼容性
export const TYPE_VERSION = '1.0.0';

// 向后兼容的类型变更
export interface UserV1 {
  id: string;
  name: string; // 已弃用，使用 nickname
  nickname: string;
  // ... 其他字段
}

// 类型迁移工具
export function migrateUserV1ToV2(userV1: UserV1): User {
  return {
    ...userV1,
    nickname: userV1.nickname || userV1.name,
  };
}
```

## 🔗 依赖其他包

```typescript
// 在其他包中使用
import { 
  User, 
  ApiResponse, 
  CreateChapterSchema,
  validatePasswordStrength,
  APP_CONFIG 
} from 'shared';

// 或按模块导入
import { User, UserType } from 'shared/types/user';
import { validatePasswordStrength } from 'shared/utils/validation';
```

---

## 🤝 贡献指南

1. **类型定义**: 先定义接口，再实现具体逻辑
2. **向后兼容**: 谨慎修改现有类型，优先添加可选字段
3. **验证Schema**: 每个输入类型都应有对应的Zod验证
4. **文档更新**: 及时更新类型说明和使用示例
5. **测试覆盖**: 重要的工具函数需要单元测试

**🔗 让类型成为代码质量的坚实保障！🛡️** 