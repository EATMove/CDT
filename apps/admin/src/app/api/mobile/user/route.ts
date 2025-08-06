import { NextRequest } from 'next/server';
import { getDb } from '@/lib/database';
import { users } from 'database';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, withErrorHandling } from '@/lib/utils';
import { ApiErrorCode } from 'shared';
import { verifyJWTFromRequest } from '@/lib/jwt-auth';

// 获取用户信息
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const authHeader = request.headers.get('authorization');

  let verifiedUserId = userId;

  // 如果提供了Bearer token，验证并提取用户ID
  if (authHeader) {
    const payload = verifyJWTFromRequest(request);
    if (!payload) {
      return createErrorResponse(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid or expired token',
        401
      );
    }
    verifiedUserId = payload.userId;
  }

  if (!verifiedUserId) {
    return createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'User ID or authorization token is required',
      400
    );
  }

  const db = getDb();

  try {
    // 获取用户信息
    const userData = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        nickname: users.nickname,
        userType: users.userType,
        province: users.province,
        membershipEndDate: users.membershipEndDate,
        trialEndDate: users.trialEndDate,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(eq(users.id, verifiedUserId))
      .limit(1);

    const user = userData[0];

    if (!user) {
      return createErrorResponse(
        ApiErrorCode.USER_NOT_FOUND,
        'User not found',
        404
      );
    }

    // 检查会员状态
    const now = new Date();
    let actualUserType = user.userType;

    if (user.membershipEndDate && user.membershipEndDate > now) {
      actualUserType = 'MEMBER';
    } else if (user.trialEndDate && user.trialEndDate > now) {
      actualUserType = 'TRIAL';
    } else {
      actualUserType = 'FREE';
    }

    // 计算剩余天数
    const membershipDaysLeft = user.membershipEndDate 
      ? Math.max(0, Math.ceil((user.membershipEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const trialDaysLeft = user.trialEndDate 
      ? Math.max(0, Math.ceil((user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        userType: actualUserType,
        province: user.province,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        
        // 会员信息
        membership: {
          type: actualUserType,
          isMember: actualUserType === 'MEMBER',
          isTrial: actualUserType === 'TRIAL',
          isFree: actualUserType === 'FREE',
          membershipEndDate: user.membershipEndDate,
          trialEndDate: user.trialEndDate,
          membershipDaysLeft,
          trialDaysLeft,
        },
        
        // 权限信息
        permissions: {
          canAccessPremium: actualUserType === 'MEMBER',
          canAccessTrial: ['TRIAL', 'MEMBER'].includes(actualUserType),
          canAccessAllChapters: actualUserType === 'MEMBER',
          canTakeSimulationExams: ['TRIAL', 'MEMBER'].includes(actualUserType),
        }
      }
    });

  } catch (error) {
    console.error('Mobile user API error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to fetch user information',
      500
    );
  }
});

// 更新用户信息
export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, nickname, province } = body;

    if (!userId) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'User ID is required',
        400
      );
    }

    const db = getDb();

    // 构建更新数据
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (nickname !== undefined) updateData.nickname = nickname;
    if (province !== undefined) updateData.province = province as 'AB' | 'BC' | 'ON';

    // 更新用户信息
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        phone: users.phone,
        nickname: users.nickname,
        userType: users.userType,
        province: users.province,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser.length) {
      return createErrorResponse(
        ApiErrorCode.USER_NOT_FOUND,
        'User not found',
        404
      );
    }

    return createSuccessResponse({
      message: 'User information updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Mobile user update error:', error);
    return createErrorResponse(
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      'Failed to update user information',
      500
    );
  }
});