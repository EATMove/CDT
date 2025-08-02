// 数据库包主入口文件
export * from './schema';

// 导入必要的drizzle功能
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { allTables } from './schema';

// 数据库连接类型
export type DatabaseConnection = ReturnType<typeof createDatabase>;

// 创建数据库连接
export function createDatabase(connectionString?: string) {
  const dbUrl = connectionString || process.env.DATABASE_URL || 'postgresql://localhost:5432/canadian_driving_test';
  
  // 创建PostgreSQL连接
  const client = postgres(dbUrl);
  
  // 创建Drizzle数据库实例
  const db = drizzle(client, { schema: allTables });
  
  return {
    db,
    client,
    close: () => client.end(),
  };
}

// 导出默认数据库实例（可选）
let defaultDb: DatabaseConnection | null = null;

export function getDatabase() {
  if (!defaultDb) {
    defaultDb = createDatabase();
  }
  return defaultDb;
}

export function closeDatabase() {
  if (defaultDb) {
    defaultDb.close();
    defaultDb = null;
  }
}

// 导出表定义以便在其他地方使用
export { allTables as tables }; 