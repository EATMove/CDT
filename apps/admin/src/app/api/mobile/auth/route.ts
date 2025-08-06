import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { users, verificationCodes } from 'database';
import { eq, and, gt } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import crypto from 'crypto';
import { generateJWT } from '@/lib/jwt-auth';

// 用户登录/注册
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, email, password, nickname, googleId, appleId, phoneNumber, verificationCode, province } = body;

    if (!action || !['login', 'register', 'google_login', 'apple_login', 'phone_login'].includes(action)) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Valid action is required (login, register, google_login, apple_login, phone_login)',
        400
      );
    }

    const db = getDb();

    if (action === 'register') {
      // 用户注册
      if (!email || !password || !nickname) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Email, password and nickname are required for registration',
          400
        );
      }

      // 检查用户是否已存在
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'User with this email already exists',
          409
        );
      }

      // 创建新用户
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      const now = new Date();
      
      const newUser = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email,
          passwordHash: hashedPassword,
          nickname,
          userType: 'FREE',
          province: (province as 'AB' | 'BC' | 'ON') || 'ON',
          primaryLoginMethod: 'EMAIL',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          lastLoginMethod: 'EMAIL',
        })
        .returning({
          id: users.id,
          email: users.email,
          nickname: users.nickname,
          userType: users.userType,
          province: users.province,
        });

      // 生成JWT token
      const { accessToken, expiresIn } = generateJWT(newUser[0].id, newUser[0].userType);

      return createSuccessResponse({
        message: 'User registered successfully',
        user: newUser[0],
        accessToken,
        expiresIn,
      });

    } else if (action === 'login') {
      // 邮箱登录
      if (!email || !password) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Email and password are required',
          400
        );
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          nickname: users.nickname,
          userType: users.userType,
          province: users.province,
          passwordHash: users.passwordHash,
          isActive: users.isActive,
        })
        .from(users)
        .where(
          and(
            eq(users.email, email),
            eq(users.passwordHash, hashedPassword)
          )
        )
        .limit(1);

      if (!user.length || !user[0].isActive) {
        return createErrorResponse(
          ApiErrorCode.UNAUTHORIZED,
          'Invalid email or password',
          401
        );
      }

      // 更新最后登录时间
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user[0].id));

      // 生成JWT token
      const { accessToken, expiresIn } = generateJWT(user[0].id, user[0].userType);

      return createSuccessResponse({
        message: 'Login successful',
        user: {
          id: user[0].id,
          email: user[0].email,
          nickname: user[0].nickname,
          userType: user[0].userType,
          province: user[0].province,
        },
        accessToken,
        expiresIn,
      });

    } else if (action === 'google_login') {
      // Google登录
      if (!googleId) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Google ID is required',
          400
        );
      }

      // 查找或创建Google用户
      let user = await db
        .select({
          id: users.id,
          email: users.email,
          nickname: users.nickname,
          userType: users.userType,
          province: users.province,
        })
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);

      if (!user.length) {
        // 创建新的Google用户
        const now = new Date();
        const newUser = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            googleId,
            email: email || null, // Google可能提供email
            nickname: nickname || `Google用户_${googleId.slice(-6)}`,
            userType: 'FREE',
            province: (province as 'AB' | 'BC' | 'ON') || 'ON',
            primaryLoginMethod: 'GOOGLE',
            googleVerified: true,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            lastLoginMethod: 'GOOGLE',
          })
          .returning({
            id: users.id,
            email: users.email,
            nickname: users.nickname,
            userType: users.userType,
            province: users.province,
          });

        user = newUser;
      } else {
        // 更新最后登录时间
        await db
          .update(users)
          .set({ 
            lastLoginAt: new Date(),
            lastLoginMethod: 'GOOGLE'
          })
          .where(eq(users.id, user[0].id));
      }

      // 生成JWT token
      const { accessToken, expiresIn } = generateJWT(user[0].id, user[0].userType);

      return createSuccessResponse({
        message: 'Google login successful',
        user: user[0],
        accessToken,
        expiresIn,
      });

    } else if (action === 'apple_login') {
      // Apple登录
      if (!appleId) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Apple ID is required',
          400
        );
      }

      // 查找或创建Apple用户
      let user = await db
        .select({
          id: users.id,
          email: users.email,
          nickname: users.nickname,
          userType: users.userType,
          province: users.province,
        })
        .from(users)
        .where(eq(users.appleId, appleId))
        .limit(1);

      if (!user.length) {
        // 创建新的Apple用户
        const now = new Date();
        const newUser = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            appleId,
            email: email || null, // Apple可能提供email
            nickname: nickname || `Apple用户_${appleId.slice(-6)}`,
            userType: 'FREE',
            province: (province as 'AB' | 'BC' | 'ON') || 'ON',
            primaryLoginMethod: 'APPLE',
            appleVerified: true,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            lastLoginMethod: 'APPLE',
          })
          .returning({
            id: users.id,
            email: users.email,
            nickname: users.nickname,
            userType: users.userType,
            province: users.province,
          });

        user = newUser;
      } else {
        // 更新最后登录时间
        await db
          .update(users)
          .set({ 
            lastLoginAt: new Date(),
            lastLoginMethod: 'APPLE'
          })
          .where(eq(users.id, user[0].id));
      }

      // 生成JWT token
      const { accessToken, expiresIn } = generateJWT(user[0].id, user[0].userType);

      return createSuccessResponse({
        message: 'Apple login successful',
        user: user[0],
        accessToken,
        expiresIn,
      });

    } else if (action === 'phone_login') {
      // 手机号登录
      if (!phoneNumber || !verificationCode) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Phone number and verification code are required',
          400
        );
      }

      // 验证验证码
      const validCode = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.phone, phoneNumber),
            eq(verificationCodes.code, verificationCode),
            eq(verificationCodes.type, 'login'),
            gt(verificationCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!validCode.length) {
        return createErrorResponse(
          ApiErrorCode.INVALID_VERIFICATION_CODE,
          'Invalid or expired verification code',
          401
        );
      }

      // 标记验证码为已使用
      await db
        .update(verificationCodes)
        .set({ usedAt: new Date() })
        .where(eq(verificationCodes.id, validCode[0].id));

      // 查找或创建手机用户
      let user = await db
        .select({
          id: users.id,
          phone: users.phone,
          nickname: users.nickname,
          userType: users.userType,
          province: users.province,
        })
        .from(users)
        .where(eq(users.phone, phoneNumber))
        .limit(1);

      if (!user.length) {
        // 创建新的手机用户
        const now = new Date();
        const newUser = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            phone: phoneNumber,
            nickname: nickname || `手机用户_${phoneNumber.slice(-4)}`,
            userType: 'FREE',
            province: (province as 'AB' | 'BC' | 'ON') || 'ON',
            primaryLoginMethod: 'PHONE',
            isActive: true,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            lastLoginMethod: 'PHONE',
          })
          .returning({
            id: users.id,
            phone: users.phone,
            nickname: users.nickname,
            userType: users.userType,
            province: users.province,
          });

        user = newUser;
      } else {
        // 更新最后登录时间
        await db
          .update(users)
          .set({ 
            lastLoginAt: new Date(),
            lastLoginMethod: 'PHONE'
          })
          .where(eq(users.id, user[0].id));
      }

      // 生成JWT token
      const { accessToken, expiresIn } = generateJWT(user[0].id, user[0].userType);

      return createSuccessResponse({
        message: 'Phone login successful',
        user: user[0],
        accessToken,
        expiresIn,
      });
    }

    // 如果没有匹配的action，返回错误
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Invalid action specified',
      400
    );

  } catch (error) {
    console.error('Mobile auth API error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Authentication failed',
      500
    );
  }
});

// 退出登录 (JWT无状态，客户端直接删除token即可)
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  // 对于JWT token，退出登录只需要客户端删除token
  // 服务端无需维护状态，直接返回成功
  return createSuccessResponse({
    message: 'Logout successful. Please remove the access token from client storage.'
  });
});