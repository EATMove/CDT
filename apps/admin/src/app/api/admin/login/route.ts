import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin, createAdminSession, isAdminLoggedIn } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经登录
    if (await isAdminLoggedIn(request)) {
      return NextResponse.json({
        success: true,
        message: '已经登录',
      });
    }

    const { username, password } = await request.json();

    // 验证用户名和密码
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '用户名和密码不能为空',
        },
      }, { status: 400 });
    }

    const isValid = await loginAdmin(username, password);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误',
        },
      }, { status: 401 });
    }

    // 创建session
    await createAdminSession(username);

    return NextResponse.json({
      success: true,
      message: '登录成功',
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
      },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const isLoggedIn = await isAdminLoggedIn(request);
    
    return NextResponse.json({
      success: true,
      isLoggedIn,
    });
  } catch (error) {
    console.error('检查登录状态错误:', error);
    return NextResponse.json({
      success: false,
      isLoggedIn: false,
    });
  }
} 