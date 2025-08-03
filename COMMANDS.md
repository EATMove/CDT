# 🚀 命令备忘单

快速查询常用命令，避免每次都翻阅完整文档。

## 📦 包管理

```bash
# 安装所有依赖
pnpm install

# 为特定包添加依赖
cd apps/mobile && pnpm add <package-name>
cd packages/shared && pnpm add <package-name>

# 查看所有工作区
pnpm workspaces list
```

## 🏗️ 构建和开发

```bash
# 构建所有包
pnpm run build

# 类型检查
pnpm run type-check

# 启动移动端
pnpm mobile
pnpm run mobile

# 启动管理后台
pnpm admin
```

## 📱 移动端开发

```bash
cd apps/mobile

# 开发服务器
pnpm run dev

# 平台特定启动
pnpm run ios        # iOS 模拟器
pnpm run android    # Android 模拟器
pnpm run web        # Web 浏览器

# 构建
pnpm run build
```

## 🗄️ 数据库操作

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 数据库管理界面
pnpm db:studio

# 在 database 包中
cd packages/database
pnpm run generate   # 生成 schema
pnpm run migrate    # 执行迁移
pnpm run seed       # 种子数据
```

## 🔧 常见操作

```bash
# 重置环境 (当依赖出问题时)
find . -name "node_modules" -type d -exec rm -rf {} +
rm pnpm-lock.yaml
pnpm install
pnpm run build

# 重新构建 shared 包 (当类型更新时)
cd packages/shared
pnpm run build

# 全项目类型检查
pnpm run type-check
```

## 📂 目录导航

```bash
# 移动端应用
cd apps/mobile

# 共享类型
cd packages/shared

# 数据库
cd packages/database

# 回到根目录
cd ../..
```

## 🎯 开发工作流

```bash
# 1. 新功能开发
git checkout -b feature/new-feature

# 2. 修改类型 (在 packages/shared/src/types/)
# 3. 修改数据库 (在 packages/database/src/schema/)
# 4. 生成迁移
pnpm db:generate

# 5. 构建和测试
pnpm run build
pnpm run type-check

# 6. 提交
git add .
git commit -m "feat: add new feature"
```

## 🆘 故障排除

```bash
# TypeScript 错误
pnpm run build          # 重新构建
pnpm run type-check      # 检查类型

# 依赖问题
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 缓存问题 (Expo)
cd apps/mobile
npx expo r -c           # 清除缓存重启
```

---

## 🎨 Tailwind CSS 版本管理

```bash
# 检查当前版本
cat node_modules/tailwindcss/package.json | grep '"version"'
cat apps/mobile/node_modules/tailwindcss/package.json | grep '"version"'

# Mobile 使用 v3.4.17 (NativeWind 要求)
# Admin 使用 v4.1.11 (最新版本)
```

💡 **提示**: 将此文件加入书签，开发时随时查询！ 