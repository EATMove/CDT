# 内容管理系统 API 指南

## 📋 API 概览

本项目包含完整的内容管理系统API，支持图片上传、内容保存、预览和移动端渲染。

### 🔗 API端点列表

| 功能 | 方法 | 端点 | 描述 |
|------|------|------|------|
| 图片上传 | POST | `/api/images/upload` | 上传图片到Vercel Blob |
| 内容保存 | POST | `/api/content/save` | 保存章节内容 |
| 内容列表 | GET | `/api/content/save` | 获取所有内容 |
| 获取内容 | GET | `/api/content/[id]` | 获取单个内容 |
| 更新内容 | PUT | `/api/content/[id]` | 更新内容 |
| 删除内容 | DELETE | `/api/content/[id]` | 删除内容 |
| 内容预览 | POST | `/api/content/preview` | 生成预览HTML |
| 移动端内容 | GET | `/api/mobile/content/[id]` | 移动端优化内容 |

---

## 🖼️ 图片上传 API

### POST `/api/images/upload`

上传图片到Vercel Blob存储。

#### 请求参数
- `file`: 图片文件 (必需)
- `alt`: 图片alt文本 (可选)
- `caption`: 图片说明 (可选)

#### 文件限制
- 支持格式：JPG, PNG, WebP, GIF
- 最大大小：5MB
- 自动重命名避免冲突

#### 响应示例
```json
{
  "id": "abc123",
  "filename": "handbook/xyz789.jpg",
  "url": "https://vercel-blob-url.com/handbook/xyz789.jpg",
  "width": 800,
  "height": 600,
  "size": 1234567,
  "mimeType": "image/jpeg"
}
```

#### 前端调用示例
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('alt', '图片描述');

const response = await fetch('/api/images/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

---

## 📝 内容管理 API

### POST `/api/content/save`

保存新的章节内容。

#### 请求体
```json
{
  "chapterId": "ch-001",
  "sectionId": "sec-001",
  "title": "交通信号灯规则",
  "titleEn": "Traffic Light Rules",
  "content": "<div>HTML内容</div>",
  "contentEn": "<div>English content</div>",
  "isPublished": true,
  "paymentType": "FREE"
}
```

#### 响应示例
```json
{
  "success": true,
  "id": "content_abc123",
  "message": "内容保存成功"
}
```

### GET `/api/content/save`

获取所有内容列表。

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": "content_abc123",
      "title": "交通信号灯规则",
      "chapterId": "ch-001",
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### GET `/api/content/[id]`

获取单个内容详情。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": "content_abc123",
    "title": "交通信号灯规则",
    "content": "<div>完整HTML内容</div>",
    "chapterId": "ch-001",
    "paymentType": "FREE",
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 👁️ 内容预览 API

### POST `/api/content/preview`

生成内容预览HTML，支持多设备和主题。

#### 请求体
```json
{
  "content": "<div>HTML内容</div>",
  "device": "mobile",
  "theme": "light"
}
```

#### 参数说明
- `content`: 要预览的HTML内容
- `device`: 设备类型 (`mobile` | `tablet` | `desktop`)
- `theme`: 主题 (`light` | `dark`)

#### 响应示例
```json
{
  "success": true,
  "html": "<!DOCTYPE html><html>...</html>",
  "device": "mobile",
  "theme": "light"
}
```

---

## 📱 移动端内容 API

### GET `/api/mobile/content/[id]`

获取为移动端优化的内容，包含完整的HTML页面。

#### 查询参数
- `device`: 设备类型 (`mobile` | `tablet` | `desktop`)
- `theme`: 主题 (`light` | `dark`)
- `lang`: 语言 (`zh` | `en`)
- `userType`: 用户类型 (`FREE` | `MEMBER`)

#### 请求示例
```
GET /api/mobile/content/demo-001?device=mobile&theme=light&lang=zh&userType=FREE
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": "demo-001",
    "title": "交通信号灯规则",
    "content": "<div>原始HTML</div>",
    "html": "<!DOCTYPE html><html>...完整移动端页面...</html>",
    "chapterId": "ch-001",
    "paymentType": "FREE"
  }
}
```

#### 移动端HTML特性
- **响应式设计**：自动适配不同屏幕尺寸
- **防缩放**：禁用双击和手势缩放
- **WebView优化**：包含与React Native通信的脚本
- **无障碍支持**：优化字体大小和对比度
- **图片优化**：自动响应式图片处理

---

## 🔧 技术实现

### 依赖项
- `@vercel/blob`: 图片存储
- `nanoid`: 唯一ID生成
- `next.js`: API路由框架

### 数据存储
- **当前**：内存存储（Map）用于演示
- **计划**：连接到Drizzle ORM + PostgreSQL

### 安全措施
- 文件类型验证
- 文件大小限制
- HTML内容安全过滤
- 基本XSS防护

---

## 🧪 测试API

### 使用curl测试图片上传
```bash
curl -X POST http://localhost:3000/api/images/upload \
  -F "file=@example.jpg" \
  -F "alt=测试图片"
```

### 使用curl测试内容保存
```bash
curl -X POST http://localhost:3000/api/content/save \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "ch-001",
    "title": "测试标题",
    "content": "<p>测试内容</p>",
    "isPublished": true,
    "paymentType": "FREE"
  }'
```

### 使用curl测试移动端内容
```bash
curl "http://localhost:3000/api/mobile/content/demo-001?device=mobile&theme=light"
```

---

## 🚀 下一步计划

1. **数据库集成**：连接Drizzle ORM和PostgreSQL
2. **用户认证**：集成NextAuth.js
3. **权限控制**：基于用户角色的内容访问
4. **缓存优化**：Redis缓存常用内容
5. **CDN集成**：优化图片加载速度
6. **批量操作**：支持批量上传和编辑
7. **版本控制**：内容版本管理和回滚
8. **搜索功能**：全文搜索和标签系统

---

## 📞 问题反馈

如有API相关问题，请检查：
1. 网络连接状态
2. 请求参数格式
3. 文件大小和类型限制
4. 服务器日志输出

所有API都包含详细的错误信息，便于调试和排查问题。 