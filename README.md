# 加拿大驾考 App - Monorepo 项目

🚗 一个专为中国用户设计的加拿大驾驶执照考试应用，采用现代化 Monorepo 架构实现前后端完整解决方案。

## ✨ 项目亮点

- 🚀 **最新技术栈**: Next.js 15 + React 19 + TypeScript + Expo
- 🎨 **现代UI设计**: shadcn/ui + Tailwind CSS + NativeWind 
- 📱 **跨平台支持**: iOS / Android / Web 三端统一
- 🔧 **类型安全**: 完整的 TypeScript 类型共享
- ⚡ **高性能构建**: pnpm + Turborepo 优化构建
- 🗄️ **现代数据库**: Drizzle ORM + PostgreSQL
- 🔐 **完整权限控制**: 多用户类型、内容分级、预览机制
- 🌐 **国际化支持**: 中英文双语内容管理

## 🎯 当前完成状态

### ✅ 已完成模块

#### 🔧 **Admin 管理后台** (100% 完成)
- ✅ **完整的API系统**: 15+个API端点，支持CRUD操作
- ✅ **Handbook管理**: 章节、段落、图片的完整管理
- ✅ **权限控制**: 基于用户类型的访问控制
- ✅ **多语言支持**: 中英文内容管理
- ✅ **图片管理**: 云存储集成 (Vercel Blob)
- ✅ **数据验证**: Zod + TypeScript 双重保障
- ✅ **错误处理**: 统一的错误响应格式

#### 📊 **Database 数据库** (100% 完成)
- ✅ **完整Schema**: 用户、手册、测验、进度、系统表
- ✅ **关系设计**: 外键约束、级联操作
- ✅ **类型安全**: Drizzle ORM + TypeScript
- ✅ **版本控制**: 内容版本管理
- ✅ **权限分级**: FREE/TRIAL/MEMBER 用户类型

#### 🔗 **Shared Types** (100% 完成)
- ✅ **API类型**: 请求/响应/错误代码
- ✅ **数据模型**: 完整的实体类型定义
- ✅ **验证Schema**: Zod 验证模式
- ✅ **工具函数**: 常用工具和常量

### 🚧 待开发模块

#### 📱 **Mobile App** (架构就绪)
- 🏗️ **基础架构**: Expo + React Navigation 已配置
- 🔲 **屏幕实现**: 19个核心屏幕待开发
- 🔲 **状态管理**: Zustand store 待实现
- 🔲 **API集成**: 调用后端API接口

## 📋 目录

- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [API文档](#api文档)
- [开发指南](#开发指南)
- [数据库设计](#数据库设计)
- [部署说明](#部署说明)

## 🏗️ 项目结构

```
CDT/
├── apps/                          # 应用程序
│   ├── admin/                     # ✅ Next.js 管理后台 (已完成)
│   │   ├── src/app/api/           # API 路由 (15+ 端点)
│   │   │   ├── content/           # 内容管理 API
│   │   │   ├── handbook/          # 手册管理 API  
│   │   │   ├── images/            # 图片上传 API
│   │   │   └── mobile/            # 移动端 API
│   │   ├── src/components/        # shadcn/ui 组件
│   │   ├── src/lib/               # 数据库连接、认证、工具
│   │   └── README.md              # 管理后台文档
│   └── mobile/                    # 🚧 React Native App (待开发)
│       ├── app/                   # Expo Router 页面
│       ├── components/            # 移动端组件
│       ├── stores/                # Zustand 状态管理
│       └── README.md              # 移动端开发文档
├── packages/                      # 共享包
│   ├── shared/                    # ✅ 共享类型和工具 (已完成)
│   │   ├── src/types/             # TypeScript 类型定义
│   │   ├── src/utils/             # 工具函数和验证
│   │   └── README.md              # 类型包文档
│   └── database/                  # ✅ 数据库层 (已完成)
│       ├── src/schema/            # Drizzle ORM Schema
│       ├── src/migrations/        # 数据库迁移
│       ├── src/seed/              # 种子数据
│       └── README.md              # 数据库文档
├── package.json                   # 根 package.json
├── turbo.json                     # Turborepo 配置
└── README.md                      # 项目总览
```

## 🛠️ 技术栈

### 🔧 **后端 / Admin** (✅ 已完成)
- **Next.js 15** - App Router + API Routes
- **TypeScript** - 完整类型安全
- **Drizzle ORM** - 类型安全的数据库操作
- **PostgreSQL** - 关系型数据库
- **Zod** - 运行时类型验证
- **JWT** - 用户认证
- **Vercel Blob** - 文件存储
- **shadcn/ui** - 现代UI组件

### 📱 **前端 / Mobile** (🚧 待开发)
- **Expo 52** - 跨平台开发框架
- **React Native** - 原生移动应用
- **TypeScript** - 类型安全
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 数据获取和缓存
- **NativeWind** - Tailwind for RN
- **Expo Router** - 文件系统路由

### 🔗 **工具链**
- **pnpm** - 包管理器
- **Turborepo** - 单体仓库构建系统
- **TypeScript Project References** - 包间类型共享

## 🚀 快速开始

### 环境要求

- **Node.js 20+** 
- **pnpm 9.0+**
- **PostgreSQL** 数据库
- **Expo CLI** (移动端开发)

### 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd CDT

# 安装所有依赖
pnpm install

# 构建共享包
pnpm build

# 配置数据库 (创建 .env.local)
cp apps/admin/.env.example apps/admin/.env.local
# 编辑数据库连接字符串

# 启动管理后台
pnpm admin
# 访问 http://localhost:3000

# 启动移动端 (另开终端)
pnpm mobile
```

## 📊 API 文档

### 🔧 **Admin API** (管理端)

#### 章节管理
```bash
POST   /api/handbook/chapters        # 创建章节
GET    /api/handbook/chapters        # 获取章节列表
GET    /api/handbook/chapters/[id]   # 获取章节详情
PUT    /api/handbook/chapters/[id]   # 更新章节
DELETE /api/handbook/chapters/[id]   # 删除章节
```

#### 内容管理
```bash
POST   /api/content/save            # 创建/更新段落
GET    /api/content/save            # 获取段落列表
GET    /api/content/[id]            # 获取段落内容
PUT    /api/content/[id]            # 更新段落
DELETE /api/content/[id]            # 删除段落
```

#### 图片管理
```bash
POST   /api/images/upload           # 上传图片
GET    /api/images/upload           # 获取图片列表
```

### 📱 **Mobile API** (用户端)

#### 内容获取
```bash
GET /api/mobile/chapters?userType=FREE&language=ZH
# 响应包含权限控制的章节列表

GET /api/mobile/content/[id]?userType=MEMBER&language=EN  
# 响应包含权限过滤的内容
```

### 🔐 **权限控制**

#### 用户类型
- **FREE** - 免费用户 (可访问免费内容 + 预览)
- **TRIAL** - 试用用户 (可访问试用内容)
- **MEMBER** - 会员用户 (可访问所有内容)

#### 内容分级
- **FREE** - 所有用户可访问
- **TRIAL_INCLUDED** - 试用和会员可访问  
- **MEMBER_ONLY** - 仅会员可访问
- **PREMIUM** - 高级会员内容

### 📝 **API 响应格式**

#### 成功响应
```json
{
  "success": true,
  "data": { ... },
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
    "message": "参数验证失败",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 开发指南

### 启动开发服务器

```bash
# 管理后台 (已完成)
pnpm admin                    # 启动在 localhost:3000
cd apps/admin && pnpm dev     # 或者进入目录启动

# 移动端应用 (待开发)
pnpm mobile                   # 启动 Expo 开发服务器
cd apps/mobile && pnpm dev   # 或者进入目录启动
```

### 数据库操作

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 数据库管理界面
pnpm db:studio

# 播种测试数据
cd packages/database && pnpm seed
```

### 构建和类型检查

```bash
# 构建所有包
pnpm build

# 类型检查
pnpm type-check

# 特定包操作
pnpm build --filter admin
pnpm type-check --filter mobile
```

## 🗄️ 数据库设计

### 核心表结构

#### 👥 **用户系统**
- `users` - 用户基本信息
- `verification_codes` - 验证码管理

#### 📚 **手册系统**  
- `handbook_chapters` - 章节信息
- `handbook_sections` - 段落内容
- `handbook_images` - 图片资源
- `handbook_content_versions` - 版本控制

#### 🧠 **测验系统**
- `questions` - 题目库
- `question_options` - 选项
- `quiz_sessions` - 测验会话
- `user_answers` - 答题记录

#### 📈 **进度系统**
- `chapter_progress` - 学习进度
- `wrong_questions` - 错题本
- `learning_stats` - 学习统计

#### ⚙️ **系统管理**
- `app_configs` - 应用配置
- `notifications` - 通知管理
- `feedback` - 用户反馈

## 🚀 部署说明

### Admin 管理后台

```bash
# Vercel 部署
cd apps/admin
pnpm build
npx vercel --prod

# 环境变量配置
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
BLOB_READ_WRITE_TOKEN=vercel-blob-token
```

### Mobile 应用

```bash
# Expo 构建
cd apps/mobile
pnpm build
expo build:ios
expo build:android

# 发布到应用商店
expo submit
```

## 📚 详细文档

每个模块都有详细的 README 文档：

- 📖 [Admin 管理后台](./apps/admin/README.md) - API 详细说明
- 📱 [Mobile 移动端](./apps/mobile/README.md) - 开发指南  
- 🗄️ [Database 数据库](./packages/database/README.md) - Schema 设计
- 🔗 [Shared 共享包](./packages/shared/README.md) - 类型定义

## 🎉 下一步开发计划

### 📱 移动端开发 (优先级: 高)
1. **用户认证模块** - 微信/邮箱/手机登录
2. **省份选择和设置** - 地区化内容
3. **手册阅读功能** - 章节浏览、进度追踪
4. **练习模式** - 章节练习、错题复习
5. **模拟考试** - 随机题目、计时功能
6. **用户中心** - 个人信息、会员管理

### 🔧 后端增强 (优先级: 中)
1. **题目管理 API** - 完整的题库 CRUD
2. **用户进度 API** - 学习数据统计
3. **实时通知** - WebSocket 消息推送
4. **数据分析** - 用户行为统计

### 🎨 功能完善 (优先级: 低)
1. **Admin UI 界面** - 可视化管理界面
2. **高级权限控制** - 角色管理
3. **内容审核流程** - 发布审批
4. **多租户支持** - 不同省份独立管理

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**🎯 现在管理后台已经完成，是时候开发移动端应用了！🚀** 