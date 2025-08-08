'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, Eye, Save, Copy, Code2, Plus, Edit, TestTube, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ImageSelector from '@/components/ImageSelector';
import ImagePicker from '@/components/ImagePicker';
import ContentPreview from '@/components/ContentPreview';
import { HTML_TEST_CONTENT } from '@/lib/html-test-content';
import NextDynamic from 'next/dynamic';
import Link from 'next/link';

const MonacoEditor = NextDynamic(() => import('@monaco-editor/react'), {
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">加载编辑器中...</div>,
  ssr: false,
});

interface ContentData {
  chapterId: string;
  sectionId?: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  isPublished: boolean;
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
  order?: number;
  estimatedReadTime?: number;
}

export default function ContentEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [isManualEstimated, setIsManualEstimated] = useState(false);
  const [stats, setStats] = useState<{ words: number; minutes: number }>({ words: 0, minutes: 0 });

  const editorRef = useRef<any>(null);

  const handleInputChange = (field: keyof ContentData, value: any) => {
    setFormData((prev: Partial<ContentData>) => ({ ...prev, [field]: value }));
  };

  const loadChapterData = useCallback(async () => {
    const chapterId = searchParams.get('chapterId');
    const sectionId = searchParams.get('sectionId');
    if (!chapterId) {
      toast.error('缺少章节ID参数');
      return;
    }
    setLoading(true);
    try {
      const chapterResponse = await fetch(`/api/chapters/${chapterId}`);
      if (chapterResponse.ok) {
        const chapterResult = await chapterResponse.json();
        if (chapterResult.success) {
          const chapter = chapterResult.data;
          setFormData(prev => ({
            ...prev,
            chapterId: chapter.id,
            title: chapter.title || '',
            titleEn: chapter.titleEn || '',
          }));
        }
      }
      const sectionsResponse = await fetch(`/api/content/save?chapterId=${chapterId}`);
      if (sectionsResponse.ok) {
        const sectionsResult = await sectionsResponse.json();
        if (sectionsResult.success) {
          setSections(sectionsResult.data.data || []);
        }
      }
      if (sectionId) {
        const sectionResponse = await fetch(`/api/chapters/${chapterId}/sections/${sectionId}`);
        if (sectionResponse.ok) {
          const sectionResult = await sectionResponse.json();
          if (sectionResult.success) {
            const section = sectionResult.data;
            setFormData(prev => ({
              ...prev,
              sectionId: section.id,
              title: section.title || '',
              titleEn: section.titleEn || '',
              content: section.content || '',
              contentEn: section.contentEn || '',
              paymentType: section.isFree ? 'FREE' : 'MEMBER_ONLY',
              order: section.order,
              estimatedReadTime: section.estimatedReadTime,
            }));
            const plain = (section.content || '').replace(/<[^>]*>/g, '');
            const words = plain.length;
            const minutes = Math.ceil(words / 200);
            setStats({ words, minutes });
            setIsManualEstimated(Boolean(section.estimatedReadTime));
          }
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    wordWrap: 'on' as const,
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: { other: true, comments: false, strings: true },
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
    },
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on' as const,
    accessibilitySupport: 'auto' as const,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoIndent: 'full' as const,
    codeActionsOnSave: {
      'source.fixAll': 'explicit' as const,
      'source.organizeImports': 'explicit' as const,
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showConstants: true,
      showEnums: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showWords: true,
    },
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      const sanitizedValue = value.replace(/\sfor=/g, ' htmlFor=');
      handleInputChange('content', sanitizedValue);
      const plain = sanitizedValue.replace(/<[^>]*>/g, '');
      const words = plain.length;
      const minutes = Math.ceil(words / 200);
      setStats({ words, minutes });
      if (!isManualEstimated) {
        handleInputChange('estimatedReadTime', minutes);
      }
    } else {
      handleInputChange('content', '');
      setStats({ words: 0, minutes: 0 });
    }
  }, [isManualEstimated]);

  const formatCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast.success('代码已格式化');
    }
  }, []);

  const isValidSectionId = useCallback((id: string, chapterId: string | undefined) => {
    const ok = /^sec-[a-z]{2}-\d{3}-\d{3}$/i.test(id);
    if (!ok || !chapterId) return ok;
    const chapMatch = /^ch-([a-z]{2})-(\d{3})$/i.exec(chapterId);
    const secMatch = /^sec-([a-z]{2})-(\d{3})-(\d{3})$/i.exec(id);
    if (!chapMatch || !secMatch) return ok;
    return chapMatch[1].toLowerCase() === secMatch[1].toLowerCase() && chapMatch[2] === secMatch[2];
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.content || !formData.chapterId) {
      toast.error('请填写完整信息');
      return;
    }
    if (!formData.sectionId) {
      toast.error('请先在下方输入合法的段落ID再保存');
      return;
    }
    if (!isValidSectionId(formData.sectionId, formData.chapterId)) {
      toast.error('段落ID格式或与章节不匹配，应如：sec-ab-001-001');
      return;
    }
    setSaving(true);
    try {
      const method = 'PUT';
      const response = await fetch('/api/content/save', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || '保存失败');
      }
      const result = await response.json();
      toast.success(`保存成功！内容ID: ${result.id}`);
      if (formData.sectionId && typeof window !== 'undefined') {
        const newUrl = `/content/edit?chapterId=${formData.chapterId}&sectionId=${formData.sectionId}`;
        window.history.replaceState({}, '', newUrl);
      }
      loadChapterData();
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [formData, loadChapterData]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      formatCode();
    }
  }, [handleSave, formatCode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 通过 ImageSelector 统一上传/选择并插入，无需本地 file input

  const insertTemplate = useCallback((template: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits('insert-template', [{ range: selection, text: '\n' + template + '\n' }]);
      const newContent = editor.getValue();
      handleInputChange('content', newContent);
      toast.success('模板已插入');
    }
  }, []);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (!confirm('确定要删除这个段落吗？此操作不可撤销。')) {
      return;
    }
    try {
      const response = await fetch(`/api/chapters/${formData.chapterId}/sections/${sectionId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || '删除失败');
      }
      const result = await response.json();
      if (result.success) {
        toast.success('段落删除成功');
        if (formData.sectionId === sectionId) {
          setFormData(prev => ({
            ...prev,
            sectionId: undefined,
            title: '',
            titleEn: '',
            content: `<div class="bg-white p-6 rounded-lg shadow-sm border">\n  <h2 class="text-xl font-semibold text-gray-900 mb-4">新段落标题</h2>\n  <p class="text-gray-600 leading-relaxed">\n    请在这里编写内容...\n  </p>\n</div>`,
            contentEn: '',
            paymentType: 'FREE',
          }));
          const newUrl = `/content/edit?chapterId=${formData.chapterId}`;
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', newUrl);
          }
        }
        loadChapterData();
      }
    } catch (error) {
      console.error('删除段落失败:', error);
      toast.error(error instanceof Error ? error.message : '删除失败，请重试');
    }
  }, [formData.chapterId, formData.sectionId, loadChapterData]);

  const templates = {
    tip: `<div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r-lg">\n  <div class="flex items-start">\n    <div class="flex-shrink-0">\n      <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">\n        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />\n      </svg>\n    </div>\n    <div class="ml-3">\n      <h3 class="text-sm font-medium text-blue-800">💡 提示</h3>\n      <div class="mt-2 text-sm text-blue-700">\n        <p>这里是提示内容</p>\n      </div>\n    </div>\n  </div>\n</div>`,
    warning: `<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 rounded-r-lg">\n  <div class="flex items-start">\n    <div class="flex-shrink-0">\n      <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">\n        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />\n      </svg>\n    </div>\n    <div class="ml-3">\n      <h3 class="text-sm font-medium text-yellow-800">⚠️ 注意</h3>\n      <div class="mt-2 text-sm text-yellow-700">\n        <p>这里是注意事项</p>\n      </div>\n    </div>\n  </div>\n</div>`,
    traffic: `<div class="bg-gray-50 p-6 my-6 rounded-lg border">\n  <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">🚦 交通信号灯</h3>\n  <div class="space-y-3">\n    <div class="bg-red-50 border border-red-200 p-3 rounded-lg">\n      <div class="flex items-center">\n        <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>\n        <strong class="text-red-800">红灯：</strong>\n        <span class="ml-2 text-red-700">完全停止</span>\n      </div>\n    </div>\n    <div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">\n      <div class="flex items-center">\n        <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>\n        <strong class="text-yellow-800">黄灯：</strong>\n        <span class="ml-2 text-yellow-700">准备停车</span>\n      </div>\n    </div>\n    <div class="bg-green-50 border border-green-200 p-3 rounded-lg">\n      <div class="flex items-center">\n        <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>\n        <strong class="text-green-800">绿灯：</strong>\n        <span class="ml-2 text-green-700">安全通过</span>\n      </div>\n    </div>\n  </div>\n</div>`,
    card: `<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 my-4">\n  <h3 class="text-lg font-semibold text-gray-900 mb-2">卡片标题</h3>\n  <p class="text-gray-600">这里是卡片内容</p>\n</div>`,
    button: `<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n  按钮文本\n</button>`,
    table: `<div class="overflow-x-auto my-4">\n  <table class="min-w-full divide-y divide-gray-200">\n    <thead class="bg-gray-50">\n      <tr>\n        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题1</th>\n        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题2</th>\n        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题3</th>\n      </tr>\n    </thead>\n    <tbody class="bg-white divide-y divide-gray-200">\n      <tr>\n        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">内容1</td>\n        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">内容2</td>\n        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">内容3</td>\n      </tr>\n    </tbody>\n  </table>\n</div>`,
  } as const;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            📝 段落编辑器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">段落标题 *</Label>
              <Input id="title" value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="请输入段落标题" />
            </div>
            <div>
              <Label htmlFor="chapterId">所属章节 *</Label>
              <Input id="chapterId" value={formData.chapterId || ''} onChange={(e) => handleInputChange('chapterId', e.target.value)} placeholder="章节ID" disabled />
            </div>
            <div>
              <Label htmlFor="paymentType">付费类型</Label>
              <Select value={formData.paymentType || 'FREE'} onValueChange={(value) => handleInputChange('paymentType', value)}>
                <SelectTrigger id="paymentType">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border">字数：{stats.words} • 预计阅读：{stats.minutes} 分</div>
            <div>
              <Label htmlFor="order">顺序（order）</Label>
              <Input id="order" type="number" value={formData.order ?? ''} onChange={(e) => handleInputChange('order', Number(e.target.value))} placeholder="例如：1、2、3..." />
            </div>
            <div />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">段落列表</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    sectionId: undefined,
                    title: '',
                    titleEn: '',
                    content: `<div class="bg-white p-6 rounded-lg shadow-sm border">\n  <h2 class="text-xl font-semibold text-gray-900 mb-4">新段落标题</h2>\n  <p class="text-gray-600 leading-relaxed">\n    请在这里编写内容...\n  </p>\n</div>`,
                    contentEn: '',
                    paymentType: 'FREE',
                    order: undefined,
                    estimatedReadTime: undefined,
                  }));
                  setIsManualEstimated(false);
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> 新建段落
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sections.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">暂无段落，点击上方"新建段落"开始创建</div>
              ) : (
                sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-slate-50 transition-colors ${formData.sectionId === section.id ? 'bg-blue-50 border-blue-200' : 'border-slate-200'}`}
                    onClick={() => {
                      if (formData.sectionId && formData.sectionId !== section.id) {
                        const hasChanges = formData.title !== section.title || formData.content !== section.content;
                        if (hasChanges && !confirm('当前有未保存的更改，确定要切换段落吗？')) {
                          return;
                        }
                      }
                      setFormData(prev => ({
                        ...prev,
                        sectionId: section.id,
                        title: section.title || '',
                        titleEn: section.titleEn || '',
                        content: section.content || '',
                        contentEn: section.contentEn || '',
                        paymentType: section.isFree ? 'FREE' : 'MEMBER_ONLY',
                        order: section.order,
                        estimatedReadTime: section.estimatedReadTime,
                      }));
                      const plain = (section.content || '').replace(/<[^>]*>/g, '');
                      const words = plain.length;
                      const minutes = Math.ceil(words / 200);
                      setStats({ words, minutes });
                      setIsManualEstimated(Boolean(section.estimatedReadTime));
                      const newUrl = `/content/edit?chapterId=${formData.chapterId}&sectionId=${section.id}`;
                      if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', newUrl);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{section.title || '无标题'}</div>
                        <div className="text-xs text-slate-500">第 {section.order} 段 • {section.wordCount || 0} 字 • {section.estimatedReadTime || 0} 分钟</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs">{section.isFree ? '🆓' : '💎'}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/content/${section.id}`);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sectionId">段落ID（必填，保存前填写）</Label>
              <Input id="sectionId" value={formData.sectionId || ''} onChange={(e) => handleInputChange('sectionId', e.target.value.trim())} placeholder="例如：sec-ab-001-001" />
              {formData.sectionId && !isValidSectionId(formData.sectionId, formData.chapterId) && (
                <div className="text-xs text-red-600 mt-1">格式应为 sec-省份两位-章节三位-段落三位，并与上方章节ID匹配</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedReadTime">预计阅读时间（分钟，可手动调整）</Label>
              <Input
                id="estimatedReadTime"
                type="number"
                value={formData.estimatedReadTime ?? ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIsManualEstimated(Number.isFinite(val));
                  handleInputChange('estimatedReadTime', val);
                }}
                placeholder="例如：5"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" /> 保存段落
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="flex flex-col overflow-hidden xl:col-span-2">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code2 className="w-5 h-5" /> HTML编辑器
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={formatCode}>
                  <Code2 className="w-4 h-4 mr-1" /> 格式化
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <ImagePicker
                  chapterId={formData.chapterId}
                  sectionId={formData.sectionId}
                  onPick={(image) => {
                    if (!editorRef.current) return;
                    const editor = editorRef.current;
                    const selection = editor.getSelection();
                    const imageHtml = `<img src="${image.fileUrl}" alt="${image.altText || image.originalName}" class="max-w-full h-auto rounded-lg my-4" />`;
                    editor.executeEdits('insert-image', [{ range: selection, text: '\n' + imageHtml + '\n' }]);
                    const newContent = editor.getValue();
                    handleInputChange('content', newContent);
                    toast.success('图片已插入到编辑器');
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-1" /> 插入图片
                    </Button>
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-600">快速插入：</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => insertTemplate(templates.tip)} title="插入提示框">
                    <Copy className="w-3 h-3 mr-1" /> 提示
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertTemplate(templates.warning)} title="插入警告框">
                    <Copy className="w-3 h-3 mr-1" /> 警告
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertTemplate(templates.traffic)} title="插入交通灯">
                    <Copy className="w-3 h-3 mr-1" /> 交通灯
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertTemplate(templates.card)} title="插入卡片">
                    <Copy className="w-3 h-3 mr-1" /> 卡片
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertTemplate(templates.table)} title="插入表格">
                    <Copy className="w-3 h-3 mr-1" /> 表格
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleInputChange('content', HTML_TEST_CONTENT);
                      toast.success('已插入完整HTML测试内容');
                    }}
                    title="插入完整HTML测试"
                  >
                    <TestTube className="w-3 h-3 mr-1" /> 完整测试
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden" style={{ minHeight: '700px' }}>
              <MonacoEditor
                height="100%"
                defaultLanguage="html"
                value={formData.content}
                onChange={handleEditorChange}
                options={editorOptions}
                onMount={(editor) => {
                  editorRef.current = editor;
                  setTimeout(() => {
                    editor.layout();
                  }, 100);
                }}
                theme="vs-light"
              />
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-1">
          <ContentPreview content={formData.content || ''} device={previewDevice} onDeviceChange={setPreviewDevice} />
        </div>
      </div>
    </div>
  );
}


