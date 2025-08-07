// 统一的预览样式系统
export const PREVIEW_STYLES = `
  /* 基础样式重置 */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
    line-height: 1.6;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #374151;
    background-color: #ffffff;
    min-height: 100vh;
    padding: 1rem;
  }
  
  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 0.5em;
    color: #111827;
  }
  
  h1 { font-size: 1.875rem; margin-top: 1.5rem; }
  h2 { font-size: 1.5rem; margin-top: 1.25rem; }
  h3 { font-size: 1.25rem; margin-top: 1rem; }
  h4 { font-size: 1.125rem; margin-top: 0.75rem; }
  h5 { font-size: 1rem; margin-top: 0.5rem; }
  h6 { font-size: 0.875rem; margin-top: 0.5rem; }
  
  /* 段落样式 */
  p {
    margin-bottom: 1rem;
    line-height: 1.7;
  }
  
  /* 链接样式 */
  a {
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  a:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
  
  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
    display: block;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }
  
  /* 列表样式 */
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
    list-style-position: outside;
  }
  
  ul {
    list-style-type: disc;
  }
  
  ol {
    list-style-type: decimal;
  }
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    display: list-item;
  }
  
  ul li {
    list-style-type: disc;
  }
  
  ol li {
    list-style-type: decimal;
  }
  
  /* 嵌套列表 */
  ul ul, ol ol, ul ol, ol ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  ul ul li {
    list-style-type: circle;
  }
  
  ol ol li {
    list-style-type: lower-alpha;
  }
  
  /* 表格样式 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.875rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  
  tr:hover {
    background-color: #f9fafb;
  }
  
  /* 引用样式 */
  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 1rem 0;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
    color: #64748b;
  }
  
  /* 代码样式 */
  code {
    background-color: #f1f5f9;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875em;
    color: #dc2626;
  }
  
  pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }
  
  /* 分割线 */
  hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 2rem 0;
  }
  
  /* 强调文本 */
  strong, b {
    font-weight: 600;
    color: #111827;
  }
  
  em, i {
    font-style: italic;
  }
  
  /* 删除线和下划线 */
  del, s {
    text-decoration: line-through;
    color: #6b7280;
  }
  
  u {
    text-decoration: underline;
  }
  
  /* 小字体和大字体 */
  small {
    font-size: 0.875em;
    color: #6b7280;
  }
  
  /* 上标和下标 */
  sup {
    vertical-align: super;
    font-size: 0.75em;
  }
  
  sub {
    vertical-align: sub;
    font-size: 0.75em;
  }
  
  /* 标记文本 */
  mark {
    background-color: #fef3c7;
    color: #92400e;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }
  
  /* 定义列表 */
  dl {
    margin: 1rem 0;
  }
  
  dt {
    font-weight: 600;
    color: #111827;
    margin-top: 1rem;
  }
  
  dd {
    margin-left: 1rem;
    margin-bottom: 0.5rem;
    color: #374151;
  }
  
  /* 地址 */
  address {
    font-style: italic;
    color: #6b7280;
    margin: 1rem 0;
  }
  
  /* 引用 */
  cite {
    font-style: italic;
    color: #6b7280;
  }
  
  /* 代码块内的代码 */
  code {
    background-color: #f1f5f9;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875em;
    color: #dc2626;
  }
  
  /* 键盘输入 */
  kbd {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875em;
    color: #374151;
  }
  
  /* 变量 */
  var {
    font-style: italic;
    color: #dc2626;
  }
  
  /* 样本输出 */
  samp {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    color: #374151;
  }
  
  /* 时间 */
  time {
    color: #6b7280;
    font-size: 0.875em;
  }
  
  /* 数据 */
  data {
    color: #6b7280;
  }
  
  /* 输出 */
  output {
    font-weight: 600;
    color: #059669;
  }
  
  /* 进度条 */
  progress {
    width: 100%;
    height: 0.5rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6;
    border: none;
  }
  
  progress::-webkit-progress-bar {
    background-color: #f3f4f6;
    border-radius: 0.25rem;
  }
  
  progress::-webkit-progress-value {
    background-color: #3b82f6;
    border-radius: 0.25rem;
  }
  
  progress::-moz-progress-bar {
    background-color: #3b82f6;
    border-radius: 0.25rem;
  }
  
  /* 计量器 */
  meter {
    width: 100%;
    height: 0.5rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6;
    border: none;
  }
  
  meter::-webkit-meter-bar {
    background-color: #f3f4f6;
    border-radius: 0.25rem;
  }
  
  meter::-webkit-meter-optimum-value {
    background-color: #059669;
    border-radius: 0.25rem;
  }
  
  meter::-webkit-meter-suboptimum-value {
    background-color: #d97706;
    border-radius: 0.25rem;
  }
  
  meter::-webkit-meter-even-less-good-value {
    background-color: #dc2626;
    border-radius: 0.25rem;
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    body {
      padding: 0.75rem;
      font-size: 0.875rem;
    }
    
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.125rem; }
    
    table {
      font-size: 0.75rem;
    }
    
    th, td {
      padding: 0.5rem;
    }
    
    blockquote {
      padding: 0.75rem;
      margin: 0.75rem 0;
    }
    
    pre {
      padding: 0.75rem;
      font-size: 0.75rem;
    }
  }
  
  /* 暗色模式支持 */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #1f2937;
      color: #f9fafb;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #f9fafb;
    }
    
    th {
      background-color: #374151;
      color: #f9fafb;
    }
    
    tr:hover {
      background-color: #374151;
    }
    
    blockquote {
      background-color: #374151;
      color: #d1d5db;
    }
    
    code {
      background-color: #374151;
      color: #fca5a5;
    }
    
    pre {
      background-color: #111827;
      color: #e5e7eb;
    }
  }
  
  /* 打印样式 */
  @media print {
    body {
      background-color: white !important;
      color: black !important;
    }
    
    img {
      max-width: 100% !important;
      page-break-inside: avoid;
    }
    
    table {
      page-break-inside: avoid;
    }
  }
`;

// 生成预览HTML
export function generatePreviewHTML(content: string, device: 'mobile' | 'tablet' | 'desktop' = 'desktop') {
  const sanitizedContent = content.replace(/\sfor=/g, ' htmlFor=');
  
  // 设备特定的样式
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

  const currentDeviceStyle = deviceStyles[device];
  
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>内容预览</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        ${PREVIEW_STYLES}
        
        /* 设备特定样式 */
        body {
          max-width: ${currentDeviceStyle.maxWidth};
          margin: 0 auto;
          padding: ${currentDeviceStyle.padding};
          font-size: ${currentDeviceStyle.fontSize};
          min-height: 100vh;
        }
        
        .content-wrapper {
          min-height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="content-wrapper">
        ${sanitizedContent || '<p class="text-gray-500 text-center py-8">暂无内容</p>'}
      </div>
      
      <script>
        // 动态调整iframe高度
        if (window.parent && window.parent !== window) {
          const resizeObserver = new ResizeObserver(() => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({
              type: 'resize',
              height: height
            }, '*');
          });
          
          resizeObserver.observe(document.body);
          
          // 初始调整
          setTimeout(() => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({
              type: 'resize',
              height: height
            }, '*');
          }, 100);
        }
      </script>
    </body>
    </html>
  `;
}

// 生成简单的预览HTML（用于dangerouslySetInnerHTML）
export function generateSimplePreviewHTML(content: string) {
  const sanitizedContent = content.replace(/\sfor=/g, ' htmlFor=');
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #374151;">
      ${sanitizedContent || '<p style="text-align: center; color: #9ca3af; padding: 2rem;">暂无内容</p>'}
    </div>
  `;
}
