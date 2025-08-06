# Admin认证系统设置指南

## 概述

这是一个简单但安全的admin认证系统，使用环境变量来管理管理员凭据。系统特点：

- 🔐 基于环境变量的用户名/密码认证
- 🍪 安全的HTTP-only cookie session管理
- ⏰ 24小时session过期时间
- 🛡️ 自动重定向未认证用户到登录页面
- 🚪 简单的登出功能

## 快速设置

### 1. 创建环境变量文件

复制 `env.example` 到 `.env.local`：

```bash
cp env.example .env.local
```

### 2. 配置管理员凭据

编辑 `.env.local` 文件，设置你的管理员凭据：

```env
# 管理员用户名和密码
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password

# Session密钥（用于加密session token）
SESSION_SECRET=your-random-session-secret

# 其他配置...
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### 3. 启动应用

```bash
npm run dev
# 或
pnpm dev
```

### 4. 访问管理后台

- 访问 `http://localhost:3000`
- 如果未登录，会自动重定向到登录页面
- 使用配置的用户名和密码登录

## 安全建议

### 1. 强密码策略

- 使用至少12位字符的强密码
- 包含大小写字母、数字和特殊字符
- 避免使用常见词汇或个人信息

### 2. 环境变量安全

- 永远不要将 `.env.local` 文件提交到版本控制
- 在生产环境中使用环境变量管理工具
- 定期轮换密码和密钥

### 3. 生产环境配置

```env
# 生产环境示例
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourVerySecurePassword123!
SESSION_SECRET=your-very-long-random-secret-key-here
NODE_ENV=production
```

## 功能说明

### 认证流程

1. 用户访问受保护的页面
2. 系统检查session cookie
3. 如果未登录，重定向到 `/login`
4. 用户输入凭据
5. 验证成功后创建session
6. 重定向到原始页面

### Session管理

- Session存储在HTTP-only cookie中
- 24小时自动过期
- 支持手动登出
- 安全的HMAC签名验证

### 路由保护

- 所有页面默认受保护（除了登录页面）
- 使用Next.js路由组 `(protected)` 组织受保护的路由
- 自动处理认证状态检查

## 文件结构

```
src/
├── app/
│   ├── (protected)/          # 受保护的路由组
│   │   ├── layout.tsx        # 受保护布局
│   │   ├── page.tsx          # 首页
│   │   ├── chapters/         # 章节管理
│   │   ├── content/          # 内容编辑
│   │   └── images/           # 图片管理
│   ├── login/                # 登录页面（不受保护）
│   │   └── page.tsx
│   └── layout.tsx            # 根布局
├── components/
│   ├── AdminAuthProvider.tsx # 认证上下文
│   ├── ProtectedRoute.tsx    # 路由保护组件
│   └── Navigation.tsx        # 导航栏
├── lib/
│   └── admin-auth.ts         # 认证逻辑
└── api/admin/
    ├── login/                # 登录API
    └── logout/               # 登出API
```

## 故障排除

### 登录失败

1. 检查环境变量是否正确设置
2. 确认用户名和密码匹配
3. 检查浏览器控制台是否有错误

### Session过期

1. 重新登录
2. 检查系统时间是否正确
3. 清除浏览器cookie后重试

### 重定向循环

1. 检查路由配置
2. 确认登录页面不在受保护路由组中
3. 检查认证状态API是否正常工作

## 扩展功能

### 多用户支持

如需支持多个管理员，可以：

1. 修改 `admin-auth.ts` 中的认证逻辑
2. 添加用户数据库表
3. 实现用户管理界面

### 权限管理

可以基于用户角色实现更细粒度的权限控制：

1. 在 `AdminUser` 接口中添加角色字段
2. 实现权限检查函数
3. 在组件中使用权限控制

### 审计日志

建议添加登录日志记录：

1. 记录登录/登出时间
2. 记录IP地址
3. 记录操作日志

## 联系支持

如有问题，请联系开发团队。 