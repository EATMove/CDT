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
  Calendar,
  Clock,
  FileText,
  Globe,
  BookOpen,
  Lock,
  Unlock,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  chapter?: {
    id: string;
    title: string;
    province: string;
  };
}

export default function SectionViewPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.id as string;
  
  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // 加载段落数据
  const loadSectionData = useCallback(async () => {
    if (!sectionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${sectionId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSectionData(result.data);
        } else {
          toast.error(result.message || '加载失败');
        }
      } else {
        toast.error('加载失败');
      }
    } catch (error) {
      console.error('加载段落数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    loadSectionData();
  }, [loadSectionData]);

  // 预览段落内容
  const handlePreview = async () => {
    if (!sectionData) return;

    try {
      const response = await fetch('/api/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 32px; padding: 24px; background: ${sectionData.isFree ? '#f0f9ff' : '#fdf4ff'}; border-radius: 12px; border: 2px solid ${sectionData.isFree ? '#0ea5e9' : '#a855f7'};">
                <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 12px 0; color: ${sectionData.isFree ? '#0369a1' : '#7c3aed'};">
                  ${sectionData.isFree ? '🆓' : '💎'} ${sectionData.title}
                </h1>
                <div style="display: flex; justify-content: center; gap: 20px; font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                  <span style="background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb;">📄 第 ${sectionData.order} 段</span>
                  <span style="background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb;">📝 ${sectionData.wordCount.toLocaleString()} 字</span>
                  <span style="background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb;">⏱️ ${sectionData.estimatedReadTime} 分钟</span>
                </div>
                ${sectionData.chapter ? `
                  <div style="font-size: 14px; color: #6b7280;">
                    来自章节：<strong>${sectionData.chapter.title}</strong>
                  </div>
                ` : ''}
              </div>
              <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                ${sectionData.content}
              </div>
              <div style="text-align: center; margin-top: 32px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  📅 创建于 ${new Date(sectionData.createdAt).toLocaleDateString('zh-CN')} • 
                  📝 更新于 ${new Date(sectionData.updatedAt).toLocaleDateString('zh-CN')}
                </p>
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
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast.error('预览失败');
    }
  };

  // 复制段落内容
  const handleCopyContent = () => {
    if (sectionData?.content) {
      navigator.clipboard.writeText(sectionData.content);
      toast.success('内容已复制到剪贴板');
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

  if (!sectionData) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">段落不存在</p>
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 顶部导航和操作 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={sectionData.chapter ? `/chapters/${sectionData.chapterId}` : '/chapters'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {sectionData.chapter ? '返回章节' : '返回列表'}
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{sectionData.title}</h1>
              <Badge className={sectionData.isFree ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                {sectionData.isFree ? '🆓 免费' : '💎 会员'}
              </Badge>
              <Badge variant="outline">第 {sectionData.order} 段</Badge>
            </div>
            {sectionData.chapter && (
              <p className="text-slate-600 mt-1">
                来自章节：
                <Link 
                  href={`/chapters/${sectionData.chapterId}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
                >
                  {sectionData.chapter.title}
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyContent}>
            <Copy className="w-4 h-4 mr-2" />
            复制内容
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            预览
          </Button>
          <Button asChild>
            <Link href={`/content/edit?chapterId=${sectionData.chapterId}&sectionId=${sectionData.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              编辑段落
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：段落信息 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                段落信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">标题</span>
                  <span className="font-medium">{sectionData.title}</span>
                </div>
                
                {sectionData.titleEn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">英文标题</span>
                    <span className="font-medium text-slate-700">{sectionData.titleEn}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">排序</span>
                  <Badge variant="outline">第 {sectionData.order} 段</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">访问权限</span>
                  <Badge className={sectionData.isFree ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                    {sectionData.isFree ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    {sectionData.isFree ? '免费' : '会员'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">字数统计</span>
                  <Badge variant="outline">
                    <FileText className="w-3 h-3 mr-1" />
                    {sectionData.wordCount.toLocaleString()} 字
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">预计阅读时间</span>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {sectionData.estimatedReadTime} 分钟
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">创建时间</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(sectionData.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">更新时间</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(sectionData.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 章节信息 */}
          {sectionData.chapter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  所属章节
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">章节标题</span>
                  <Link 
                    href={`/chapters/${sectionData.chapterId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {sectionData.chapter.title}
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">省份</span>
                  <Badge variant="secondary">
                    <Globe className="w-3 h-3 mr-1" />
                    {getProvinceName(sectionData.chapter.province)}
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={`/chapters/${sectionData.chapterId}`}>
                      <BookOpen className="w-3 h-3 mr-2" />
                      查看完整章节
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 用户类型要求 */}
          {sectionData.requiredUserType && sectionData.requiredUserType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  访问要求
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sectionData.requiredUserType.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：内容显示 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  段落内容
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyContent}>
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePreview}>
                    <Eye className="w-3 h-3 mr-1" />
                    预览
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 内容预览 */}
              <div className="bg-slate-50 rounded-lg p-6 border">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sectionData.content }}
                />
              </div>

              {/* 英文内容 */}
              {sectionData.contentEn && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium text-slate-700">英文版本</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sectionData.contentEn }}
                    />
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-slate-500">
                  💡 提示：点击预览查看移动端效果，点击编辑进行修改
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={sectionData.chapter ? `/chapters/${sectionData.chapterId}` : '/chapters'}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      返回
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/content/edit?chapterId=${sectionData.chapterId}&sectionId=${sectionData.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Link>
                  </Button>
                </div>
              </div>
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
                <h3 className="text-lg font-semibold">📄 段落预览</h3>
                <Badge variant="outline">{sectionData.title}</Badge>
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
                <Button variant="outline" onClick={() => setPreviewMode(false)}>
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