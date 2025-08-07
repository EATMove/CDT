import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { handbookSections, handbookChapters } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling, generateId } from '@/lib/utils';
import { ApiErrorCode, CreateSectionSchema } from 'shared';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取章节下的所有段落
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = await params;

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  const db = getDb();

  // 检查章节是否存在
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter not found',
      404
    );
  }

  // 获取段落列表
  const sections = await db
    .select()
    .from(handbookSections)
    .where(eq(handbookSections.chapterId, id))
    .orderBy(handbookSections.order);

  return createSuccessResponse({
    chapter: chapter[0],
    sections,
    totalSections: sections.length,
    freeSections: sections.filter(s => s.isFree).length,
  });
});

// 创建新段落
export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = await params;
  const data = await request.json();

  if (!id) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter ID is required',
      400
    );
  }

  // 验证数据
  const validatedData = CreateSectionSchema.parse({
    ...data,
    chapterId: id,
  });

  const db = getDb();

  // 检查章节是否存在
  const chapter = await db
    .select()
    .from(handbookChapters)
    .where(eq(handbookChapters.id, id))
    .limit(1);

  if (!chapter.length) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Chapter not found',
      404
    );
  }

  const chapterRow = chapter[0];
  const requestedId: string | undefined = validatedData.id;

  let sectionId: string;
  if (requestedId) {
    // 校验请求的ID与章节匹配
    const chapterMatch = /^ch-([a-z]{2})-(\d{3})$/i.exec(chapterRow.id);
    const sectionMatch = /^sec-([a-z]{2})-(\d{3})-(\d{3})$/i.exec(requestedId);
    if (!chapterMatch || !sectionMatch) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid ID format',
        400
      );
    }
    const chapterProvince = chapterMatch[1].toLowerCase();
    const chapterNo = chapterMatch[2];
    const sectionProvince = sectionMatch[1].toLowerCase();
    const sectionChapterNo = sectionMatch[2];
    if (chapterProvince !== sectionProvince || chapterNo !== sectionChapterNo) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Section ID does not match the chapter ID',
        400
      );
    }

    // 唯一性检查
    const exists = await db
      .select({ id: handbookSections.id })
      .from(handbookSections)
      .where(eq(handbookSections.id, requestedId));
    if (exists.length) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Section ID already exists',
        400
      );
    }

    sectionId = requestedId;
  } else {
    // 未提供ID时，生成规则化的段落ID：sec-<province>-<chapterNo>-<sectionNo>
    const match = /^ch-([a-z]{2})-(\d{3})$/i.exec(chapterRow.id);
    const province = (match?.[1] || chapterRow.province || 'ON').toString().toLowerCase();
    const chapterNo = match?.[2] || String(chapterRow.order || 1).padStart(3, '0');

    // 读取现有段落，确定下一个可用序号
    const existing = await db
      .select({ id: handbookSections.id })
      .from(handbookSections)
      .where(eq(handbookSections.chapterId, id));

    const maxSeqFromIds = existing.reduce((max, s) => {
      const m = /^sec-[a-z]{2}-\d{3}-(\d{3})$/i.exec(s.id);
      if (m) {
        return Math.max(max, parseInt(m[1], 10));
      }
      return max;
    }, 0);

    let nextSeq = Math.max(existing.length, maxSeqFromIds) + 1;
    sectionId = `sec-${province}-${chapterNo}-${String(nextSeq).padStart(3, '0')}`;

    // 确保唯一性（极少数并发情况下）
    for (let i = 0; i < 5; i++) {
      const dup = await db
        .select({ id: handbookSections.id })
        .from(handbookSections)
        .where(eq(handbookSections.id, sectionId));
      if (!dup.length) break;
      nextSeq += 1;
      sectionId = `sec-${province}-${chapterNo}-${String(nextSeq).padStart(3, '0')}`;
    }
  }

  // 创建新段落
  const newSection = await db
    .insert(handbookSections)
    .values({
      id: sectionId,
      chapterId: id,
      title: validatedData.title,
      titleEn: validatedData.titleEn,
      order: validatedData.order,
      content: validatedData.content,
      contentEn: validatedData.contentEn,
      isFree: validatedData.isFree,
      requiredUserType: validatedData.requiredUserType,
      wordCount: validatedData.content.length,
      estimatedReadTime: Math.ceil(validatedData.content.length / 200), // 简单估算：200字符/分钟
    })
    .returning();

  return createSuccessResponse(
    newSection[0],
    '段落创建成功'
  );
}); 