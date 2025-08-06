import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { verificationCodes } from 'database';
import { eq, and, gt } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import crypto from 'crypto';

// 发送验证码
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, phone, type } = body;

    if (!type || !['register', 'login', 'reset_password'].includes(type)) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Valid type is required (register, login, reset_password)',
        400
      );
    }

    if (!email && !phone) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Email or phone number is required',
        400
      );
    }

    const db = getDb();

    // 检查是否有未过期的验证码
    const existingCode = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          email ? eq(verificationCodes.email, email) : eq(verificationCodes.phone, phone!),
          eq(verificationCodes.type, type),
          gt(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (existingCode.length > 0) {
      return createErrorResponse(
        ApiErrorCode.TOO_MANY_ATTEMPTS,
        'Verification code already sent, please wait before requesting again',
        429
      );
    }

    // 生成6位数验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

    // 保存验证码
    await db
      .insert(verificationCodes)
      .values({
        id: crypto.randomUUID(),
        email: email || null,
        phone: phone || null,
        code,
        type,
        expiresAt,
        createdAt: new Date(),
      });

    // 在实际应用中，这里应该发送短信或邮件
    // 现在只是模拟，返回验证码（仅用于开发测试）
    const isDevelopment = process.env.NODE_ENV === 'development';

    return createSuccessResponse({
      message: email 
        ? 'Verification code sent to email successfully'
        : 'Verification code sent to phone successfully',
      ...(isDevelopment && { 
        code, // 开发环境下返回验证码
        expiresAt 
      })
    });

  } catch (error) {
    console.error('Send verification code error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to send verification code',
      500
    );
  }
});

// 验证验证码
export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, phone, code, type } = body;

    if (!code || !type) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Code and type are required',
        400
      );
    }

    if (!email && !phone) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Email or phone number is required',
        400
      );
    }

    const db = getDb();

    // 查找验证码
    const verificationCode = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          email ? eq(verificationCodes.email, email) : eq(verificationCodes.phone, phone!),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, type),
          gt(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verificationCode.length) {
      return createErrorResponse(
        ApiErrorCode.INVALID_VERIFICATION_CODE,
        'Invalid or expired verification code',
        400
      );
    }

    // 标记验证码为已使用
    await db
      .update(verificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(verificationCodes.id, verificationCode[0].id));

    return createSuccessResponse({
      message: 'Verification code verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to verify code',
      500
    );
  }
});