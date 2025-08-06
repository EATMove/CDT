'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Plus,
  Calendar,
  Clock,
  FileText,
  Users,
  Globe,
  BookOpen,
  Lock,
  Unlock,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function ChapterViewPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'chapter' | 'section' | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

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
        } else {
          toast.error(result.message || '加载失败');
        }
      } else {
        toast.error('加载失败');
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
          <div class="section" data-section-id="${section.id}" style="margin-bottom: 32px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 class="section-title" style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
              ${section.isFree ? '🆓' : '💎'} ${section.title}
            </h2>
            <div class="section-content">
              ${section.content}
            </div>
          </div>
        `)
        .join('');

      const response = await fetch('/api/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
                <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">${chapterData?.title}</h1>
                <p style="font-size: 16px; margin: 0; opacity: 0.9;">${chapterData?.description}</p>
                <div style="margin-top: 16px; display: flex; justify-content: center; gap: 16px; font-size: 14px;">
                  <span>📍 ${getProvinceName(chapterData?.province || '')}</span>
                  <span>⏱️ ${chapterData?.estimatedReadTime} 分钟</span>
                  <span>📄 ${sections.length} 段落</span>
                </div>
              </div>
              ${fullContent}
            </div>
          `,
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
          content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 32px; padding: 20px; background: ${section.isFree ? '#f0f9ff' : '#fdf4ff'}; border-radius: 12px;">
                <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: ${section.isFree ? '#0369a1' : '#7c3aed'};">
                  ${section.isFree ? '🆓' : '💎'} ${section.title}
                </h1>
                <div style="display: flex; justify-content: center; gap: 16px; font-size: 14px; color: #6b7280;">
                  <span>📄 第 ${section.order} 段</span>
                  <span>📝 ${section.wordCount} 字</span>
                  <span>⏱️ ${section.estimatedReadTime} 分钟</span>
                </div>
              </div>
              <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${section.content}
              </div>
            </div>
          `,
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

  // 获取省份名称
  const getProvinceName = (province: string) => {
    const names = {
      'AB': '阿尔伯塔省',
      'BC': 'BC省',
      'ON': '安大略省'
    };
    return names[province as keyof typeof names] || province;
  };

  // 获取状态颜色和名称
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'DRAFT': { color: 'bg-slate-100 text-slate-800', name: '📝 草稿', icon: '📝' },
      'REVIEW': { color: 'bg-yellow-100 text-yellow-800', name: '👀 审核中', icon: '👀' },
      'PUBLISHED': { color: 'bg-green-100 text-green-800', name: '✅ 已发布', icon: '✅' },
      'ARCHIVED': { color: 'bg-gray-100 text-gray-800', name: '🗄️ 已归档', icon: '🗄️' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.DRAFT;
  };

  const getPaymentTypeInfo = (paymentType: string) => {
    const typeMap = {
      'FREE': { name: '🆓 免费', color: 'bg-green-100 text-green-800' },
      'TRIAL_INCLUDED': { name: '🎯 试用包含', color: 'bg-blue-100 text-blue-800' },
      'MEMBER_ONLY': { name: '💎 仅会员', color: 'bg-purple-100 text-purple-800' },
      'PREMIUM': { name: '⭐ 高级内容', color: 'bg-orange-100 text-orange-800' }
    };
    return typeMap[paymentType as keyof typeof typeMap] || typeMap.FREE;
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
          <p className="text-slate-600 mb-4">章节不存在</p>
          <Button asChild>
            <Link href="/chapters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回章节列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(chapterData.publishStatus);
  const paymentInfo = getPaymentTypeInfo(chapterData.paymentType);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 顶部导航和操作 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/chapters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{chapterData.title}</h1>
              <Badge className={statusInfo.color}>
                {statusInfo.name}
              </Badge>
              <Badge className={paymentInfo.color}>
                {paymentInfo.name}
              </Badge>
            </div>
            <p className="text-slate-600 mt-1">{chapterData.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewChapter}>
            <Eye className="w-4 h-4 mr-2" />
            预览章节
          </Button>
          <Button asChild>
            <Link href={`/chapters/${chapterId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              编辑章节
            </Link>
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
                <BookOpen className="w-5 h-5" />
                章节信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">标题</span>
                  <span className="font-medium">{chapterData.title}</span>
                </div>
                
                {chapterData.titleEn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">英文标题</span>
                    <span className="font-medium text-slate-700">{chapterData.titleEn}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">排序</span>
                  <Badge variant="outline">第 {chapterData.order} 章</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">省份</span>
                  <Badge variant="secondary">
                    <Globe className="w-3 h-3 mr-1" />
                    {getProvinceName(chapterData.province)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">内容格式</span>
                  <Badge variant="outline">{chapterData.contentFormat}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">预计阅读时间</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{chapterData.estimatedReadTime} 分钟</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">免费预览段数</span>
                  <Badge variant="outline">{chapterData.freePreviewSections} 段</Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">创建时间</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(chapterData.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">更新时间</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(chapterData.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>

                {chapterData.publishedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">发布时间</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(chapterData.publishedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                )}
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
                <Badge variant="secondary">
                  <FileText className="w-3 h-3 mr-1" />
                  {sections.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">免费段落</span>
                <Badge className="bg-green-100 text-green-800">
                  <Unlock className="w-3 h-3 mr-1" />
                  {sections.filter(s => s.isFree).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">会员段落</span>
                <Badge className="bg-purple-100 text-purple-800">
                  <Lock className="w-3 h-3 mr-1" />
                  {sections.filter(s => !s.isFree).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">总字数</span>
                <Badge variant="outline">
                  {sections.reduce((sum, s) => sum + s.wordCount, 0).toLocaleString()} 字
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">总阅读时间</span>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {sections.reduce((sum, s) => sum + s.estimatedReadTime, 0)} 分钟
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：段落列表 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  段落列表 ({sections.length})
                </CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/content/edit?chapterId=${chapterId}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    新建段落
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-4">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                  </div>
                  <p className="text-slate-600 mb-4">暂无段落内容</p>
                  <Button asChild>
                    <Link href={`/content/edit?chapterId=${chapterId}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      创建第一个段落
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
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
                              <h3 className="font-medium text-lg">{section.title || '无标题'}</h3>
                              <Badge variant={section.isFree ? "secondary" : "default"}>
                                {section.isFree ? '🆓 免费' : '💎 会员'}
                              </Badge>
                              <Badge variant="outline">第 {section.order} 段</Badge>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {section.wordCount.toLocaleString()} 字
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

                            {/* 内容预览 */}
                            <div className="text-sm text-slate-600 line-clamp-2">
                              {section.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
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
                              asChild
                            >
                              <Link href={`/content/edit?chapterId=${chapterId}&sectionId=${section.id}`}>
                                <Edit className="w-3 h-3 mr-1" />
                                编辑
                              </Link>
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
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">
                  {previewMode === 'chapter' ? '📖 章节预览' : '📄 段落预览'}
                </h3>
                {previewMode === 'section' && selectedSection && (
                  <Badge variant="outline">{selectedSection.title}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">设备：</span>
                <Select value={previewDevice} onValueChange={(value: any) => setPreviewDevice(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3 h-3" />
                        手机
                      </div>
                    </SelectItem>
                    <SelectItem value="tablet">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-3 h-3" />
                        平板
                      </div>
                    </SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3" />
                        桌面
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setPreviewMode(null)}>
                  关闭
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className={`mx-auto h-full ${
                previewDevice === 'mobile' ? 'max-w-sm' :
                previewDevice === 'tablet' ? 'max-w-2xl' :
                'w-full'
              }`}>
                <iframe
                  srcDoc={previewContent}
                  className="w-full h-full border-0"
                  title="预览"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}