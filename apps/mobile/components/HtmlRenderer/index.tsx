import React from 'react';
import { Text, View } from 'react-native';

interface HtmlRendererProps {
  html: string;
  style?: any;
}

export default function HtmlRenderer({ html, style }: HtmlRendererProps) {
  // 简单的HTML标签处理
  const processHtml = (htmlString: string) => {
    // 移除HTML标签，保留纯文本
    const plainText = htmlString
      .replace(/<[^>]*>/g, '') // 移除所有HTML标签
      .replace(/&nbsp;/g, ' ') // 替换HTML实体
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return plainText;
  };

  return (
    <Text style={style} className="text-gray-700 leading-5">
      {processHtml(html)}
    </Text>
  );
} 