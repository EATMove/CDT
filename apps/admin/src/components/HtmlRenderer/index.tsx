'use client';

import React from 'react';

interface HtmlRendererProps {
  html: string;
  baseUrl?: string;
  width?: number;
}

export default function HtmlRenderer({ html, baseUrl, width = 800 }: HtmlRendererProps) {
  // 处理图片URL，添加baseUrl前缀
  const processHtml = (htmlContent: string): string => {
    if (!baseUrl) return htmlContent;
    
    // 替换相对路径的图片为绝对路径
    return htmlContent.replace(
      /src="([^"]*\.(jpg|jpeg|png|gif|webp))"/gi,
      (match, src) => {
        if (src.startsWith('http')) {
          return match; // 已经是绝对路径
        }
        // 添加baseUrl前缀
        const absoluteUrl = src.startsWith('/') 
          ? `${baseUrl}${src}` 
          : `${baseUrl}/${src}`;
        return `src="${absoluteUrl}"`;
      }
    );
  };

  const processedHtml = processHtml(html);

  // 内联样式
  const containerStyle = {
    width: '100%',
    maxWidth: width,
    margin: '0 auto',
    fontSize: '16px',
    lineHeight: '24px',
    color: '#374151',
  };

  return (
    <div 
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      className="html-content"
    />
  );
}
