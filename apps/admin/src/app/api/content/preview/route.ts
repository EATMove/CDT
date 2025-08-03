import { NextRequest, NextResponse } from 'next/server';

interface PreviewRequest {
  content: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  theme?: 'light' | 'dark';
}

export async function POST(request: NextRequest) {
  try {
    const { content, device = 'mobile', theme = 'light' }: PreviewRequest = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Preview content cannot be empty' },
        { status: 400 }
      );
    }

    // 基本的HTML安全检查
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /onload=/gi,
      /onclick=/gi,
      /onerror=/gi,
    ];

    let sanitizedContent = content;
    dangerousPatterns.forEach(pattern => {
      sanitizedContent = sanitizedContent.replace(pattern, '');
    });

    // Generate device-specific CSS
    const deviceStyles = {
      mobile: {
        maxWidth: '375px',
        fontSize: '14px',
        padding: '12px',
      },
      tablet: {
        maxWidth: '768px',
        fontSize: '16px',
        padding: '16px',
      },
      desktop: {
        maxWidth: '100%',
        fontSize: '16px',
        padding: '20px',
      },
    };

    const themeStyles = {
      light: {
        backgroundColor: '#ffffff',
        color: '#000000',
        borderColor: '#e5e7eb',
      },
      dark: {
        backgroundColor: '#000000',
        color: '#ffffff',
        borderColor: '#374151',
      },
    };

    const currentDeviceStyle = deviceStyles[device];
    const currentThemeStyle = themeStyles[theme];

    // Generate preview HTML
    const previewHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>内容预览</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background-color: ${currentThemeStyle.backgroundColor};
      color: ${currentThemeStyle.color};
      line-height: 1.6;
      max-width: ${currentDeviceStyle.maxWidth};
      margin: 0 auto;
      padding: ${currentDeviceStyle.padding};
      font-size: ${currentDeviceStyle.fontSize};
    }
    
    /* Ensure images are responsive */
    img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 8px;
      margin: 8px 0;
    }
    
    /* Title styles */
    h1, h2, h3, h4, h5, h6 {
      margin: 16px 0 8px 0;
      font-weight: bold;
      line-height: 1.3;
    }
    
    h1 { font-size: 1.8em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; }
    
    /* Paragraph styles */
    p {
      margin: 0 0 12px 0;
    }
    
    /* List styles */
    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    li {
      margin: 4px 0;
    }
    
    /* Link styles */
    a {
      color: ${theme === 'dark' ? '#60A5FA' : '#2563EB'};
      text-decoration: underline;
    }
    
    /* Code styles */
    code {
      background-color: ${theme === 'dark' ? '#374151' : '#F3F4F6'};
      color: ${theme === 'dark' ? '#F9FAFB' : '#1F2937'};
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    /* Table styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border: 1px solid ${currentThemeStyle.borderColor};
      border-radius: 8px;
      overflow: hidden;
    }
    
    th, td {
      padding: 8px 12px;
      border-bottom: 1px solid ${currentThemeStyle.borderColor};
      text-align: left;
    }
    
    th {
      background-color: ${theme === 'dark' ? '#374151' : '#F9FAFB'};
      font-weight: bold;
    }
    
    /* 引用样式 */
    blockquote {
      border-left: 4px solid ${theme === 'dark' ? '#4F46E5' : '#6366F1'};
      padding-left: 16px;
      margin: 12px 0;
      background-color: ${theme === 'dark' ? '#1F2937' : '#F9FAFB'};
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      body {
        padding: 12px;
        font-size: 14px;
      }
      
      h1 { font-size: 1.6em; }
      h2 { font-size: 1.4em; }
      h3 { font-size: 1.2em; }
      
      table {
        font-size: 0.9em;
      }
      
      th, td {
        padding: 6px 8px;
      }
    }
  </style>
</head>
<body>
  ${sanitizedContent}
</body>
</html>`;

    return NextResponse.json({
      success: true,
      html: previewHtml,
      device,
      theme,
    });

  } catch (error) {
    console.error('Failed to generate preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview, please check the HTML format' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate preview.' },
    { status: 405 }
  );
} 