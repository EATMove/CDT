import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    await clearAdminSession();
    
    return NextResponse.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
      },
    }, { status: 500 });
  }
} 