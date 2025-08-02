# 用户表结构更新说明

## 更新概述

本次更新将用户登录方式从微信登录改为支持邮箱/手机号/Google登录，以适应北美市场的使用习惯。

## 主要变更

### 1. 登录方式枚举更新
```typescript
// 之前
export const loginMethodEnum = pgEnum('login_method', ['WECHAT', 'EMAIL', 'PHONE']);

// 现在
export const loginMethodEnum = pgEnum('login_method', ['EMAIL', 'PHONE', 'GOOGLE']);
```

### 2. 用户表字段变更

#### 移除字段
- `wechatId` - 微信ID字段已移除

#### 新增字段
- `googleId` - Google账号ID
- `primaryLoginMethod` - 用户主要使用的登录方式
- `googleVerified` - Google账号验证状态
- `lastLoginMethod` - 最后一次使用的登录方式

#### 修改字段
- `passwordHash` - 添加注释说明：邮箱/手机登录需要密码，Google登录不需要

### 3. 完整的用户表结构

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  google_id VARCHAR(100) UNIQUE,
  password_hash TEXT,
  primary_login_method login_method NOT NULL,
  province province NOT NULL,
  user_type user_type NOT NULL DEFAULT 'FREE',
  trial_end_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  invite_code VARCHAR(10) UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  google_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  last_login_method login_method,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## 登录方式支持

### 1. 邮箱登录 (EMAIL)
- **必需字段**: `email`, `passwordHash`
- **验证状态**: `emailVerified`
- **使用场景**: 传统邮箱+密码登录方式

### 2. 手机登录 (PHONE)
- **必需字段**: `phone`, `passwordHash`
- **验证状态**: `phoneVerified`
- **使用场景**: 北美手机号+密码登录方式
- **格式验证**: 支持美国/加拿大手机号格式

### 3. Google登录 (GOOGLE)
- **必需字段**: `googleId`, `email` (来自Google)
- **验证状态**: `googleVerified`
- **使用场景**: Google OAuth 2.0 登录
- **特点**: 无需密码，使用Google Token验证

## 验证码系统增强

### 验证码类型扩展
```typescript
// 新增验证码类型
type: 'register' | 'reset_password' | 'login' | 'phone_verification' | 'email_verification'
```

### 支持场景
- **注册验证**: 邮箱/手机号注册时的验证码
- **登录验证**: 可选的双因素认证
- **密码重置**: 忘记密码时的验证码
- **绑定验证**: 绑定新的邮箱/手机号

## TypeScript 类型更新

### 用户接口增强
```typescript
export interface User {
  // ... 其他字段
  googleId?: string;
  primaryLoginMethod: LoginMethod;
  emailVerified: boolean;
  phoneVerified: boolean;
  googleVerified: boolean;
  lastLoginMethod?: LoginMethod;
}
```

### 登录Schema优化
```typescript
// 支持判别联合类型，确保类型安全
export const LoginSchema = z.discriminatedUnion('loginMethod', [
  // 邮箱登录
  z.object({
    loginMethod: z.literal('EMAIL'),
    email: z.string().email(),
    password: z.string().min(1)
  }),
  // 手机登录
  z.object({
    loginMethod: z.literal('PHONE'),
    phone: z.string().regex(/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/),
    password: z.string().min(1)
  }),
  // Google登录
  z.object({
    loginMethod: z.literal('GOOGLE'),
    googleToken: z.string().min(1),
    googleId: z.string().min(1)
  })
]);
```

## API接口影响

### 新增接口响应类型
- `GoogleAuthResponse` - Google登录响应
- `VerificationCodeResponse` - 验证码发送响应
- `PasswordResetResponse` - 密码重置响应

### 错误码扩展
- `GOOGLE_ID_EXISTS` - Google ID已存在
- `PHONE_EXISTS` - 手机号已存在
- `INVALID_VERIFICATION_CODE` - 验证码无效
- `TOO_MANY_ATTEMPTS` - 尝试次数过多

## 种子数据示例

系统包含了4个示例用户，展示不同登录方式：

1. **张小明** - 邮箱登录，会员用户
2. **李小红** - 手机登录，试用用户
3. **John Smith** - Google登录，免费用户
4. **王小华** - 邮箱登录，免费用户（已绑定手机）

## 迁移注意事项

### 数据库迁移
1. 需要创建新的枚举值
2. 删除 `wechat_id` 列
3. 添加新的列和约束
4. 更新现有数据的 `primary_login_method`

### 应用程序适配
1. 更新登录流程逻辑
2. 集成Google OAuth SDK
3. 实现手机号验证服务
4. 更新用户界面组件

## 配置选项

新增应用配置项：
- `GOOGLE_OAUTH_ENABLED` - 是否启用Google登录
- `PHONE_LOGIN_ENABLED` - 是否启用手机号登录

这些配置允许在不同环境中灵活控制登录方式的可用性。 