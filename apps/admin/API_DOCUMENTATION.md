# Chapters API 文档

## 概述

Chapters API 提供了完整的章节管理功能，包括创建、读取、更新、删除章节，以及管理章节下的段落内容。

## 基础URL

所有API端点都以 `/api/chapters` 为基础路径。

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

## 注意事项

1. 所有时间字段都使用ISO 8601格式
2. 删除章节前需要确保没有关联的段落
3. 批量操作建议限制在100个以内
4. 搜索功能支持中英文混合搜索
5. 段落内容支持HTML格式 