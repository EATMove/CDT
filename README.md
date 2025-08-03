# 加拿大驾考 App - Monorepo 项目

🚗 一个专为中国用户设计的加拿大驾驶执照考试应用，采用 Monorepo 架构实现前后端类型共享。

## ✨ 项目亮点

- 🚀 **最新技术栈**: Next.js 15 + React 19 + TypeScript
- 🎨 **现代UI设计**: shadcn/ui + Tailwind CSS
- 📱 **跨平台支持**: React Native + Expo
- 🔧 **类型安全**: 完整的 TypeScript 类型共享
- ⚡ **高性能构建**: pnpm + Turborepo
- 🗄️ **现代数据库**: Drizzle ORM + Neon PostgreSQL

## 📋 目录

- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [包管理](#包管理)
- [数据库操作](#数据库操作)
- [部署说明](#部署说明)
- [常见问题](#常见问题)

## 🏗️ 项目结构

```
CDT/
├── apps/                          # 应用程序
│   ├── mobile/                    # React Native Expo 应用
│   │   ├── app/                   # Expo Router 页面
│   │   ├── components/            # 移动端组件
│   │   ├── hooks/                 # 自定义 hooks
│   │   ├── stores/                # Zustand 状态管理
│   │   └── utils/                 # 移动端工具函数
│   └── admin/                     # Next.js 管理后台 ✅
│       ├── src/app/               # App Router (登录、主控面板等)
│       ├── src/components/        # shadcn/ui 组件
│       └── src/lib/               # 后端逻辑和工具
├── packages/                      # 共享包
│   ├── shared/                    # 共享类型定义和工具
│   │   ├── src/types/             # TypeScript 类型定义
│   │   ├── src/utils/             # 共享工具函数
│   │   └── src/i18n/              # 国际化配置
│   └── database/                  # 数据库 Schema 和工具
│       ├── src/schema/            # Drizzle ORM Schema
│       ├── src/migrations/        # 数据库迁移文件
│       └── src/seed/              # 种子数据
├── package.json                   # 根 package.json (pnpm workspaces)
├── turbo.json                     # Turborepo 配置
└── README.md                      # 项目文档
```

## 🛠️ 技术栈

### 前端 (React Native)
- **Expo** - 移动端开发框架
- **TypeScript** - 类型安全
- **Zustand** - 轻量级状态管理
- **React Query/TanStack Query** - 数据获取和缓存
- **NativeWind** - Tailwind CSS for React Native

### 后端 (Next.js) ✅
- **Next.js 15** - 全栈框架 (App Router)
- **React 19** - 最新的 React 版本
- **TypeScript** - 类型安全
- **shadcn/ui** - 现代 UI 组件库
- **Tailwind CSS** - 样式框架
- **Drizzle ORM** - 类型安全的 ORM
- **Neon Database** - PostgreSQL 兼容的云数据库
- **NextAuth.js** - 认证解决方案

### 工具链
- **pnpm** - 包管理器和依赖管理
- **Turborepo** - 构建系统优化
- **TypeScript Project References** - 类型共享

## 🚀 快速开始

### 环境要求

- Node.js 20+ 和 pnpm 9.0+ (推荐使用最新版本)
- Expo CLI
- iOS 模拟器 / Android 模拟器

### 安装依赖

```bash
# 克隆项目
git clone <https://github.com/EATMove/CDT>
cd CDT

# 安装所有依赖
pnpm install

# 构建共享包
pnpm run build
```

### 启动开发服务器

```bash
# 启动移动端应用
pnpm mobile
# 或
pnpm run mobile

# 启动管理后台 ✅
pnpm admin
# 默认运行在 http://localhost:3000
```

## 📱 开发指南

### 移动端开发

```bash
# 进入移动端目录
cd apps/mobile

# 启动开发服务器
pnpm run dev

# 在 iOS 模拟器中运行
pnpm run ios

# 在 Android 模拟器中运行
pnpm run android

# Web 开发
pnpm run web

# 类型检查
pnpm run type-check
```

### 管理后台开发

```bash
# 进入管理后台目录
cd apps/admin

# 启动开发服务器
pnpm run dev

# 生产构建
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check
```

#### 管理后台功能

- 📊 **主控面板**: 用户统计、题库数量、通过率等关键指标
- 👥 **用户管理**: 查看和管理用户账户、会员状态
- 📚 **题库管理**: 添加、编辑、删除驾考题目
- 📖 **手册管理**: 管理驾驶手册内容和章节
- 📈 **数据分析**: 用户行为分析和学习效果统计

#### shadcn/ui 组件使用

```typescript
// 使用 shadcn/ui 组件
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>统计概览</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>添加题目</Button>
      </CardContent>
    </Card>
  );
}
```

### 使用共享类型

在移动端应用中使用共享类型：

```typescript
// apps/mobile/stores/userStore.ts
import { User, UserType, Province } from 'shared';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
}

// 类型安全的状态管理
const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## 📦 包管理

### pnpm Workspace 命令

```bash
# 在根目录安装依赖到所有包
pnpm install

# 为特定包安装依赖
pnpm install --filter mobile <package-name>
pnpm install --filter shared <package-name>

# 运行特定包的脚本
pnpm run --filter mobile dev
pnpm run --filter shared build

# 查看所有包
pnpm workspaces list
```

### 添加新依赖

```bash
# 添加到移动端应用
cd apps/mobile
pnpm add <package-name>

# 添加到共享包
cd packages/shared
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>
```

### 包间依赖

所有内部包依赖都使用 `workspace:*` 协议：

```json
{
  "dependencies": {
    "shared": "workspace:*",
    "database": "workspace:*"
  }
}
```

## 🗄️ 数据库操作

### 设置数据库

1. **创建 Neon 数据库**
   - 访问 [Neon Console](https://console.neon.tech/)
   - 创建新项目
   - 获取连接字符串

2. **配置环境变量**
   ```bash
   # 在 packages/database 目录创建 .env 文件
   echo "DATABASE_URL=your_neon_connection_string" > packages/database/.env
   ```

### 数据库命令

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 启动数据库管理界面
pnpm db:studio

# 在 database 包目录中的命令
cd packages/database

# 生成 schema
pnpm run generate

# 执行迁移
pnpm run migrate

# 播种数据
pnpm run seed
```

### 添加新表

1. 在 `packages/database/src/schema/` 中创建新的 schema 文件
2. 在 `packages/shared/src/types/` 中添加对应的 TypeScript 类型
3. 生成并执行迁移

```bash
# 生成迁移
bun db:generate

# 查看迁移文件
ls packages/database/src/migrations/

# 执行迁移
bun db:migrate
```

## 🎯 开发工作流

### 1. 功能开发流程

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 在 shared 包中定义类型
cd packages/shared/src/types
# 编辑相关类型文件

# 3. 在 database 包中添加 schema
cd packages/database/src/schema
# 编辑 schema 文件

# 4. 生成数据库迁移
pnpm db:generate

# 5. 在移动端实现功能
cd apps/mobile
# 开发新功能

# 6. 测试所有包
pnpm run build
pnpm run type-check

# 7. 提交代码
git add .
git commit -m "feat: add new feature"
```

### 2. 类型同步

当修改共享类型时：

```bash
# 重新构建 shared 包
cd packages/shared
pnpm run build

# 重新构建依赖 shared 的包
cd ../../
pnpm run build
```

## 🚀 部署说明

### 移动端部署 (Expo)

```bash
cd apps/mobile

# 构建生产版本
pnpm run build:production

# 发布到 Expo
npx expo publish

# 构建独立应用
npx expo build:ios
npx expo build:android
```

### 管理后台部署 (Vercel)

```bash
cd apps/admin

# 构建
pnpm run build

# 部署到 Vercel
npx vercel --prod
```

## 🔧 常用脚本

### 根目录脚本

```bash
# 构建所有包
pnpm run build

# 类型检查所有包
pnpm run type-check

# 代码检查
pnpm run lint

# 启动移动端
pnpm mobile

# 启动管理后台
pnpm admin

# 数据库操作
pnpm db:generate    # 生成迁移
pnpm db:migrate     # 执行迁移
pnpm db:studio      # 数据库管理界面
```

### 包特定脚本

```bash
# 移动端
cd apps/mobile
pnpm run dev        # 开发服务器
pnpm run ios        # iOS 模拟器
pnpm run android    # Android 模拟器
pnpm run type-check # 类型检查

# 共享包
cd packages/shared
pnpm run build      # 构建
pnpm run dev        # 监听模式构建

# 数据库包
cd packages/database
pnpm run generate   # 生成迁移
pnpm run migrate    # 执行迁移
pnpm run studio     # 数据库管理
```

## ❓ 常见问题

### Q: 为什么选择 pnpm 而不是 npm/yarn/bun？

A: pnpm 提供了更好的依赖管理和版本隔离，特别适合处理不同应用使用不同版本依赖的场景（如 Tailwind CSS v3 vs v4）。

### Q: 如何处理不同应用使用不同版本的依赖？

A: 本项目使用 pnpm 的版本隔离功能。例如：
- **Mobile 应用**：使用 Tailwind CSS v3.4.17（NativeWind 要求）
- **Admin 应用**：使用 Tailwind CSS v4.1.11（最新版本）

每个应用都有独立的 `node_modules`，确保版本兼容性。

### Q: 如何添加新的共享类型？

A: 在 `packages/shared/src/types/` 中创建或修改类型文件，然后运行 `pnpm run build` 重新构建。

### Q: 数据库迁移失败怎么办？

A: 检查数据库连接字符串，确保 Neon 数据库正常运行，然后重新执行迁移。

### Q: 移动端无法导入共享类型？

A: 确保 shared 包已构建：
```bash
cd packages/shared
pnpm run build
```

### Q: 如何重置开发环境？

A: 
```bash
# 清理所有 node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# 删除 pnpm-lock.yaml
rm pnpm-lock.yaml

# 重新安装
pnpm install

# 重新构建
pnpm run build
```

### Q: TypeScript 类型错误？

A: 
```bash
# 重新构建所有包
pnpm run build

# 检查类型
pnpm run type-check

# 重启 TypeScript 服务器 (在 VS Code 中)
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## 📚 相关资源

- [Expo 文档](https://docs.expo.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [pnpm 文档](https://pnpm.io/)
- [Turborepo 文档](https://turbo.build/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**开发愉快！🎉** 