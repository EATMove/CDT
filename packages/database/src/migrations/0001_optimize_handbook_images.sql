-- 优化图片表结构和索引
-- 这个迁移主要是添加索引来提升查询性能

-- 1. 添加复合索引来优化常用查询
CREATE INDEX IF NOT EXISTS idx_handbook_images_chapter_usage ON handbook_images(chapter_id, usage) WHERE chapter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_handbook_images_section_usage ON handbook_images(section_id, usage) WHERE section_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_handbook_images_chapter_order ON handbook_images(chapter_id, "order") WHERE chapter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_handbook_images_section_order ON handbook_images(section_id, "order") WHERE section_id IS NOT NULL;

-- 2. 添加时间索引用于按时间排序
CREATE INDEX IF NOT EXISTS idx_handbook_images_created_at ON handbook_images(created_at);

-- 3. 添加上传者索引
CREATE INDEX IF NOT EXISTS idx_handbook_images_uploaded_by ON handbook_images(uploaded_by) WHERE uploaded_by IS NOT NULL;

-- 4. 添加文件名搜索索引（支持模糊搜索）
CREATE INDEX IF NOT EXISTS idx_handbook_images_original_name ON handbook_images USING gin(to_tsvector('simple', original_name));

-- 5. 添加约束确保数据一致性（章节和段落二选一）
ALTER TABLE handbook_images 
ADD CONSTRAINT chk_handbook_images_context 
CHECK (
  (chapter_id IS NOT NULL AND section_id IS NULL) OR 
  (chapter_id IS NULL AND section_id IS NOT NULL)
);

-- 6. 添加注释说明表结构
COMMENT ON TABLE handbook_images IS '手册图片资源表 - 图片必须关联到章节或段落中的一个';
COMMENT ON COLUMN handbook_images.chapter_id IS '所属章节ID（与section_id二选一）';
COMMENT ON COLUMN handbook_images.section_id IS '所属段落ID（与chapter_id二选一）';
COMMENT ON COLUMN handbook_images.usage IS '图片用途：content-内容图片, cover-封面图片, diagram-图表, illustration-插图';
COMMENT ON COLUMN handbook_images."order" IS '在所属章节或段落中的排序';