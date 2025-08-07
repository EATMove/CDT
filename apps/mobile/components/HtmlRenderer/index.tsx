import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import RenderHtml, { HTMLSource } from 'react-native-render-html';

interface HtmlRendererProps {
  html: string;
  baseUrl?: string;
}

const { width } = Dimensions.get('window');

export default function HtmlRenderer({ html, baseUrl }: HtmlRendererProps) {
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
  const source: HTMLSource = { html: processedHtml };

  // 自定义渲染器配置
  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };

  // 自定义样式
  const baseStyle = {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  };

  const tagsStyles = {
    body: baseStyle,
    p: {
      ...baseStyle,
      marginBottom: 12,
    },
    h1: {
      ...baseStyle,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      marginTop: 20,
      color: '#111827',
    },
    h2: {
      ...baseStyle,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 14,
      marginTop: 18,
      color: '#111827',
    },
    h3: {
      ...baseStyle,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      marginTop: 16,
      color: '#111827',
    },
    h4: {
      ...baseStyle,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 14,
      color: '#111827',
    },
    ul: {
      marginBottom: 12,
      paddingLeft: 20,
    },
    ol: {
      marginBottom: 12,
      paddingLeft: 20,
    },
    li: {
      ...baseStyle,
      marginBottom: 4,
    },
    img: {
      marginVertical: 8,
      borderRadius: 8,
    },
    a: {
      color: '#3b82f6',
      textDecorationLine: 'underline',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    code: {
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#dc2626',
    },
    pre: {
      backgroundColor: '#1f2937',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
      paddingLeft: 12,
      marginVertical: 8,
      backgroundColor: '#f8fafc',
      paddingVertical: 8,
      paddingRight: 8,
      fontStyle: 'italic',
      color: '#64748b',
    },
    table: {
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 8,
      marginVertical: 8,
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: 8,
      fontWeight: 'bold',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    td: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <RenderHtml
        contentWidth={width - 32} // 减去左右边距
        source={source}
        tagsStyles={tagsStyles}
        renderersProps={renderersProps}
        enableExperimentalMarginCollapsing={true}
        enableExperimentalRtl={false}
        enableExperimentalPercentWidth={true}
      />
    </View>
  );
}
