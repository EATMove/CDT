import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

// 暂时的内容存储（模拟数据库）
const getMockContent = (id: string) => {
  // 模拟数据
  const mockContents = {
    'demo-001': {
      id: 'demo-001',
      title: '交通信号灯规则',
      content: `
<div style="padding: 20px; font-family: -apple-system, sans-serif; line-height: 1.6;">
  <h2 style="color: #2c3e50; margin-bottom: 20px;">交通信号灯基本规则</h2>
  
  <p style="margin-bottom: 16px; color: #555;">
    在加拿大，交通信号灯是道路安全的重要组成部分。正确理解和遵守信号灯规则是每个驾驶者的基本责任。
  </p>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #333; margin-bottom: 16px; text-align: center;">🚦 三色信号灯</h3>
    
    <div style="background: #ffebee; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #d32f2f;">
      <strong style="color: #d32f2f;">🔴 红灯：</strong> 
      <p style="margin: 4px 0;">必须完全停止，不得通过路口。右转需要等待绿灯，除非有专门的右转指示灯。</p>
    </div>
    
    <div style="background: #fff8e1; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #f57c00;">
      <strong style="color: #f57c00;">🟡 黄灯：</strong>
      <p style="margin: 4px 0;">准备停车。如果已经进入路口或者距离太近无法安全停车，可以继续通过。</p>
    </div>
    
    <div style="background: #e8f5e8; padding: 12px; border-radius: 6px; border-left: 4px solid #388e3c;">
      <strong style="color: #388e3c;">🟢 绿灯：</strong>
      <p style="margin: 4px 0;">可以安全通过路口，但仍需注意观察其他车辆和行人。</p>
    </div>
  </div>
  
  <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2196f3;">
    <h3 style="color: #1976d2; margin-bottom: 8px;">💡 重要提示</h3>
    <ul style="margin: 0; padding-left: 20px; color: #424242;">
      <li>始终保持警觉，注意其他道路使用者</li>
      <li>在恶劣天气条件下，给自己更多时间停车</li>
      <li>遇到信号灯故障时，将路口视为四向停车标志</li>
    </ul>
  </div>
</div>`,
      chapterId: 'ch-001',
      paymentType: 'FREE',
      isPublished: true,
    }
  };
  
  return mockContents[id as keyof typeof mockContents];
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const device = searchParams.get('device') || 'mobile';
    const theme = searchParams.get('theme') || 'light';
    const lang = searchParams.get('lang') || 'zh';

    if (!id) {
      return NextResponse.json(
        { error: '缺少内容ID' },
        { status: 400 }
      );
    }

    // 从存储中获取内容（模拟）
    const content = getMockContent(id);

    if (!content) {
      return NextResponse.json(
        { error: '内容不存在' },
        { status: 404 }
      );
    }

    // 检查付费权限（简化版本）
    const userType = searchParams.get('userType') || 'FREE';
    if (content.paymentType === 'MEMBER_ONLY' && userType === 'FREE') {
      return NextResponse.json(
        { error: '此内容需要会员权限' },
        { status: 403 }
      );
    }

    // 生成移动端适配的完整HTML
    const mobileHtml = generateMobileHtml(content.content, {
      device: device as 'mobile' | 'tablet' | 'desktop',
      theme: theme as 'light' | 'dark',
      lang: lang as 'zh' | 'en',
      title: content.title,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: content.id,
        title: content.title,
        content: content.content,
        html: mobileHtml,
        chapterId: content.chapterId,
        paymentType: content.paymentType,
      },
    });

  } catch (error) {
    console.error('获取移动端内容失败:', error);
    return NextResponse.json(
      { error: '获取内容失败' },
      { status: 500 }
    );
  }
}

function generateMobileHtml(
  content: string,
  options: {
    device: 'mobile' | 'tablet' | 'desktop';
    theme: 'light' | 'dark';
    lang: 'zh' | 'en';
    title: string;
  }
) {
  const { device, theme, lang, title } = options;
  
  const deviceConfig = {
    mobile: { maxWidth: '100%', fontSize: '16px', padding: '16px' },
    tablet: { maxWidth: '100%', fontSize: '18px', padding: '24px' },
    desktop: { maxWidth: '800px', fontSize: '18px', padding: '32px' },
  };

  const themeConfig = {
    light: {
      bg: '#ffffff',
      text: '#000000',
      border: '#e5e7eb',
      secondary: '#6b7280',
    },
    dark: {
      bg: '#000000',
      text: '#ffffff',
      border: '#374151',
      secondary: '#9ca3af',
    },
  };

  const config = deviceConfig[device];
  const colors = themeConfig[theme];

  return `<!DOCTYPE html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background-color: ${colors.bg};
      color: ${colors.text};
      line-height: 1.6;
      font-size: ${config.fontSize};
      max-width: ${config.maxWidth};
      margin: 0 auto;
      padding: ${config.padding};
      word-wrap: break-word;
      overflow-wrap: break-word;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* 图片优化 */
    img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 8px;
      margin: 16px 0;
      display: block;
    }
    
    /* 标题样式 */
    h1, h2, h3, h4, h5, h6 {
      margin: 24px 0 16px 0;
      font-weight: bold;
      line-height: 1.3;
    }
    
    h1 { font-size: 1.8em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; }
    
    /* 段落和间距 */
    p {
      margin: 0 0 16px 0;
      line-height: 1.7;
    }
    
    /* 列表样式 */
    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
    
    /* 链接样式 */
    a {
      color: ${theme === 'dark' ? '#60A5FA' : '#2563EB'};
      text-decoration: underline;
      word-break: break-all;
    }
    
    /* 强调文本 */
    strong, b {
      font-weight: bold;
    }
    
    em, i {
      font-style: italic;
    }
    
    /* 代码样式 */
    code {
      background-color: ${theme === 'dark' ? '#374151' : '#F3F4F6'};
      color: ${theme === 'dark' ? '#F9FAFB' : '#1F2937'};
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background-color: ${theme === 'dark' ? '#1F2937' : '#F8F9FA'};
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
      overflow-x: auto;
      font-size: 0.9em;
    }
    
    /* 表格样式 */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      border: 1px solid ${colors.border};
      border-radius: 8px;
      overflow: hidden;
    }
    
    th, td {
      padding: 12px 16px;
      border-bottom: 1px solid ${colors.border};
      text-align: left;
    }
    
    th {
      background-color: ${theme === 'dark' ? '#374151' : '#F9FAFB'};
      font-weight: bold;
    }
    
    /* 引用样式 */
    blockquote {
      border-left: 4px solid ${theme === 'dark' ? '#4F46E5' : '#6366F1'};
      padding: 16px;
      margin: 16px 0;
      background-color: ${theme === 'dark' ? '#1F2937' : '#F9FAFB'};
      border-radius: 0 8px 8px 0;
    }
    
    /* 分割线 */
    hr {
      border: none;
      height: 1px;
      background-color: ${colors.border};
      margin: 24px 0;
    }
    
    /* 防止文本选择时的蓝色高亮（可选） */
    ::selection {
      background-color: ${theme === 'dark' ? '#4F46E5' : '#93C5FD'};
      color: ${theme === 'dark' ? '#FFFFFF' : '#000000'};
    }
    
    /* 移动端特殊优化 */
    @media (max-width: 768px) {
      body {
        padding: 12px;
        font-size: 16px;
      }
      
      h1 { font-size: 1.6em; }
      h2 { font-size: 1.4em; }
      h3 { font-size: 1.2em; }
      
      table {
        font-size: 0.9em;
      }
      
      th, td {
        padding: 8px 12px;
      }
      
      pre {
        padding: 12px;
        font-size: 0.8em;
      }
    }
  </style>
</head>
<body>
  ${content}
  
  <script>
    // 防止页面缩放
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });
    
    // 阻止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // 图片点击事件（可以添加图片查看功能）
    document.addEventListener('click', function(e) {
      if (e.target.tagName === 'IMG') {
        // 这里可以添加图片预览功能
        console.log('Image clicked:', e.target.src);
      }
    });
    
    // 通知React Native WebView内容已加载
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'contentLoaded',
        height: document.body.scrollHeight
      }));
    }
  </script>
</body>
</html>`;
} 