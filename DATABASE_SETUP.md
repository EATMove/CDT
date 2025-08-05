# 数据库初始化指南

🗄️ 加拿大驾考App数据库设置和初始化说明

## 📋 前置要求

1. **Vercel数据库服务** - 已通过Vercel开启PostgreSQL服务
2. **环境变量配置** - 在admin项目中配置数据库连接信息

## 🔧 环境变量配置

在 `apps/admin/.env.local` 文件中配置以下环境变量：

```bash
# 数据库连接 (从Vercel获取)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT密钥 (用于用户认证)
JWT_SECRET="your-super-secret-jwt-key-here"

# Vercel Blob存储 (用于图片上传)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 获取Vercel数据库连接信息

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Storage" 标签
4. 选择 "Postgres" 数据库
5. 点击 "Connect" 获取连接字符串

## 🚀 数据库初始化

### 1. 检查数据库连接

```bash
# 检查数据库连接是否正常
pnpm db:check
```

### 2. 生成数据库迁移文件

```bash
# 根据schema生成迁移文件
pnpm db:generate
```

### 3. 初始化数据库

```bash
# 完整初始化 (迁移 + 种子数据)
pnpm db:init

# 仅运行迁移 (不插入种子数据)
pnpm db:init:migrate-only

# 仅插入种子数据
pnpm db:seed
```

## 📊 初始化内容

### 数据库表结构
- ✅ **用户系统**: `users`, `verification_codes`
- ✅ **手册系统**: `handbook_chapters`, `handbook_sections`, `handbook_images`
- ✅ **测验系统**: `questions`, `question_options`, `quiz_sessions`, `user_answers`
- ✅ **进度系统**: `chapter_progress`, `reading_records`, `wrong_questions`, `bookmarks`
- ✅ **系统管理**: `app_configs`, `notifications`, `feedback`

### 种子数据
- 👥 **示例用户**: 管理员、普通用户、试用用户
- 📚 **手册内容**: 3个章节，包含详细的学习内容
- 🧠 **测验题目**: 基础题目和选项
- ⚙️ **应用配置**: 系统参数和设置
- 🎫 **邀请码**: 试用邀请码

## 🔍 数据库管理

### 查看数据库

```bash
# 启动Drizzle Studio (数据库管理界面)
pnpm db:studio
```

访问: http://localhost:4983

### 常用操作

```bash
# 检查连接
pnpm db:check

# 生成迁移
pnpm db:generate

# 查看数据库
pnpm db:studio

# 重新初始化 (谨慎使用)
pnpm db:init --force-seed
```

## 🛠️ 故障排除

### 常见错误

#### 1. 连接失败
```
❌ 数据库连接失败: connection refused
```
**解决方案**: 检查 `DATABASE_URL` 是否正确，确保数据库服务正在运行

#### 2. 权限错误
```
❌ 数据库连接失败: permission denied
```
**解决方案**: 检查数据库用户权限，确保有创建表的权限

#### 3. SSL错误
```
❌ 数据库连接失败: SSL connection required
```
**解决方案**: 在连接字符串中添加 `?sslmode=require`

### 重置数据库

如果需要完全重置数据库：

```bash
# 1. 删除所有表 (谨慎操作)
# 在Drizzle Studio中手动删除，或使用数据库管理工具

# 2. 重新初始化
pnpm db:init
```

## 📚 下一步

数据库初始化完成后：

1. **启动Admin应用**: `pnpm admin`
2. **访问管理界面**: http://localhost:3000
3. **开始开发移动端**: `pnpm mobile`

## 🔗 相关文档

- [Admin API文档](./apps/admin/README.md)
- [数据库Schema文档](./packages/database/README.md)
- [共享类型文档](./packages/shared/README.md) 