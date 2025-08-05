# Handbook Management API 文档

## 概述

Handbook Management API 提供了完整的手册管理功能，包括：
- 章节管理：创建、读取、更新、删除章节
- 段落管理：管理章节下的段落内容  
- 图片管理：智能的上下文相关图片管理

## 基础URL

- 章节相关：`/api/chapters`
- 图片相关：`/api/images`

## 认证

目前API暂未实现认证，后续会添加JWT token验证。

## 响应格式

所有API响应都遵循统一格式：

```json
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}
```

错误响应：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "错误描述"
  }
}
```

## API 端点

### 1. 章节列表

**GET** `/api/chapters`

获取章节列表，支持分页和过滤。

#### 查询参数

- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认20
- `orderBy` (string): 排序字段，可选值：`order`, `createdAt`, `updatedAt`
- `order` (string): 排序方向，可选值：`asc`, `desc`
- `status` (string): 发布状态过滤，可选值：`DRAFT`, `REVIEW`, `PUBLISHED`, `ARCHIVED`
- `province` (string): 省份过滤，可选值：`AB`, `BC`, `ON`

#### 响应示例

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "chapter-123",
        "title": "交通规则基础",
        "titleEn": "Basic Traffic Rules",
        "description": "学习基本的交通规则",
        "order": 1,
        "province": "ON",
        "publishStatus": "PUBLISHED",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. 创建章节

**POST** `/api/chapters`

创建新章节。

#### 请求体

```json
{
  "title": "章节标题",
  "titleEn": "Chapter Title",
  "description": "章节描述",
  "descriptionEn": "Chapter Description",
  "order": 1,
  "province": "ON",
  "contentFormat": "HTML",
  "estimatedReadTime": 25,
  "paymentType": "FREE",
  "freePreviewSections": 3
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "chapter-123",
    "title": "章节标题",
    "publishStatus": "DRAFT"
  },
  "message": "章节创建成功"
}
```

### 3. 获取单个章节

**GET** `/api/chapters/{id}`

获取单个章节的详细信息，包括其下的所有段落。

#### 路径参数

- `id` (string): 章节ID

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "chapter-123",
    "title": "交通规则基础",
    "sections": [
      {
        "id": "section-456",
        "title": "第一节",
        "content": "<p>内容...</p>",
        "order": 1,
        "isFree": true
      }
    ],
    "totalSections": 1,
    "freeSections": 1
  }
}
```

### 4. 更新章节

**PUT** `/api/chapters/{id}`

更新章节信息。

#### 路径参数

- `id` (string): 章节ID

#### 请求体

支持部分更新，所有字段都是可选的：

```json
{
  "title": "新标题",
  "publishStatus": "PUBLISHED"
}
```

### 5. 删除章节

**DELETE** `/api/chapters/{id}`

删除章节。注意：如果章节下有段落，必须先删除所有段落。

#### 路径参数

- `id` (string): 章节ID

### 6. 章节段落管理

#### 获取章节段落

**GET** `/api/chapters/{id}/sections`

获取指定章节下的所有段落。

#### 创建段落

**POST** `/api/chapters/{id}/sections`

在指定章节下创建新段落。

请求体：

```json
{
  "title": "段落标题",
  "titleEn": "Section Title",
  "order": 1,
  "content": "<p>段落内容</p>",
  "contentEn": "<p>Section content</p>",
  "isFree": true,
  "requiredUserType": ["FREE"]
}
```

#### 获取单个段落

**GET** `/api/chapters/{id}/sections/{sectionId}`

#### 更新段落

**PUT** `/api/chapters/{id}/sections/{sectionId}`

#### 删除段落

**DELETE** `/api/chapters/{id}/sections/{sectionId}`

### 7. 批量操作

#### 批量更新状态

**PUT** `/api/chapters/batch`

批量更新章节的发布状态。

请求体：

```json
{
  "chapterIds": ["chapter-1", "chapter-2"],
  "publishStatus": "PUBLISHED",
  "versionNote": "批量发布"
}
```

#### 批量删除

**DELETE** `/api/chapters/batch`

批量删除章节。

请求体：

```json
{
  "chapterIds": ["chapter-1", "chapter-2"]
}
```

### 8. 搜索功能

**GET** `/api/chapters/search`

高级搜索功能，支持多条件搜索。

#### 查询参数

- `query` (string): 搜索关键词
- `paymentType` (string): 付费类型过滤
- `publishStatus` (string): 发布状态过滤
- `province` (string): 省份过滤
- `authorId` (string): 作者过滤
- `page` (number): 页码
- `limit` (number): 每页数量
- `orderBy` (string): 排序字段
- `order` (string): 排序方向

#### 响应示例

```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {...},
    "stats": {
      "total": 10,
      "byProvince": {
        "ON": 5,
        "BC": 3,
        "AB": 2
      },
      "byStatus": {
        "PUBLISHED": 7,
        "DRAFT": 3
      }
    }
  }
}
```

## 数据模型

### 章节 (HandbookChapter)

```typescript
interface HandbookChapter {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  order: number;
  province: 'AB' | 'BC' | 'ON';
  contentFormat: 'HTML' | 'MARKDOWN' | 'PLAIN_TEXT';
  estimatedReadTime: number;
  coverImageUrl?: string;
  coverImageAlt?: string;
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
  freePreviewSections: number;
  prerequisiteChapters: string[];
  publishStatus: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  authorId?: string;
  lastEditedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 段落 (HandbookSection)

```typescript
interface HandbookSection {
  id: string;
  chapterId: string;
  title: string;
  titleEn?: string;
  order: number;
  content: string;
  contentEn?: string;
  isFree: boolean;
  requiredUserType: string[];
  wordCount: number;
  estimatedReadTime: number;
  createdAt: string;
  updatedAt: string;
}
```

## 错误代码

- `VALIDATION_ERROR`: 数据验证错误
- `NOT_FOUND`: 资源未找到
- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 禁止访问
- `INTERNAL_ERROR`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取章节列表
const response = await fetch('/api/chapters?page=1&limit=10');
const result = await response.json();

if (result.success) {
  console.log(result.data.data);
}

// 创建章节
const createResponse = await fetch('/api/chapters', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新章节',
    description: '章节描述',
    order: 1,
    province: 'ON',
    estimatedReadTime: 25,
  }),
});

const createResult = await createResponse.json();
```

---

# 图片管理 API

## 概述

图片管理API提供了智能的上下文相关图片管理功能，支持按章节和段落进行图片组织和筛选。

## 端点列表

### 1. 获取图片列表

**GET** `/api/images`

获取图片列表，支持智能筛选和分页。

#### 查询参数

- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认20
- `search` (string): 搜索关键词（按文件名搜索）
- `usage` (string): 图片用途筛选（content, cover, diagram, illustration）
- `chapterId` (string): 按章节筛选
- `sectionId` (string): 按段落筛选
- `includeSubSections` (boolean): 是否包含子段落图片，默认false
- `contextOnly` (boolean): 只返回有上下文关联的图片，默认false
- `orderBy` (string): 排序字段（createdAt, filename, fileSize, order），默认createdAt
- `order` (string): 排序方向（asc, desc），默认desc

#### 响应示例

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "chapterId": "chapter-uuid",
        "sectionId": null,
        "filename": "image1.jpg",
        "originalName": "traffic_sign.jpg",
        "fileUrl": "/uploads/images/image1.jpg",
        "fileSize": 1024000,
        "mimeType": "image/jpeg",
        "width": 800,
        "height": 600,
        "altText": "交通标志",
        "caption": "常见交通标志图解",
        "captionEn": "Common traffic signs",
        "usage": "diagram",
        "order": 1,
        "uploadedBy": "user-uuid",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. 获取上下文相关图片

**GET** `/api/images/context`

获取编辑上下文中的相关图片，提供智能推荐。

#### 查询参数

- `chapterId` (string, 必需): 章节ID（与sectionId二选一）
- `sectionId` (string, 必需): 段落ID（与chapterId二选一）
- `usage` (string): 图片用途筛选
- `includeRecent` (boolean): 是否包含最近上传的图片，默认false

#### 响应示例

```json
{
  "success": true,
  "data": {
    "contextImages": [
      {
        "id": "uuid",
        "filename": "chapter1_diagram.jpg",
        "originalName": "交通规则图解.jpg",
        "fileUrl": "/uploads/images/chapter1_diagram.jpg",
        "usage": "diagram",
        "order": 1
      }
    ],
    "recentImages": [
      {
        "id": "uuid2",
        "filename": "recent_upload.jpg",
        "originalName": "最新上传.jpg",
        "fileUrl": "/uploads/images/recent_upload.jpg",
        "usage": "content",
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "suggestions": [
      {
        "id": "uuid3",
        "filename": "similar_diagram.jpg",
        "originalName": "相似图表.jpg",
        "fileUrl": "/uploads/images/similar_diagram.jpg",
        "usage": "diagram"
      }
    ]
  }
}
```

### 3. 关联图片到上下文

**POST** `/api/images/context`

将已存在的图片关联到特定的章节或段落。

#### 请求体

```json
{
  "imageIds": ["uuid1", "uuid2"],
  "chapterId": "chapter-uuid",  // 与sectionId二选一
  "sectionId": "section-uuid",  // 与chapterId二选一
  "usage": "diagram",           // 可选
  "order": 1                    // 可选，起始排序号
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "updatedCount": 2,
    "imageIds": ["uuid1", "uuid2"],
    "context": {
      "chapterId": "chapter-uuid",
      "sectionId": null
    }
  },
  "message": "成功关联 2 张图片"
}
```

## 图片管理最佳实践

### 1. 上下文关联策略

- **章节级图片**：适用于章节概述、封面图等
- **段落级图片**：适用于具体内容的配图、图表等
- **孤儿图片**：暂时未关联的图片，定期清理

### 2. 查询优化建议

- 使用 `contextOnly=true` 减少无关图片的返回
- 在编辑特定段落时，优先使用 `sectionId` 筛选
- 利用 `includeSubSections=false` 精确控制图片范围

### 3. 性能优化

- 数据库已添加复合索引优化常用查询
- 支持分页避免大量数据传输
- 上下文查询API提供预筛选的相关图片

## 注意事项

1. 所有时间字段都使用ISO 8601格式
2. 删除章节前需要确保没有关联的段落
3. 批量操作建议限制在100个以内
4. 搜索功能支持中英文混合搜索
5. 段落内容支持HTML格式
6. 图片文件存储在 `/uploads/images/` 目录下
7. 支持的图片格式：JPG, PNG, WebP, SVG
8. 单个图片文件大小限制：10MB
9. 图片必须关联到章节或段落中的一个（不能同时关联两者） 