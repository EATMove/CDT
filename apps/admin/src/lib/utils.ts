import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from 'next/server';
import { ApiResponse, ErrorResponse, ApiErrorCode } from 'shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * 处理异步API路由中的错误
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API错误:', error);
      
      // 如果是已知的业务错误
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          error.message,
          400
        );
      }
      
      // 数据库错误
      if (error instanceof Error && error.message.includes('database')) {
        return createErrorResponse(
          ApiErrorCode.DATABASE_ERROR,
          '数据库操作失败',
          500
        );
      }
      
      // 默认服务器错误
      return createErrorResponse(
        ApiErrorCode.UNKNOWN_ERROR,
        '服务器内部错误',
        500
      );
    }
  };
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(
    field => !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );
  
  if (missingFields.length > 0) {
    throw new Error(`VALIDATION_ERROR: 缺少必填字段: ${missingFields.join(', ')}`);
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
