import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// 暂时使用内存存储，后续连接数据库
const contentStorage = new Map();

interface ContentData {
  chapterId: string;
  sectionId?: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  isPublished: boolean;
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
}

export async function POST(request: NextRequest) {
  try {
    const data: ContentData = await request.json();

    // 验证必填字段
    if (!data.title || !data.content || !data.chapterId) {
      return NextResponse.json(
        { error: '请填写标题、内容和章节ID' },
        { status: 400 }
      );
    }

    // 验证HTML内容（基本检查）
    if (data.content.length < 10) {
      return NextResponse.json(
        { error: '内容太短，请输入更多内容' },
        { status: 400 }
      );
    }

    // 生成内容ID
    const contentId = nanoid();
    
    // 创建内容记录
    const contentRecord = {
      id: contentId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin', // TODO: 从认证系统获取用户ID
    };

    // 保存到内存（暂时）
    contentStorage.set(contentId, contentRecord);

    console.log('内容已保存:', {
      id: contentId,
      title: data.title,
      chapterId: data.chapterId,
      isPublished: data.isPublished,
    });

    return NextResponse.json({
      success: true,
      id: contentId,
      message: '内容保存成功',
    });

  } catch (error) {
    console.error('内容保存失败:', error);
    return NextResponse.json(
      { error: '内容保存失败，请重试' },
      { status: 500 }
    );
  }
}

// 获取所有内容列表
export async function GET() {
  try {
    const contents = Array.from(contentStorage.values());
    return NextResponse.json({
      success: true,
      data: contents,
      total: contents.length,
    });
  } catch (error) {
    console.error('获取内容列表失败:', error);
    return NextResponse.json(
      { error: '获取内容列表失败' },
      { status: 500 }
    );
  }
} 