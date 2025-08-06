import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface AdminUser {
  username: string;
  role: 'admin';
}

/**
 * 从环境变量获取admin凭据
 */
function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return { username, password };
}

/**
 * 生成简单的session token
 */
function generateSessionToken(username: string): string {
  const secret = process.env.SESSION_SECRET || 'your-session-secret';
  const timestamp = Date.now().toString();
  const hash = crypto.createHmac('sha256', secret)
    .update(`${username}:${timestamp}`)
    .digest('hex');
  return `${username}:${timestamp}:${hash}`;
}

/**
 * 验证session token
 */
function verifySessionToken(token: string): AdminUser | null {
  try {
    const [username, timestamp, hash] = token.split(':');
    const secret = process.env.SESSION_SECRET || 'your-session-secret';
    
    // 验证hash
    const expectedHash = crypto.createHmac('sha256', secret)
      .update(`${username}:${timestamp}`)
      .digest('hex');
    
    if (hash !== expectedHash) {
      return null;
    }
    
    // 检查token是否过期（24小时）
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    if (now - tokenTime > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return { username, role: 'admin' as const };
  } catch (error) {
    return null;
  }
}

/**
 * 登录验证
 */
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const credentials = getAdminCredentials();
  return username === credentials.username && password === credentials.password;
}

/**
 * 创建admin session
 */
export async function createAdminSession(username: string): Promise<string> {
  const token = generateSessionToken(username);
  
  // 设置cookie - 修复Next.js 15异步问题
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24小时
  });
  
  return token;
}

/**
 * 验证admin session
 */
export async function verifyAdminSession(request: NextRequest): Promise<AdminUser | null> {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) {
    return null;
  }
  
  return verifySessionToken(sessionToken);
}

/**
 * 清除admin session
 */
export async function clearAdminSession(): Promise<void> {
  // 修复Next.js 15异步问题
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Admin认证中间件
 */
export function withAdminAuth(handler: (request: NextRequest, user: AdminUser) => Promise<NextResponse>) {
  return async function (request: NextRequest): Promise<NextResponse> {
    const user = await verifyAdminSession(request);
    
    if (!user) {
      // 重定向到登录页面
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return handler(request, user);
  };
}

/**
 * 检查是否已登录（用于登录页面）
 */
export async function isAdminLoggedIn(request: NextRequest): Promise<boolean> {
  const user = await verifyAdminSession(request);
  return user !== null;
} 