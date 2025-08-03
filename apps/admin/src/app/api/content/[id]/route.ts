import { NextRequest, NextResponse } from 'next/server';

// 暂时使用内存存储（与保存API共享）
// 在实际项目中，这里会从数据库查询
const getContentStorage = () => {
  // 这里应该从外部获取storage，暂时返回空Map
  return new Map();
};

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少内容ID' },
        { status: 400 }
      );
    }

    // 从存储中获取内容
    const contentStorage = getContentStorage();
    const content = contentStorage.get(id);

    if (!content) {
      return NextResponse.json(
        { error: '内容不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content,
    });

  } catch (error) {
    console.error('获取内容失败:', error);
    return NextResponse.json(
      { error: '获取内容失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '缺少内容ID' },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!data.title || !data.content || !data.chapterId) {
      return NextResponse.json(
        { error: '请填写标题、内容和章节ID' },
        { status: 400 }
      );
    }

    const contentStorage = getContentStorage();
    const existingContent = contentStorage.get(id);

    if (!existingContent) {
      return NextResponse.json(
        { error: '内容不存在' },
        { status: 404 }
      );
    }

    // 更新内容
    const updatedContent = {
      ...existingContent,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    contentStorage.set(id, updatedContent);

    console.log('内容已更新:', {
      id,
      title: data.title,
      chapterId: data.chapterId,
    });

    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: '内容更新成功',
    });

  } catch (error) {
    console.error('更新内容失败:', error);
    return NextResponse.json(
      { error: '更新内容失败，请重试' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少内容ID' },
        { status: 400 }
      );
    }

    const contentStorage = getContentStorage();
    const content = contentStorage.get(id);

    if (!content) {
      return NextResponse.json(
        { error: '内容不存在' },
        { status: 404 }
      );
    }

    // 删除内容
    contentStorage.delete(id);

    console.log('内容已删除:', { id });

    return NextResponse.json({
      success: true,
      message: '内容删除成功',
    });

  } catch (error) {
    console.error('删除内容失败:', error);
    return NextResponse.json(
      { error: '删除内容失败，请重试' },
      { status: 500 }
    );
  }
} 