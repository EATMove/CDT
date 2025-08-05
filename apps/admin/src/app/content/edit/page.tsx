'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, Eye, Save, Image as ImageIcon, Smartphone, Tablet, Monitor, Copy, Code2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import ImageSelector from '@/components/ImageSelector';

// 动态导入Monaco Editor
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">加载编辑器中...</div>,
  ssr: false
});

// 类型定义
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

interface ImageUploadResult {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export default function ContentEditPage() {
  const [formData, setFormData] = useState<Partial<ContentData>>({
    title: '',
    content: `<div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px;">章节标题</h2>
  
  <p style="margin-bottom: 16px; color: #555;">
    请在这里编写内容...
  </p>
  
  <!-- 示例样式块 -->
  <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #007bff;">
    <h3 style="color: #007bff; margin-bottom: 8px; font-size: 18px;">💡 重要提示</h3>
    <p style="margin: 0; color: #666;">这里是重要提示内容</p>
  </div>
  
  <!-- 图片示例 -->
  <!-- <img src="图片URL" alt="图片描述" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" /> -->
</div>`,
    paymentType: 'FREE',
    isPublished: false,
  });
  
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const handleInputChange = (field: keyof ContentData, value: any) => {
    setFormData((prev: Partial<ContentData>) => ({ ...prev, [field]: value }));
  };

  // Monaco编辑器配置
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    wordWrap: 'on' as const,
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    snippetSuggestions: 'inline' as const,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection' as const,
    bracketPairColorization: { enabled: true },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    }
  };

  // 处理编辑器内容变化
  const handleEditorChange = useCallback((value: string | undefined) => {
    handleInputChange('content', value || '');
  }, []);

  // 格式化HTML代码
  const formatCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast.success('代码已格式化');
    }
  }, []);

  // 图片上传处理
  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('不支持的文件格式，请上传 JPG、PNG、WebP 或 GIF 图片');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    setUploading(true);
    try {
      // 创建FormData
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('alt', file.name);
      
      // 调用上传API
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const result = await response.json();
      const uploadResult = result.data;
      
      // 在编辑器中插入图片HTML
      if (editorRef.current) {
        const editor = editorRef.current;
        const selection = editor.getSelection();
        const imageHtml = `<img src="${uploadResult.url}" alt="${uploadResult.originalName}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
        
        editor.executeEdits('insert-image', [{
          range: selection,
          text: '\n' + imageHtml + '\n'
        }]);
        
        // 更新formData
        const newContent = editor.getValue();
        handleInputChange('content', newContent);
      }
      
      toast.success('图片上传成功！');
      
    } catch (error) {
      console.error('图片上传失败:', error);
      toast.error(error instanceof Error ? error.message : '图片上传失败，请重试');
    } finally {
      setUploading(false);
      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // 复制HTML样式模板
  const copyTemplate = useCallback((template: string) => {
    navigator.clipboard.writeText(template);
    toast.success('模板已复制到剪贴板');
  }, []);

  // 插入模板到编辑器
  const insertTemplate = useCallback((template: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      
      editor.executeEdits('insert-template', [{
        range: selection,
        text: '\n' + template + '\n'
      }]);
      
      // 更新formData
      const newContent = editor.getValue();
      handleInputChange('content', newContent);
      
      toast.success('模板已插入');
    }
  }, []);

  // 保存内容
  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.content || !formData.chapterId) {
      toast.error('请填写完整信息');
      return;
    }

    setSaving(true);
    try {
      // 调用保存API
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存失败');
      }

      const result = await response.json();
      toast.success(`保存成功！内容ID: ${result.id}`);
      
      // 可以在这里更新URL或重定向
      console.log('保存成功，内容ID:', result.id);
      
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [formData]);

  // HTML样式模板
  const templates = {
    tip: `<div style="background: #e3f2fd; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2196f3;">
  <h3 style="color: #1976d2; margin-bottom: 8px; font-size: 18px;">💡 提示</h3>
  <p style="margin: 0; color: #424242;">这里是提示内容</p>
</div>`,
    warning: `<div style="background: #fff3e0; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ff9800;">
  <h3 style="color: #f57c00; margin-bottom: 8px; font-size: 18px;">⚠️ 注意</h3>
  <p style="margin: 0; color: #424242;">这里是注意事项</p>
</div>`,
    traffic: `<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #333; margin-bottom: 16px; text-align: center;">🚦 交通信号灯</h3>
  <div style="background: #ffebee; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <strong style="color: #d32f2f;">🔴 红灯：</strong> 完全停止
  </div>
  <div style="background: #fff8e1; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
    <strong style="color: #f57c00;">🟡 黄灯：</strong> 准备停车
  </div>
  <div style="background: #e8f5e8; padding: 12px; border-radius: 6px;">
    <strong style="color: #388e3c;">🟢 绿灯：</strong> 安全通过
  </div>
</div>`
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 顶部基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 内容编辑器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="请输入章节标题"
              />
            </div>
            <div>
              <Label htmlFor="chapterId">章节ID *</Label>
              <Input
                id="chapterId"
                value={formData.chapterId || ''}
                onChange={(e) => handleInputChange('chapterId', e.target.value)}
                placeholder="例如：ch-001"
              />
            </div>
            <div>
              <Label htmlFor="paymentType">付费类型</Label>
              <Select 
                value={formData.paymentType || 'FREE'} 
                onValueChange={(value) => handleInputChange('paymentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">🆓 免费</SelectItem>
                  <SelectItem value="TRIAL_INCLUDED">🎯 试用包含</SelectItem>
                  <SelectItem value="MEMBER_ONLY">💎 仅会员</SelectItem>
                  <SelectItem value="PREMIUM">⭐ 高级内容</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished || false}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isPublished">立即发布</Label>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-slate-500">
              💡 提示：Ctrl+S保存，Ctrl+Shift+F格式化代码
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                {saving ? '保存中...' : '保存内容'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

             {/* 左右分栏：编辑器 + 预览 */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 400px)' }}>
         {/* 左侧：代码编辑器 */}
         <Card className="flex flex-col overflow-hidden">
           <CardHeader className="pb-3 flex-shrink-0">
             <div className="flex items-center justify-between">
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Code2 className="w-5 h-5" />
                 HTML编辑器
               </CardTitle>
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={formatCode}>
                   <Palette className="w-4 h-4 mr-1" />
                   格式化
                 </Button>
               </div>
             </div>
           </CardHeader>
           <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
             {/* 工具栏 */}
             <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-slate-50 flex-shrink-0">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={handleImageUpload}
                 disabled={uploading}
               >
                 <ImageIcon className="w-4 h-4 mr-1" />
                 {uploading ? '上传中...' : '上传图片'}
               </Button>
               
               <ImageSelector
                 onImageSelect={(image) => {
                   if (editorRef.current) {
                     const editor = editorRef.current;
                     const selection = editor.getSelection();
                     const imageHtml = `<img src="${image.fileUrl}" alt="${image.altText || image.originalName}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
                     
                     editor.executeEdits('insert-image', [{
                       range: selection,
                       text: '\n' + imageHtml + '\n'
                     }]);
                     
                     // 更新formData
                     const newContent = editor.getValue();
                     handleInputChange('content', newContent);
                     
                     toast.success('图片已插入到编辑器');
                   }
                 }}
                 trigger={
                   <Button variant="outline" size="sm">
                     <Eye className="w-4 h-4 mr-1" />
                     选择图片
                   </Button>
                 }
               />
               
               <Separator orientation="vertical" className="h-6" />
               
               <div className="flex items-center gap-1">
                 <span className="text-sm text-slate-600">快速插入：</span>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => insertTemplate(templates.tip)}
                 >
                   <Copy className="w-3 h-3 mr-1" />
                   提示框
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => insertTemplate(templates.warning)}
                 >
                   <Copy className="w-3 h-3 mr-1" />
                   警告框
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => insertTemplate(templates.traffic)}
                 >
                   <Copy className="w-3 h-3 mr-1" />
                   交通灯
                 </Button>
               </div>
             </div>

             {/* Monaco编辑器 */}
             <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
               <MonacoEditor
                 height="100%"
                 defaultLanguage="html"
                 value={formData.content}
                 onChange={handleEditorChange}
                 options={editorOptions}
                 onMount={(editor) => {
                   editorRef.current = editor;
                   // 确保编辑器适应容器大小
                   setTimeout(() => {
                     editor.layout();
                   }, 100);
                 }}
                 theme="vs"
               />
             </div>
           </CardContent>
         </Card>

                 {/* 右侧：实时预览 */}
         <Card className="flex flex-col overflow-hidden">
           <CardHeader className="pb-3 flex-shrink-0">
             <div className="flex items-center justify-between">
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Eye className="w-5 h-5" />
                 实时预览
               </CardTitle>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-slate-600">设备：</span>
                 <Button
                   variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setPreviewDevice('mobile')}
                 >
                   <Smartphone className="w-4 h-4" />
                 </Button>
                 <Button
                   variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setPreviewDevice('tablet')}
                 >
                   <Tablet className="w-4 h-4" />
                 </Button>
                 <Button
                   variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setPreviewDevice('desktop')}
                 >
                   <Monitor className="w-4 h-4" />
                 </Button>
               </div>
             </div>
           </CardHeader>
           <CardContent className="flex-1 p-0 overflow-hidden">
             {/* 预览区域 */}
             <div className="h-full border-t bg-white overflow-hidden">
               <div className={`mx-auto h-full overflow-auto ${
                 previewDevice === 'mobile' ? 'max-w-sm' :
                 previewDevice === 'tablet' ? 'max-w-2xl' :
                 'w-full'
               }`}>
                 <div className="bg-slate-100 p-2 text-sm text-slate-600 text-center sticky top-0 z-10 flex-shrink-0">
                   📱 {previewDevice} 预览效果
                 </div>
                 <div 
                   className="bg-white overflow-auto p-4"
                   style={{ height: 'calc(100% - 40px)' }}
                   dangerouslySetInnerHTML={{ 
                     __html: formData.content || '<p style="padding: 20px; color: #999; text-align: center;">暂无内容</p>' 
                   }}
                 />
               </div>
             </div>
           </CardContent>
         </Card>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
} 