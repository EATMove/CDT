import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from './database';
import { users } from 'database';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email: string | null;
  nickname: string;
  userType: 'FREE' | 'MEMBER' | 'TRIAL';
  isActive: boolean;
}

/**
 * 从请求中提取JWT token
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 也可以从cookie中获取
  const token = request.cookies.get('auth_token');
  return token?.value || null;
}

/**
 * 验证JWT token
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    
    // 从数据库验证用户
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (!user.length || !user[0].isActive) {
      return null;
    }
    
    return {
      id: user[0].id,
      email: user[0].email,
      nickname: user[0].nickname,
      userType: user[0].userType,
      isActive: user[0].isActive,
    };
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

/**
 * 认证中间件
 */
export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

/**
 * 权限检查
 */
export function checkPermission(user: AuthUser, requiredRole: string): boolean {
  // 对于admin应用，简化权限检查
  // 只有MEMBER类型用户可以访问
  if (requiredRole === 'admin') {
    return user.userType === 'MEMBER';
  }
  
  // 默认所有用户都可以访问基础功能
  return true;
}

/**
 * 创建认证装饰器
 */
export function withAuth(requiredRole: string = 'user') {
  return function (handler: (request: NextRequest, user: AuthUser, ...args: any[]) => Promise<Response>) {
    return async function (request: NextRequest, ...args: any[]): Promise<Response> {
      try {
        const user = await authenticate(request);
        
        if (!user) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'UNAUTHORIZED',
                message: '请先登录',
              },
              timestamp: new Date().toISOString(),
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        if (!checkPermission(user, requiredRole)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: '权限不足',
              },
              timestamp: new Date().toISOString(),
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        return await handler(request, user, ...args);
      } catch (error) {
        console.error('认证错误:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: '服务器内部错误',
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    };
  };
} 