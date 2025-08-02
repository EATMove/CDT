# Handbook结构重构设计方案

## 需求分析

根据您提出的三个核心需求，我们重新设计了handbook的数据结构：

1. **内容格式**：支持从PDF重新排版的HTML内容，包含图片和文字
2. **付费内容处理**：灵活的付费控制和预览机制
3. **内容管理**：为admin端提供完整的内容管理工具

## 新的数据表结构

### 1. 核心表设计

#### `handbook_chapters` (章节表) - 重新设计
```sql
CREATE TABLE handbook_chapters (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT NOT NULL,
  description_en TEXT,
  order INTEGER NOT NULL,
  
  -- 内容相关
  content_format content_format NOT NULL DEFAULT 'HTML',
  estimated_read_time INTEGER NOT NULL, -- 分钟
  
  -- 封面图片
  cover_image_url VARCHAR(500),
  cover_image_alt VARCHAR(200),
  
  -- 付费控制 (更灵活的设计)
  payment_type payment_type NOT NULL DEFAULT 'FREE',
  free_preview_sections INTEGER DEFAULT 0, -- 免费预览段落数
  
  -- 学习路径
  prerequisite_chapters TEXT[],
  
  -- 发布控制 (支持草稿/审核/发布流程)
  publish_status publish_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  
  -- 元数据 (支持多人协作)
  author_id VARCHAR(36) REFERENCES users(id),
  last_edited_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `handbook_sections` (段落表) - 新增
```sql
CREATE TABLE handbook_sections (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) NOT NULL REFERENCES handbook_chapters(id),
  
  -- 段落信息
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  order INTEGER NOT NULL,
  
  -- 内容 (HTML格式，支持富文本)
  content TEXT NOT NULL,
  content_en TEXT,
  
  -- 付费控制 (段落级别的精细控制)
  is_free BOOLEAN NOT NULL DEFAULT true,
  required_user_type TEXT[] DEFAULT ['FREE'],
  
  -- 阅读估算 (自动计算或手动设置)
  word_count INTEGER DEFAULT 0,
  estimated_read_time INTEGER DEFAULT 0, -- 秒数
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `handbook_images` (图片资源表) - 新增
```sql
CREATE TABLE handbook_images (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  
  -- 图片信息
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- 图片元数据
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(200),
  caption TEXT,
  caption_en TEXT,
  
  -- 图片用途分类
  usage VARCHAR(50) NOT NULL DEFAULT 'content', -- 'content', 'cover', 'diagram', 'illustration'
  order INTEGER DEFAULT 0,
  
  -- 上传信息
  uploaded_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `handbook_content_versions` (版本控制表) - 新增
```sql
CREATE TABLE handbook_content_versions (
  id VARCHAR(36) PRIMARY KEY,
  chapter_id VARCHAR(36) REFERENCES handbook_chapters(id),
  section_id VARCHAR(36) REFERENCES handbook_sections(id),
  
  -- 版本信息
  version VARCHAR(20) NOT NULL, -- 如：v1.0.0
  version_note TEXT,
  
  -- 内容快照 (JSON格式存储完整内容)
  content_snapshot JSON NOT NULL,
  
  -- 变更信息
  change_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  change_description TEXT,
  
  -- 操作信息
  created_by VARCHAR(36) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 2. 付费控制机制

#### 章节级别控制
- `FREE` - 完全免费
- `TRIAL_INCLUDED` - 试用用户可访问
- `MEMBER_ONLY` - 仅会员可访问
- `PREMIUM` - 高级会员专享（为未来扩展）

#### 段落级别控制
- `free_preview_sections` - 设置免费预览的段落数量
- `is_free` - 每个段落的免费状态
- `required_user_type` - 访问该段落所需的用户类型数组

#### 灵活的预览机制
```typescript
// 示例：第一章前3个段落免费，其余需要试用或会员
{
  paymentType: 'TRIAL_INCLUDED',
  freePreviewSections: 3,
  sections: [
    { isFree: true, requiredUserType: ['FREE'] },        // 段落1 - 所有人可见
    { isFree: true, requiredUserType: ['FREE'] },        // 段落2 - 所有人可见
    { isFree: true, requiredUserType: ['FREE'] },        // 段落3 - 所有人可见
    { isFree: false, requiredUserType: ['TRIAL', 'MEMBER'] }, // 段落4 - 需要试用/会员
    { isFree: false, requiredUserType: ['MEMBER'] },     // 段落5 - 仅会员
  ]
}
```

## 内容管理解决方案

### 1. Admin端功能设计

#### 章节管理界面
- **章节列表**：支持拖拽排序、批量操作、发布状态管理
- **章节编辑**：基本信息、封面图片、付费设置、前置条件
- **发布流程**：草稿 → 审核 → 发布 → 归档

#### 内容编辑器
- **富文本编辑器**：支持HTML格式，图片插入，样式设置
- **实时预览**：即时查看渲染效果，支持中英文切换
- **图片管理**：拖拽上传、图片库、自动压缩、CDN集成
- **版本控制**：自动保存草稿、版本历史、内容比较、一键回滚

#### 段落管理
- **分段编辑**：每个段落独立编辑，支持重新排序
- **付费设置**：可视化设置每个段落的访问权限
- **进度追踪**：显示每个段落的字数、预估阅读时间

### 2. 实习生工作流程

#### 内容录入流程
1. **创建章节**：设置基本信息和封面
2. **分段录入**：逐段录入内容，设置标题
3. **图片处理**：上传相关图片，设置alt文本和说明
4. **格式优化**：使用富文本编辑器美化排版
5. **预览检查**：多端预览效果，确保显示正常
6. **提交审核**：将状态改为"审核中"

#### 质量控制
- **内容规范**：提供详细的编辑指南和模板
- **自动检查**：字数统计、图片alt文本检查、链接有效性
- **版本追踪**：所有修改都有记录，可以追溯和回滚

### 3. 图片管理系统

#### 图片上传和处理
```typescript
// 图片上传配置
const imageConfig = {
  maxSize: '5MB',
  supportedFormats: ['jpg', 'png', 'webp', 'svg'],
  autoCompress: true,
  generateThumbnails: true,
  cdnIntegration: true
};

// 图片用途分类
const imageUsage = {
  'content': '正文图片',
  'cover': '封面图片', 
  'diagram': '示意图',
  'illustration': '插图'
};
```

#### 图片引用管理
- **自动关联**：图片与章节/段落自动关联
- **引用追踪**：显示图片在哪些地方被使用
- **批量操作**：支持批量上传、移动、删除
- **SEO优化**：自动生成alt文本建议

## 技术实现方案

### 1. Admin端技术栈

#### 富文本编辑器选择
```typescript
// 推荐使用 TinyMCE 或 Tiptap
const editorConfig = {
  editor: 'TinyMCE', // 功能强大，插件丰富
  features: [
    'formatting',
    'images',
    'tables',
    'links',
    'lists',
    'code',
    'preview'
  ],
  customPlugins: [
    'image-upload',
    'auto-save',
    'word-count',
    'spell-check'
  ]
};
```

#### 界面组件设计
- **shadcn/ui** - 基础UI组件库
- **React Hook Form** - 表单管理
- **React Query** - 数据获取和缓存
- **React DnD** - 拖拽排序功能
- **Recharts** - 数据可视化（进度统计）

### 2. 内容渲染方案

#### 移动端HTML渲染
```typescript
// React Native HTML渲染
const renderConfig = {
  renderer: 'react-native-render-html',
  customRenderers: {
    img: ImageRenderer,
    table: TableRenderer,
    code: CodeRenderer
  },
  styling: {
    responsive: true,
    darkMode: true,
    fontSize: 'adjustable'
  }
};
```

#### 性能优化
- **懒加载**：分段加载内容，按需渲染
- **图片优化**：WebP格式、多尺寸、懒加载
- **缓存策略**：内容缓存、图片缓存、离线支持

### 3. 数据迁移方案

#### 现有数据迁移
```sql
-- 将现有章节数据迁移到新结构
INSERT INTO handbook_chapters (id, title, description, order, content_format, estimated_read_time, payment_type, publish_status)
SELECT id, title, description, order, 'HTML', estimated_read_time, 
       CASE WHEN is_free THEN 'FREE' ELSE 'MEMBER_ONLY' END,
       'PUBLISHED'
FROM old_handbook_chapters;

-- 将章节内容分解为段落
INSERT INTO handbook_sections (id, chapter_id, title, order, content, is_free, word_count)
SELECT 
  uuid_generate_v4(),
  chapter_id,
  '段落 ' || ROW_NUMBER() OVER (PARTITION BY chapter_id ORDER BY order),
  ROW_NUMBER() OVER (PARTITION BY chapter_id ORDER BY order),
  content_segment,
  true,
  LENGTH(content_segment) / 5 -- 粗略估算字数
FROM (
  -- 这里需要根据实际内容结构来分割
  SELECT chapter_id, unnest(string_to_array(content, '\n\n')) as content_segment
  FROM old_handbook_chapters
) t;
```

## 使用示例

### 1. 创建新章节（Admin端）
```typescript
const createChapter = async (data: CreateChapterData) => {
  // 1. 创建章节
  const chapter = await api.post('/admin/chapters', {
    title: data.title,
    titleEn: data.titleEn,
    description: data.description,
    paymentType: data.paymentType,
    freePreviewSections: data.freePreviewSections
  });
  
  // 2. 上传封面图片
  if (data.coverImage) {
    const coverImage = await api.post('/admin/images/upload', {
      file: data.coverImage,
      chapterId: chapter.id,
      usage: 'cover'
    });
    
    await api.patch(`/admin/chapters/${chapter.id}`, {
      coverImageUrl: coverImage.fileUrl
    });
  }
  
  return chapter;
};
```

### 2. 内容编辑（实习生操作）
```typescript
const ContentEditor = () => {
  const [sections, setSections] = useState<HandbookSection[]>([]);
  const [currentSection, setCurrentSection] = useState<HandbookSection | null>(null);
  
  const saveSection = async (sectionData: Partial<HandbookSection>) => {
    // 自动保存草稿
    const updated = await api.patch(`/admin/sections/${currentSection.id}`, {
      content: sectionData.content,
      wordCount: calculateWordCount(sectionData.content),
      estimatedReadTime: calculateReadTime(sectionData.content)
    });
    
    // 创建版本快照
    await api.post('/admin/content-versions', {
      sectionId: currentSection.id,
      version: generateVersion(),
      changeType: 'update',
      contentSnapshot: updated
    });
  };
  
  return (
    <div className="editor-layout">
      <SectionList sections={sections} onSelect={setCurrentSection} />
      <RichTextEditor 
        content={currentSection?.content}
        onChange={saveSection}
        onImageUpload={handleImageUpload}
      />
      <PreviewPanel content={currentSection?.content} />
    </div>
  );
};
```

### 3. 移动端内容渲染
```typescript
const ChapterReader = ({ chapterId }: { chapterId: string }) => {
  const { data: chapter } = useChapterWithSections(chapterId);
  const { userType } = useAuth();
  
  const accessibleSections = useMemo(() => {
    return chapter?.sections.filter(section => {
      if (section.isFree) return true;
      return section.requiredUserType.includes(userType);
    }) || [];
  }, [chapter, userType]);
  
  return (
    <ScrollView>
      <ChapterHeader chapter={chapter} />
      {accessibleSections.map((section, index) => (
        <SectionRenderer 
          key={section.id}
          section={section}
          isLocked={index >= chapter.freePreviewSections && userType === 'FREE'}
        />
      ))}
      {userType === 'FREE' && <UpgradePrompt />}
    </ScrollView>
  );
};
```

## 优势总结

### 1. 内容管理优势
- ✅ **分段管理**：便于实习生分段编辑，提高工作效率
- ✅ **版本控制**：完整的历史记录，支持回滚和比较
- ✅ **图片管理**：专业的图片管理系统，支持多种用途
- ✅ **富文本支持**：完整的HTML渲染，支持复杂排版

### 2. 付费控制优势
- ✅ **灵活预览**：可设置任意数量的免费预览段落
- ✅ **精细权限**：段落级别的访问控制
- ✅ **多级会员**：支持免费/试用/会员/高级会员
- ✅ **动态调整**：可随时调整付费策略

### 3. 技术架构优势
- ✅ **性能优化**：分段加载，按需渲染
- ✅ **SEO友好**：结构化数据，利于搜索引擎
- ✅ **扩展性强**：易于添加新功能和内容类型
- ✅ **多语言支持**：完整的中英文对照系统

这个新的handbook结构完全解决了您提出的三个核心需求，为PDF内容的重新排版、付费内容管理和实习生内容录入提供了完整的解决方案。 