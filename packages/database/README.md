# Database Package - 数据库层

🗄️ 加拿大驾考App的数据库层，基于 Drizzle ORM + PostgreSQL 构建的类型安全数据访问层。

## ✅ 完成状态

- ✅ **完整Schema设计**: 用户、手册、测验、进度、系统 5大模块
- ✅ **关系型设计**: 外键约束、级联操作、数据完整性
- ✅ **类型安全**: Drizzle ORM + TypeScript 双重保障
- ✅ **版本控制**: 内容版本管理和历史追踪
- ✅ **权限分级**: 多用户类型和内容访问控制
- ✅ **迁移系统**: 数据库版本管理和升级

## 📊 数据库架构

### 🏗️ 总体设计

```mermaid
erDiagram
    USERS ||--o{ READING_RECORDS : reads
    USERS ||--o{ QUIZ_SESSIONS : takes
    USERS ||--o{ BOOKMARKS : creates
    USERS ||--o{ CHAPTER_PROGRESS : tracks
    
    HANDBOOK_CHAPTERS ||--o{ HANDBOOK_SECTIONS : contains
    HANDBOOK_CHAPTERS ||--o{ QUESTIONS : has
    HANDBOOK_CHAPTERS ||--o{ HANDBOOK_IMAGES : includes
    
    HANDBOOK_SECTIONS ||--o{ HANDBOOK_IMAGES : contains
    HANDBOOK_SECTIONS ||--o{ READING_RECORDS : tracked
    
    QUESTIONS ||--o{ QUESTION_OPTIONS : has
    QUESTIONS ||--o{ USER_ANSWERS : answered
    
    QUIZ_SESSIONS ||--o{ USER_ANSWERS : contains
```

## 📋 数据表结构

### 👥 用户系统 (Users Module)

#### `users` - 用户基本信息
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  google_id VARCHAR(100) UNIQUE,
  password_hash TEXT,
  primary_login_method login_method NOT NULL,
  province province NOT NULL,
  user_type user_type DEFAULT 'FREE',
  trial_end_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**字段说明**:
- `primary_login_method`: EMAIL/PHONE/GOOGLE 登录方式
- `province`: AB/BC/ON 加拿大省份
- `user_type`: FREE/TRIAL/MEMBER 用户类型
- 支持多种登录方式（邮箱/手机/Google）

#### `verification_codes` - 验证码管理
```sql
CREATE TABLE verification_codes (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255),
  phone VARCHAR(20),
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL, -- register/reset_password/login/phone_verification/email_verification
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📚 手册系统 (Handbook Module)

#### `handbook_chapters` - 章节信息
```sql
CREATE TABLE handbook_chapters (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT NOT NULL,
  description_en TEXT,
  order INTEGER NOT NULL,
  content_format content_format DEFAULT 'HTML',
  estimated_read_time INTEGER NOT NULL, -- 分钟
  cover_image_url VARCHAR(500),
  payment_type payment_type DEFAULT 'FREE',
  free_preview_sections INTEGER DEFAULT 0,
  prerequisite_chapters TEXT[],
  publish_status publish_status DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  author_id VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**权限控制**:
- `payment_type`: FREE/MEMBER_ONLY/TRIAL_INCLUDED/PREMIUM
- `free_preview_sections`: 免费用户可预览的段落数
- `publish_status`: DRAFT/REVIEW/PUBLISHED/ARCHIVED

#### `handbook_sections` - 段落内容
```sql
CREATE TABLE handbook_sections (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  order INTEGER NOT NULL,
  content TEXT NOT NULL, -- HTML格式内容
  content_en TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  required_user_type TEXT[] DEFAULT ['FREE'],
  word_count INTEGER DEFAULT 0,
  estimated_read_time INTEGER DEFAULT 0, -- 秒数
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `handbook_images` - 图片资源
```sql
CREATE TABLE handbook_images (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(200),
  caption TEXT,
  caption_en TEXT,
  usage VARCHAR(50) DEFAULT 'content', -- content/cover/diagram/illustration
  order INTEGER DEFAULT 0,
  uploaded_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `handbook_content_versions` - 版本控制
```sql
CREATE TABLE handbook_content_versions (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  version VARCHAR(20) NOT NULL,
  version_note TEXT,
  content_snapshot JSON NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- create/update/delete
  change_description TEXT,
  created_by VARCHAR(36) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🧠 测验系统 (Quiz Module)

#### `questions` - 题目库
```sql
CREATE TABLE questions (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id),
  type question_type NOT NULL, -- SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE
  title VARCHAR(300) NOT NULL,
  title_en VARCHAR(300),
  content TEXT NOT NULL,
  content_en TEXT,
  image_url VARCHAR(500),
  explanation TEXT NOT NULL,
  explanation_en TEXT,
  difficulty INTEGER DEFAULT 1, -- 1-5 难度等级
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `question_options` - 题目选项
```sql
CREATE TABLE question_options (
  id VARCHAR(36) PRIMARY KEY,
  question_id VARCHAR(36) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  text_en TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `quiz_sessions` - 测验会话
```sql
CREATE TABLE quiz_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  type quiz_type NOT NULL, -- CHAPTER/SIMULATION/WRONG_QUESTIONS
  chapter_id VARCHAR(36) REFERENCES handbook_chapters(id),
  language language DEFAULT 'HYBRID', -- ZH/EN/HYBRID
  question_ids TEXT[] NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  score DECIMAL(5,2) DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- 秒数
  is_completed BOOLEAN DEFAULT FALSE,
  is_passed BOOLEAN, -- 仅适用于模拟考试
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_answers` - 用户答题记录
```sql
CREATE TABLE user_answers (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL REFERENCES quiz_sessions(id),
  question_id VARCHAR(36) NOT NULL REFERENCES questions(id),
  selected_options TEXT[] NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER DEFAULT 0,
  answered_at TIMESTAMP NOT NULL
);
```

### 📈 进度系统 (Progress Module)

#### `chapter_progress` - 章节学习进度
```sql
CREATE TABLE chapter_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id),
  sections_completed INTEGER DEFAULT 0,
  total_sections INTEGER NOT NULL,
  reading_time INTEGER DEFAULT 0, -- 秒数
  quiz_attempts INTEGER DEFAULT 0,
  best_quiz_score DECIMAL(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `reading_records` - 阅读记录
```sql
CREATE TABLE reading_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  progress INTEGER DEFAULT 0, -- 0-100百分比
  current_position INTEGER DEFAULT 0,
  total_length INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  reading_language VARCHAR(10) DEFAULT 'ZH'
);
```

#### `wrong_questions` - 错题记录
```sql
CREATE TABLE wrong_questions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  question_id VARCHAR(36) NOT NULL REFERENCES questions(id),
  session_id VARCHAR(36) NOT NULL REFERENCES quiz_sessions(id),
  incorrect_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP NOT NULL,
  last_attempt_at TIMESTAMP NOT NULL,
  is_mastered BOOLEAN DEFAULT FALSE,
  mastered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `bookmarks` - 书签系统
```sql
CREATE TABLE bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  position INTEGER NOT NULL,
  note TEXT,
  highlighted_text TEXT,
  color VARCHAR(20) DEFAULT 'yellow',
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### ⚙️ 系统管理 (System Module)

#### `app_configs` - 应用配置
```sql
CREATE TABLE app_configs (
  id VARCHAR(36) PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `notifications` - 通知管理
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `feedback` - 用户反馈
```sql
CREATE TABLE feedback (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  contact_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDING',
  admin_response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 数据库操作

### 连接配置

```typescript
// src/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export function createDatabase(connectionString?: string) {
  const dbUrl = connectionString || process.env.DATABASE_URL;
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema: allTables });
  
  return { db, client, close: () => client.end() };
}
```

### 查询示例

```typescript
// 获取用户的章节进度
async function getUserProgress(userId: string) {
  const progress = await db
    .select({
      chapterId: chapterProgress.chapterId,
      sectionsCompleted: chapterProgress.sectionsCompleted,
      totalSections: chapterProgress.totalSections,
      isCompleted: chapterProgress.isCompleted,
      chapterTitle: handbookChapters.title,
    })
    .from(chapterProgress)
    .innerJoin(handbookChapters, eq(chapterProgress.chapterId, handbookChapters.id))
    .where(eq(chapterProgress.userId, userId));
    
  return progress;
}

// 创建测验会话
async function createQuizSession(data: NewQuizSession) {
  const session = await db
    .insert(quizSessions)
    .values({
      id: generateId(),
      ...data,
      startTime: new Date(),
    })
    .returning();
    
  return session[0];
}

// 更新阅读进度
async function updateReadingProgress(
  userId: string,
  sectionId: string,
  progress: number
) {
  return await db
    .update(readingRecords)
    .set({
      progress,
      lastReadAt: new Date(),
      isCompleted: progress >= 100,
      completedAt: progress >= 100 ? new Date() : null,
    })
    .where(
      and(
        eq(readingRecords.userId, userId),
        eq(readingRecords.sectionId, sectionId)
      )
    );
}
```

## 🚀 数据库管理

### 迁移管理

```bash
# 生成迁移文件
pnpm run generate

# 执行迁移
pnpm run migrate

# 查看迁移状态
pnpm run migrate:status

# 回滚迁移 (谨慎使用)
pnpm run migrate:rollback
```

### 数据库工具

```bash
# 启动 Drizzle Studio
pnpm run studio

# 播种测试数据
pnpm run seed

# 重置数据库 (开发环境)
pnpm run reset

# 备份数据库
pnpm run backup

# 数据库健康检查
pnpm run health-check
```

### 环境配置

```bash
# .env 文件配置
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# 生产环境 (Neon/Supabase/Railway 等)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# 连接池配置
DB_POOL_SIZE=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
```

## 📊 性能优化

### 索引策略

```sql
-- 用户查询优化
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_google_id ON users(google_id);

-- 章节内容查询优化
CREATE INDEX idx_handbook_sections_chapter_id ON handbook_sections(chapter_id);
CREATE INDEX idx_handbook_sections_order ON handbook_sections(chapter_id, order);

-- 测验相关查询优化
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- 进度查询优化
CREATE INDEX idx_chapter_progress_user_id ON chapter_progress(user_id);
CREATE INDEX idx_reading_records_user_chapter ON reading_records(user_id, chapter_id);
```

### 查询优化

```typescript
// 使用预加载关联数据
const chaptersWithSections = await db.query.handbookChapters.findMany({
  with: {
    sections: {
      orderBy: [asc(handbookSections.order)],
    },
  },
  where: eq(handbookChapters.publishStatus, 'PUBLISHED'),
});

// 使用批量操作
const batchAnswers = await db
  .insert(userAnswers)
  .values(answersData)
  .returning();

// 使用事务确保数据一致性
await db.transaction(async (tx) => {
  // 更新用户答题记录
  await tx.insert(userAnswers).values(answers);
  
  // 更新测验会话
  await tx.update(quizSessions)
    .set({ isCompleted: true, endTime: new Date() })
    .where(eq(quizSessions.id, sessionId));
    
  // 更新章节进度
  await tx.update(chapterProgress)
    .set({ quizAttempts: sql`quiz_attempts + 1` })
    .where(eq(chapterProgress.userId, userId));
});
```

## 🔐 安全考虑

### 数据验证

```typescript
// 使用 Zod 进行运行时验证
import { z } from 'zod';

const CreateUserSchema = z.object({
  nickname: z.string().min(2).max(50),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
  province: z.enum(['AB', 'BC', 'ON']),
});

// 在数据库操作前验证
function createUser(data: unknown) {
  const validatedData = CreateUserSchema.parse(data);
  return db.insert(users).values(validatedData);
}
```

### 访问控制

```typescript
// 行级安全策略 (概念)
function getUserData(requestUserId: string, targetUserId: string) {
  // 只能访问自己的数据
  if (requestUserId !== targetUserId) {
    throw new Error('Unauthorized access');
  }
  
  return db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });
}

// 内容访问控制
function getChapterContent(chapterId: string, userType: UserType) {
  return db.query.handbookChapters.findFirst({
    where: and(
      eq(handbookChapters.id, chapterId),
      eq(handbookChapters.publishStatus, 'PUBLISHED')
    ),
    with: {
      sections: {
        where: (section) => {
          // 根据用户类型过滤内容
          if (userType === 'FREE') {
            return eq(section.isFree, true);
          }
          return undefined; // MEMBER 可以访问所有内容
        },
      },
    },
  });
}
```

## 📈 监控和日志

### 查询性能监控

```typescript
// 查询性能日志
const startTime = Date.now();
const result = await db.query.handbookChapters.findMany();
const queryTime = Date.now() - startTime;

if (queryTime > 1000) {
  console.warn(`Slow query detected: ${queryTime}ms`);
}
```

### 错误处理

```typescript
async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // 记录错误到监控系统
    if (error instanceof Error) {
      // 发送到错误追踪服务
      console.error('Database error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
    
    throw error;
  }
}
```

## 🔄 数据迁移策略

### 迁移最佳实践

1. **向后兼容**: 新字段使用默认值
2. **分步迁移**: 大表分批处理
3. **回滚计划**: 每个迁移都有回滚脚本
4. **测试验证**: 在测试环境充分验证

```typescript
// 示例迁移：添加新字段
export async function up(db: PostgresJsDatabase) {
  await db.execute(sql`
    ALTER TABLE handbook_chapters 
    ADD COLUMN difficulty_level INTEGER DEFAULT 1;
  `);
  
  // 更新现有数据
  await db.execute(sql`
    UPDATE handbook_chapters 
    SET difficulty_level = 1 
    WHERE difficulty_level IS NULL;
  `);
  
  // 添加非空约束
  await db.execute(sql`
    ALTER TABLE handbook_chapters 
    ALTER COLUMN difficulty_level SET NOT NULL;
  `);
}

export async function down(db: PostgresJsDatabase) {
  await db.execute(sql`
    ALTER TABLE handbook_chapters 
    DROP COLUMN difficulty_level;
  `);
}
```

## 📚 使用示例

### 在Admin API中使用

```typescript
// apps/admin/src/lib/database.ts
import { getDb } from 'database';
import { handbookChapters, handbookSections } from 'database';

export async function getChapterWithSections(chapterId: string) {
  const db = getDb();
  
  return await db.query.handbookChapters.findFirst({
    where: eq(handbookChapters.id, chapterId),
    with: {
      sections: {
        orderBy: [asc(handbookSections.order)],
      },
    },
  });
}
```

### 在Mobile App中使用

```typescript
// apps/mobile/services/api.ts
import { CreateUserSchema } from 'shared';

export async function createUser(userData: unknown) {
  // 客户端验证
  const validatedData = CreateUserSchema.parse(userData);
  
  // 发送到API
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData),
  });
  
  return response.json();
}
```

---

## 🤝 贡献指南

1. **Schema变更**: 先更新类型定义，再修改数据库schema
2. **迁移测试**: 在本地和测试环境验证迁移
3. **性能考虑**: 大表操作需要性能评估
4. **文档更新**: 及时更新schema文档

**🗄️ 让数据驱动应用的每一个决策！📊** 