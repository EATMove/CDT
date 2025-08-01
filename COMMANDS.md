# 🚀 命令备忘单

快速查询常用命令，避免每次都翻阅完整文档。

## 📦 包管理

```bash
# 安装所有依赖
bun install

# 为特定包添加依赖
cd apps/mobile && bun add <package-name>
cd packages/shared && bun add <package-name>

# 查看所有工作区
bun workspaces list
```

## 🏗️ 构建和开发

```bash
# 构建所有包
bun run build

# 类型检查
bun run type-check

# 启动移动端
bun mobile
bun run mobile

# 启动管理后台 (待创建)
bun admin
```

## 📱 移动端开发

```bash
cd apps/mobile

# 开发服务器
bun run dev

# 平台特定启动
bun run ios        # iOS 模拟器
bun run android    # Android 模拟器
bun run web        # Web 浏览器

# 构建
bun run build
```

## 🗄️ 数据库操作

```bash
# 生成迁移文件
bun db:generate

# 执行迁移
bun db:migrate

# 数据库管理界面
bun db:studio

# 在 database 包中
cd packages/database
bun run generate   # 生成 schema
bun run migrate    # 执行迁移
bun run seed       # 种子数据
```

## 🔧 常见操作

```bash
# 重置环境 (当依赖出问题时)
find . -name "node_modules" -type d -exec rm -rf {} +
rm bun.lock
bun install
bun run build

# 重新构建 shared 包 (当类型更新时)
cd packages/shared
bun run build

# 全项目类型检查
bun run type-check
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
bun db:generate

# 5. 构建和测试
bun run build
bun run type-check

# 6. 提交
git add .
git commit -m "feat: add new feature"
```

## 🆘 故障排除

```bash
# TypeScript 错误
bun run build          # 重新构建
bun run type-check      # 检查类型

# 依赖问题
rm -rf node_modules bun.lock
bun install

# 缓存问题 (Expo)
cd apps/mobile
npx expo r -c           # 清除缓存重启
```

---

💡 **提示**: 将此文件加入书签，开发时随时查询！ 