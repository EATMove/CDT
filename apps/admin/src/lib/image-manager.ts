import { getDb } from '@/lib/database';
import { handbookImages, handbookChapters, handbookSections } from 'database';
import { eq, and, or, isNull, isNotNull, desc, asc, like, inArray } from 'drizzle-orm';

export interface ImageQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  usage?: string;
  orderBy?: 'createdAt' | 'filename' | 'fileSize' | 'order';
  order?: 'asc' | 'desc';
}

export interface ContextImageQuery extends ImageQueryOptions {
  chapterId?: string;
  sectionId?: string;
  includeSubSections?: boolean;
  contextOnly?: boolean;
}

export class ImageManager {
  private db = getDb();

  /**
   * 获取编辑上下文中的图片
   * 根据当前编辑的章节或段落智能筛选相关图片
   */
  async getContextImages(options: ContextImageQuery) {
    const {
      chapterId,
      sectionId,
      usage,
      includeSubSections = false,
      page = 1,
      limit = 20,
      search,
      orderBy = 'order',
      order = 'asc'
    } = options;

    // 构建查询条件
    let whereConditions = [];

    // 搜索条件
    if (search) {
      whereConditions.push(
        like(handbookImages.originalName, `%${search}%`)
      );
    }

    // 用途筛选
    if (usage) {
      whereConditions.push(eq(handbookImages.usage, usage as 'content' | 'cover' | 'diagram' | 'illustration'));
    }

    // 上下文筛选逻辑
    if (sectionId) {
      // 段落级别：获取段落的图片
      whereConditions.push(eq(handbookImages.sectionId, sectionId));
    } else if (chapterId) {
      if (includeSubSections) {
        // 包含章节下所有图片（章节直属 + 段落图片）
        whereConditions.push(
          or(
            and(
              eq(handbookImages.chapterId, chapterId),
              isNull(handbookImages.sectionId)
            ),
            // TODO: 添加子段落图片的查询
            // 这里需要join handbookSections表来获取属于该章节的所有段落
          )
        );
      } else {
        // 只获取章节直属图片（不属于任何段落）
        whereConditions.push(
          and(
            eq(handbookImages.chapterId, chapterId),
            isNull(handbookImages.sectionId)
          )
        );
      }
    }

    // 构建排序
    const orderFunction = order === 'desc' ? desc : asc;
    let orderByClause;
    
    switch (orderBy) {
      case 'createdAt':
        orderByClause = orderFunction(handbookImages.createdAt);
        break;
      case 'filename':
        orderByClause = orderFunction(handbookImages.filename);
        break;
      case 'fileSize':
        orderByClause = orderFunction(handbookImages.fileSize);
        break;
      case 'order':
        orderByClause = orderFunction(handbookImages.order);
        break;
      default:
        orderByClause = asc(handbookImages.order);
    }

    // 执行查询
    let query = this.db.select().from(handbookImages);
    
    if (whereConditions.length > 0) {
      const whereClause = whereConditions.length === 1 
        ? whereConditions[0] 
        : and(...whereConditions);
      query = query.where(whereClause) as any;
    }

    const offset = (page - 1) * limit;
    const images = await query
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // 获取总数
    let countQuery = this.db.select({ id: handbookImages.id }).from(handbookImages);
    if (whereConditions.length > 0) {
      const whereClause = whereConditions.length === 1 
        ? whereConditions[0] 
        : and(...whereConditions);
      countQuery = countQuery.where(whereClause) as any;
    }
    
    const allImages = await countQuery;
    const total = allImages.length;

    return {
      data: images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 获取智能推荐的图片
   * 基于当前上下文推荐相关图片
   */
  async getRecommendedImages(chapterId: string, currentUsage?: string, limit = 10) {
    const recommendations = [];

    // 1. 同章节、同用途的最近图片
    if (currentUsage) {
      const sameUsageImages = await this.db.select()
        .from(handbookImages)
        .where(
          and(
            eq(handbookImages.chapterId, chapterId),
            eq(handbookImages.usage, currentUsage as 'content' | 'cover' | 'diagram' | 'illustration')
          )
        )
        .orderBy(desc(handbookImages.createdAt))
        .limit(limit);
      
      recommendations.push({
        type: 'sameUsage',
        title: `同类型图片 (${currentUsage})`,
        images: sameUsageImages
      });
    }

    // 2. 同章节的最近上传图片
    const recentImages = await this.db.select()
      .from(handbookImages)
      .where(eq(handbookImages.chapterId, chapterId))
      .orderBy(desc(handbookImages.createdAt))
      .limit(limit);
    
    recommendations.push({
      type: 'recent',
      title: '最近上传',
      images: recentImages
    });

    return recommendations;
  }

  /**
   * 批量关联图片到上下文
   */
  async associateImagesToContext(
    imageIds: string[],
    context: { chapterId?: string; sectionId?: string },
    options?: { usage?: string; startOrder?: number }
  ) {
    const { chapterId, sectionId } = context;
    const { usage, startOrder = 0 } = options || {};

    if (!chapterId && !sectionId) {
      throw new Error('必须提供章节ID或段落ID');
    }

    if (chapterId && sectionId) {
      throw new Error('不能同时关联章节和段落');
    }

    // 构建更新数据
    const updates: any = {};
    
    if (chapterId) {
      updates.chapterId = chapterId;
      updates.sectionId = null;
    }
    
    if (sectionId) {
      updates.sectionId = sectionId;
      // 如果关联到段落，需要获取段落所属的章节
      const section = await this.db.select({ chapterId: handbookSections.chapterId })
        .from(handbookSections)
        .where(eq(handbookSections.id, sectionId))
        .limit(1);
      
      if (section.length > 0) {
        updates.chapterId = section[0].chapterId;
      }
    }
    
    if (usage) {
      updates.usage = usage;
    }

    // 批量更新
    const results = [];
    for (let i = 0; i < imageIds.length; i++) {
      const imageId = imageIds[i];
      const updateData = {
        ...updates,
        order: startOrder + i
      };

      const result = await this.db.update(handbookImages)
        .set(updateData)
        .where(eq(handbookImages.id, imageId));
      
      results.push({ imageId, updated: result });
    }

    return results;
  }

  /**
   * 获取孤儿图片（没有关联到任何章节或段落的图片）
   */
  async getOrphanImages(options: ImageQueryOptions = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      orderBy = 'createdAt',
      order = 'desc'
    } = options;

    let whereConditions = [
      and(
        isNull(handbookImages.chapterId),
        isNull(handbookImages.sectionId)
      )
    ];

    if (search) {
      whereConditions.push(
        like(handbookImages.originalName, `%${search}%`)
      );
    }

    const orderFunction = order === 'desc' ? desc : asc;
    let orderByClause;
    
    switch (orderBy) {
      case 'filename':
        orderByClause = orderFunction(handbookImages.filename);
        break;
      case 'fileSize':
        orderByClause = orderFunction(handbookImages.fileSize);
        break;
      default:
        orderByClause = orderFunction(handbookImages.createdAt);
    }

    const whereClause = whereConditions.length === 1 
      ? whereConditions[0] 
      : and(...whereConditions);

    const offset = (page - 1) * limit;
    const images = await this.db.select()
      .from(handbookImages)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // 获取总数
    const allImages = await this.db.select({ id: handbookImages.id })
      .from(handbookImages)
      .where(whereClause);
    
    const total = allImages.length;

    return {
      data: images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 清理孤儿图片
   * 删除长时间未关联的图片
   */
  async cleanupOrphanImages(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const orphanImages = await this.db.select()
      .from(handbookImages)
      .where(
        and(
          isNull(handbookImages.chapterId),
          isNull(handbookImages.sectionId),
          // createdAt < cutoffDate 
          // TODO: 添加日期比较条件
        )
      );

    // TODO: 实现实际的删除逻辑
    return {
      found: orphanImages.length,
      // deleted: 0
    };
  }
}

// 导出单例实例
export const imageManager = new ImageManager();