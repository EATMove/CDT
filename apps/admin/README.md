# 加拿大驾考App - 管理后台

这是加拿大驾考App的管理后台，用于管理手册内容、题目、用户数据等。

## 🚀 已完善的功能

### 📚 Handbook（手册）管理 API

#### 章节管理
- `POST /api/handbook/chapters` - 创建新章节
- `GET /api/handbook/chapters` - 获取章节列表（支持分页、筛选、排序）
- `GET /api/handbook/chapters/[id]` - 获取单个章节详情（包含段落）
- `PUT /api/handbook/chapters/[id]` - 更新章节信息
- `DELETE /api/handbook/chapters/[id]` - 删除章节（检查关联段落）

#### 段落内容管理
- `POST /api/content/save` - 创建或更新段落内容
- `GET /api/content/save` - 获取段落列表（支持按章节筛选、分页）
- `GET /api/content/[id]` - 获取单个段落内容
- `PUT /api/content/[id]` - 更新段落内容
- `DELETE /api/content/[id]` - 删除段落

#### 图片管理
- `POST /api/images/upload` - 上传图片到云存储并保存记录
- `GET /api/images/upload` - 获取图片列表（按章节/段落筛选）

### 📱 移动端 API

#### 章节内容获取
- `GET /api/mobile/chapters` - 获取移动端章节列表
  - 支持用户类型权限控制（FREE/TRIAL/MEMBER）
  - 支持多语言（中文/英文）
  - 返回访问权限和学习进度信息

#### 内容详情
- `GET /api/mobile/content/[id]` - 获取章节详细内容
  - 根据用户权限返回完整或预览内容
  - 支持免费预览段落机制
  - 多语言内容支持

### 🔧 基础设施

#### 数据库连接
- 统一的数据库连接管理（`/lib/database.ts`）
- 支持连接池和事务处理
- 使用 Drizzle ORM 进行类型安全的数据库操作

#### 认证和权限
- JWT token 验证（`/lib/auth.ts`）
- 基于用户类型的权限控制
- API 路由保护中间件

#### 工具函数
- 统一的 API 响应格式（`/lib/utils.ts`）
- 错误处理和验证工具
- 类型安全的响应创建

## 🏗️ 技术栈

- **框架**: Next.js 15.4+ (App Router)
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: JWT + bcryptjs
- **文件存储**: Vercel Blob
- **类型检查**: TypeScript
- **UI组件**: Radix UI + Tailwind CSS
- **代码编辑**: Monaco Editor

## 📊 数据库设计

### 主要表结构

#### 手册相关
- `handbook_chapters` - 章节信息
- `handbook_sections` - 段落内容
- `handbook_images` - 图片资源
- `handbook_content_versions` - 内容版本控制

#### 用户相关
- `users` - 用户信息
- `verification_codes` - 验证码

#### 测验相关
- `questions` - 题目
- `question_options` - 选项
- `quiz_sessions` - 测验会话
- `user_answers` - 用户答题记录

#### 进度相关
- `chapter_progress` - 章节学习进度
- `wrong_questions` - 错题记录
- `learning_stats` - 学习统计

## 🔐 权限控制

### 用户类型
- `FREE` - 免费用户（可访问免费内容和预览）
- `TRIAL` - 试用用户（可访问试用包含的内容）
- `MEMBER` - 会员用户（可访问所有内容）

### 内容访问控制
- `FREE` - 所有用户可访问
- `TRIAL_INCLUDED` - 试用和会员可访问
- `MEMBER_ONLY` - 仅会员可访问
- `PREMIUM` - 高级会员可访问

## 🚀 部署和开发

### 环境变量
```env
DATABASE_URL=postgresql://localhost:5432/canadian_driving_test
JWT_SECRET=your-secret-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### 开发命令
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 构建
pnpm build
```

## 📝 API 文档

### 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数错误",
    "details": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误代码
- `VALIDATION_ERROR` - 参数验证错误
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 权限不足
- `DATABASE_ERROR` - 数据库错误
- `MEMBERSHIP_REQUIRED` - 需要会员权限
- `EXTERNAL_SERVICE_ERROR` - 外部服务错误

## 🔄 下一步开发计划

- [ ] 题目管理 API（CRUD操作）
- [ ] 用户管理和认证系统完善
- [ ] 学习进度追踪 API
- [ ] 测验系统 API
- [ ] 统计和分析 API
- [ ] 实时通知系统
- [ ] 数据导入导出功能

## 🤝 贡献

请确保所有 API 变更都包含：
1. 适当的错误处理
2. 类型安全的数据验证
3. 权限检查
4. 测试覆盖
5. 文档更新
