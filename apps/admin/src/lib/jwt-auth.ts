import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { createErrorResponse } from '@/lib/utils';
import { ApiErrorCode } from 'shared';

export interface JWTPayload {
  userId: string;
  userType: string;
  iat: number;
  exp: number;
}

/**
 * 从请求中提取并验证JWT token
 */
export function verifyJWTFromRequest(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 中间件函数：验证JWT并返回用户ID
 */
export function requireAuth(request: NextRequest): { userId: string; userType: string } | Response {
  const payload = verifyJWTFromRequest(request);
  
  if (!payload) {
    return createErrorResponse(
      ApiErrorCode.UNAUTHORIZED,
      'Valid authorization token is required',
      401
    );
  }

  return {
    userId: payload.userId,
    userType: payload.userType,
  };
}

/**
 * 生成JWT token
 */
export function generateJWT(userId: string, userType: string): { accessToken: string; expiresIn: number } {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> & { iat: number; exp: number } = {
    userId,
    userType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30天
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
  const expiresIn = 30 * 24 * 60 * 60; // 30天（秒）

  return {
    accessToken,
    expiresIn,
  };
}