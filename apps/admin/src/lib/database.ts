import { createDatabase, type DatabaseConnection } from 'database';
import { eq, and, desc, asc, like, ilike, inArray, count } from 'drizzle-orm';

// 全局数据库连接实例
let dbInstance: DatabaseConnection | null = null;

/**
 * 获取数据库连接实例
 */
export function getDb() {
  if (!dbInstance) {
    dbInstance = createDatabase(process.env.DATABASE_URL);
  }
  return dbInstance.db;
}

/**
 * 关闭数据库连接
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 数据库操作工具类
 */
export class DatabaseService {
  private db = getDb();

  /**
   * 事务处理
   */
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await this.db.transaction(callback);
  }

  /**
   * 创建分页响应
   */
  createPaginationResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

// 导出常用的数据库操作符
export { eq, and, desc, asc, like, ilike, inArray, count };

// 单例数据库服务
export const dbService = new DatabaseService(); 