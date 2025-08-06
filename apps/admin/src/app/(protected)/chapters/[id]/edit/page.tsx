'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  Calendar,
  Clock,
  FileText,
  Users,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// 动态导入Monaco Editor
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => <div className="h-full bg-slate-100 rounded-lg flex items-center justify-center">加载编辑器中...</div>,
  ssr: false
});

interface ChapterData {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  order: number;
  province: 'AB' | 'BC' | 'ON';
  contentFormat: 'HTML' | 'MARKDOWN' | 'PLAIN_TEXT';
  estimatedReadTime: number;
  coverImageUrl?: string;
  coverImageAlt?: string;
  paymentType: 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM';
  freePreviewSections: number;
  prerequisiteChapters?: string[];
  publishStatus: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  authorId?: string;
  lastEditedBy?: string;
  createdAt: string;
  updatedAt: string;
  sections?: SectionData[];
  totalSections?: number;
  freeSections?: number;
}

interface SectionData {
  id: string;
  chapterId: string;
  title: string;
  titleEn?: string;
  order: number;
  content: string;
  contentEn?: string;
  isFree: boolean;
  requiredUserType: string[];
  wordCount: number;
  estimatedReadTime: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChapterEditPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'chapter' | 'section' | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  
  const editorRef = useRef<any>(null);

  // 加载章节数据
  const loadChapterData = useCallback(async () => {
    if (!chapterId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setChapterData(result.data);
          setSections(result.data.sections || []);
        }
      }
    } catch (error) {
      console.error('加载章节数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  // 保存章节信息
  const handleSaveChapter = async () => {
    if (!chapterData) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('章节信息保存成功');
          loadChapterData();
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 预览章节内容
  const handlePreviewChapter = async () => {
    if (!sections.length) {
      toast.error('暂无段落内容可预览');
      return;
    }

    try {
      // 组合所有段落内容
      const fullContent = sections
        .sort((a, b) => a.order - b.order)
        .map(section => `
          <div class="section" data-section-id="${section.id}">
            <h2 class="section-title">${section.title}</h2>
            ${section.content}
          </div>
        `)
        .join('');

      const response = await fetch('/api/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fullContent,
          device: previewDevice,
          theme: 'light'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPreviewContent(result.html);
        setPreviewMode('chapter');
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败');
    }
  };

  // 预览段落内容
  const handlePreviewSection = async (section: SectionData) => {
    try {
      const response = await fetch('/api/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: section.content,
          device: previewDevice,
          theme: 'light'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPreviewContent(result.html);
        setSelectedSection(section);
        setPreviewMode('section');
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败');
    }
  };

  // 删除段落
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('确定要删除这个段落吗？')) return;
    
    try {
      const response = await fetch(`/api/chapters/${chapterId}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('段落删除成功');
          loadChapterData();
        }
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

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

  if (!chapterData) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <p className="text-slate-600">章节不存在</p>
          <Button className="mt-4" asChild>
            <Link href="/chapters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回章节列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/chapters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">编辑章节</h1>
            <p className="text-slate-600">{chapterData.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewChapter}>
            <Eye className="w-4 h-4 mr-2" />
            预览章节
          </Button>
          <Button onClick={handleSaveChapter} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存章节'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：章节信息 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={chapterData.title}
                  onChange={(e) => setChapterData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="章节标题"
                />
              </div>
              
              <div>
                <Label htmlFor="titleEn">英文标题</Label>
                <Input
                  id="titleEn"
                  value={chapterData.titleEn || ''}
                  onChange={(e) => setChapterData(prev => prev ? { ...prev, titleEn: e.target.value } : null)}
                  placeholder="Chapter Title"
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={chapterData.description}
                  onChange={(e) => setChapterData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="章节描述"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="descriptionEn">英文描述</Label>
                <Textarea
                  id="descriptionEn"
                  value={chapterData.descriptionEn || ''}
                  onChange={(e) => setChapterData(prev => prev ? { ...prev, descriptionEn: e.target.value } : null)}
                  placeholder="Chapter Description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">排序</Label>
                  <Input
                    id="order"
                    type="number"
                    value={chapterData.order}
                    onChange={(e) => setChapterData(prev => prev ? { ...prev, order: parseInt(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="province">省份</Label>
                  <Select 
                    value={chapterData.province} 
                    onValueChange={(value) => setChapterData(prev => prev ? { ...prev, province: value as any } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AB">Alberta (AB)</SelectItem>
                      <SelectItem value="BC">British Columbia (BC)</SelectItem>
                      <SelectItem value="ON">Ontario (ON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentType">付费类型</Label>
                <Select 
                  value={chapterData.paymentType} 
                  onValueChange={(value) => setChapterData(prev => prev ? { ...prev, paymentType: value as any } : null)}
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

              <div>
                <Label htmlFor="publishStatus">发布状态</Label>
                <Select 
                  value={chapterData.publishStatus} 
                  onValueChange={(value) => setChapterData(prev => prev ? { ...prev, publishStatus: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">📝 草稿</SelectItem>
                    <SelectItem value="REVIEW">👀 审核中</SelectItem>
                    <SelectItem value="PUBLISHED">✅ 已发布</SelectItem>
                    <SelectItem value="ARCHIVED">🗄️ 已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                统计信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">总段落数</span>
                <Badge variant="secondary">{sections.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">免费段落</span>
                <Badge variant="outline">{sections.filter(s => s.isFree).length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">总字数</span>
                <Badge variant="outline">{sections.reduce((sum, s) => sum + s.wordCount, 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">预计阅读时间</span>
                <Badge variant="outline">{sections.reduce((sum, s) => sum + s.estimatedReadTime, 0)} 分钟</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：段落管理 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 段落列表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  段落管理
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/content/edit?chapterId=${chapterId}`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建段落
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">暂无段落</p>
                  <Button onClick={() => router.push(`/content/edit?chapterId=${chapterId}`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建第一个段落
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{section.title || '无标题'}</h3>
                              <Badge variant={section.isFree ? "secondary" : "default"}>
                                {section.isFree ? '🆓 免费' : '💎 会员'}
                              </Badge>
                              <Badge variant="outline">第 {section.order} 段</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {section.wordCount} 字
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {section.estimatedReadTime} 分钟
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(section.updatedAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewSection(section)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              预览
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/content/edit?chapterId=${chapterId}&sectionId=${section.id}`)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 预览模态框 */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">
                  {previewMode === 'chapter' ? '章节预览' : '段落预览'}
                </h3>
                {previewMode === 'section' && selectedSection && (
                  <Badge variant="outline">{selectedSection.title}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select value={previewDevice} onValueChange={(value: any) => setPreviewDevice(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">📱 手机</SelectItem>
                    <SelectItem value="tablet">📱 平板</SelectItem>
                    <SelectItem value="desktop">💻 桌面</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setPreviewMode(null)}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={previewContent}
                className="w-full h-full border-0"
                title="预览"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 