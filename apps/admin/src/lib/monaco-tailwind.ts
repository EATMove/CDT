// Monaco Editor Tailwind CSS 支持扩展
import * as monaco from 'monaco-editor';

// Tailwind CSS 常用类名
const tailwindClasses = [
  // 布局
  'container', 'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'hidden',
  
  // 定位
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  
  // 显示
  'visible', 'invisible', 'collapse',
  
  // 尺寸
  'w-0', 'w-px', 'w-0.5', 'w-1', 'w-1.5', 'w-2', 'w-2.5', 'w-3', 'w-3.5', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-36', 'w-40', 'w-44', 'w-48', 'w-52', 'w-56', 'w-60', 'w-64', 'w-72', 'w-80', 'w-96', 'w-auto', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-2/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6', 'w-1/12', 'w-2/12', 'w-3/12', 'w-4/12', 'w-5/12', 'w-6/12', 'w-7/12', 'w-8/12', 'w-9/12', 'w-10/12', 'w-11/12', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
  'h-0', 'h-px', 'h-0.5', 'h-1', 'h-1.5', 'h-2', 'h-2.5', 'h-3', 'h-3.5', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-9', 'h-10', 'h-11', 'h-12', 'h-14', 'h-16', 'h-20', 'h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60', 'h-64', 'h-72', 'h-80', 'h-96', 'h-auto', 'h-1/2', 'h-1/3', 'h-2/3', 'h-1/4', 'h-2/4', 'h-3/4', 'h-1/5', 'h-2/5', 'h-3/5', 'h-4/5', 'h-1/6', 'h-2/6', 'h-3/6', 'h-4/6', 'h-5/6', 'h-full', 'h-screen', 'h-min', 'h-max', 'h-fit',
  
  // 间距
  'p-0', 'p-px', 'p-0.5', 'p-1', 'p-1.5', 'p-2', 'p-2.5', 'p-3', 'p-3.5', 'p-4', 'p-5', 'p-6', 'p-7', 'p-8', 'p-9', 'p-10', 'p-11', 'p-12', 'p-14', 'p-16', 'p-20', 'p-24', 'p-28', 'p-32', 'p-36', 'p-40', 'p-44', 'p-48', 'p-52', 'p-56', 'p-60', 'p-64', 'p-72', 'p-80', 'p-96',
  'm-0', 'm-px', 'm-0.5', 'm-1', 'm-1.5', 'm-2', 'm-2.5', 'm-3', 'm-3.5', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-14', 'm-16', 'm-20', 'm-24', 'm-28', 'm-32', 'm-36', 'm-40', 'm-44', 'm-48', 'm-52', 'm-56', 'm-60', 'm-64', 'm-72', 'm-80', 'm-96', 'm-auto',
  
  // 颜色
  'text-black', 'text-white', 'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
  'bg-black', 'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
  'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900',
  'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
  'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900',
  'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900',
  
  // 边框
  'border', 'border-0', 'border-2', 'border-4', 'border-8',
  'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
  'border-red-200', 'border-red-300', 'border-red-400', 'border-red-500',
  'border-blue-200', 'border-blue-300', 'border-blue-400', 'border-blue-500',
  'border-green-200', 'border-green-300', 'border-green-400', 'border-green-500',
  'border-yellow-200', 'border-yellow-300', 'border-yellow-400', 'border-yellow-500',
  'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
  
  // 字体
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
  'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
  
  // 对齐
  'text-left', 'text-center', 'text-right', 'text-justify',
  'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
  'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
  
  // 响应式
  'sm:', 'md:', 'lg:', 'xl:', '2xl:',
  
  // 状态
  'hover:', 'focus:', 'active:', 'disabled:',
  
  // 其他常用
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
  'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',
  'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
];

// 创建Tailwind CSS语言支持
export function setupTailwindSupport() {
  // 注册HTML语言的自定义提供者
  monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const suggestions: monaco.languages.CompletionItem[] = [];

      // 检测是否在class属性中
      const classMatch = textUntilPosition.match(/class=["'][^"']*$/);
      if (classMatch) {
        tailwindClasses.forEach(className => {
          suggestions.push({
            label: className,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: className,
            detail: `Tailwind CSS: ${className}`,
            documentation: `Tailwind CSS utility class: ${className}`,
            sortText: className,
          });
        });
      }

      // 检测是否在style属性中
      const styleMatch = textUntilPosition.match(/style=["'][^"']*$/);
      if (styleMatch) {
        // 添加一些常用的CSS属性
        const cssProperties = [
          'background-color', 'color', 'font-size', 'font-weight', 'padding', 'margin',
          'border', 'border-radius', 'display', 'flex-direction', 'justify-content',
          'align-items', 'width', 'height', 'max-width', 'max-height'
        ];

        cssProperties.forEach(prop => {
          suggestions.push({
            label: prop,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: `${prop}: `,
            detail: `CSS Property: ${prop}`,
            documentation: `CSS property: ${prop}`,
            sortText: prop,
          });
        });
      }

      return {
        suggestions: suggestions
      };
    }
  });

  // 注册CSS语言的自定义提供者
  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [];

      tailwindClasses.forEach(className => {
        suggestions.push({
          label: className,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: className,
          detail: `Tailwind CSS: ${className}`,
          documentation: `Tailwind CSS utility class: ${className}`,
          sortText: className,
        });
      });

      return {
        suggestions: suggestions
      };
    }
  });

  // 添加Tailwind CSS语法高亮
  monaco.languages.setMonarchTokensProvider('html', {
    tokenizer: {
      root: [
        // 匹配Tailwind类名
        [/\b(?:bg|text|border|rounded|p|m|w|h|flex|grid|items|justify|shadow|opacity|overflow|z)-[a-zA-Z0-9-]+/, 'tailwind-class'],
        // 匹配HTML标签
        [/<[^>]+>/, 'html-tag'],
        // 匹配属性
        [/\b(?:class|style|id|src|alt|href)=/, 'html-attribute'],
        // 匹配字符串
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
      ]
    }
  });

  // 定义主题颜色
  monaco.editor.defineTheme('tailwind-theme', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'tailwind-class', foreground: '0066cc', fontStyle: 'bold' },
      { token: 'html-tag', foreground: '0000ff' },
      { token: 'html-attribute', foreground: 'a31515' },
      { token: 'string', foreground: 'a31515' },
    ],
    colors: {}
  });
}

// 创建Tailwind CSS代码片段
export const tailwindSnippets = [
  {
    label: 'tw-container',
    insertText: 'class="container mx-auto px-4"',
    detail: 'Tailwind container with auto margins and padding',
    documentation: 'Creates a responsive container with auto margins and horizontal padding'
  },
  {
    label: 'tw-card',
    insertText: 'class="bg-white border border-gray-200 rounded-lg shadow-sm p-6"',
    detail: 'Tailwind card component',
    documentation: 'Creates a card component with white background, border, rounded corners, and shadow'
  },
  {
    label: 'tw-button',
    insertText: 'class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"',
    detail: 'Tailwind button component',
    documentation: 'Creates a button component with blue background, hover effects, and rounded corners'
  },
  {
    label: 'tw-flex-center',
    insertText: 'class="flex items-center justify-center"',
    detail: 'Tailwind flexbox center alignment',
    documentation: 'Creates a flexbox container that centers content both horizontally and vertically'
  },
  {
    label: 'tw-responsive-grid',
    insertText: 'class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"',
    detail: 'Tailwind responsive grid',
    documentation: 'Creates a responsive grid that adapts to different screen sizes'
  }
];

// 初始化Tailwind支持
export function initTailwindSupport() {
  setupTailwindSupport();
  
  // 设置主题
  monaco.editor.setTheme('tailwind-theme');
  
  console.log('Tailwind CSS support initialized for Monaco Editor');
}
