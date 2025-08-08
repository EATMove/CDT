'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Edit, Trash2, Eye, BookOpen, Calendar, User, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  sectionsCount?: number;
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterData | null>(null);

  // 加载章节列表
  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      const response = await fetch('/api/chapters');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setChapters(result.data.data || []);
        } else {
          toast.error(result.message || '加载章节列表失败');
        }
      } else {
        toast.error('加载章节列表失败');
      }
    } catch (error) {
      toast.error('加载章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除章节
  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('确定要删除这个章节吗？删除后无法恢复。')) return;

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('章节删除成功');
          loadChapters();
        } else {
          toast.error(result.message || '删除失败');
        }
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 过滤章节
  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = filterProvince === 'all' || chapter.province === filterProvince;
    const matchesStatus = filterStatus === 'all' || chapter.publishStatus === filterStatus;
    return matchesSearch && matchesProvince && matchesStatus;
  });

  // 获取省份名称
  const getProvinceName = (province: string) => {
    const names = {
      'AB': '阿尔伯塔省',
      'BC': 'BC省',
      'ON': '安大略省'
    };
    return names[province as keyof typeof names] || province;
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors = {
      'DRAFT': 'bg-slate-100 text-slate-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'PUBLISHED': 'bg-green-100 text-green-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  // 获取状态名称
  const getStatusName = (status: string) => {
    const names = {
      'DRAFT': '草稿',
      'REVIEW': '审核中',
      'PUBLISHED': '已发布',
      'ARCHIVED': '已归档'
    };
    return names[status as keyof typeof names] || status;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">章节管理</h1>
            <p className="text-slate-600 mt-2">管理各省份的驾驶手册章节</p>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建章节
            </Button>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                placeholder="搜索章节..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filterProvince} onValueChange={setFilterProvince}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部省份</SelectItem>
                  <SelectItem value="AB">阿尔伯塔省</SelectItem>
                  <SelectItem value="BC">BC省</SelectItem>
                  <SelectItem value="ON">安大略省</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="REVIEW">审核中</SelectItem>
                  <SelectItem value="PUBLISHED">已发布</SelectItem>
                  <SelectItem value="ARCHIVED">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 章节列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">加载中...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>省份</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>付费类型</TableHead>
                  <TableHead>预计阅读时间</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChapters.map((chapter) => (
                  <TableRow key={chapter.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{chapter.title}</div>
                        <div className="text-sm text-slate-500 line-clamp-2">
                          {chapter.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getProvinceName(chapter.province)}
                      </Badge>
                    </TableCell>
                    <TableCell>{chapter.order}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(chapter.publishStatus)}>
                        {getStatusName(chapter.publishStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {chapter.paymentType === 'FREE' ? '免费' : 
                         chapter.paymentType === 'MEMBER_ONLY' ? '仅会员' :
                         chapter.paymentType === 'TRIAL_INCLUDED' ? '试用包含' : '高级'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-sm">{chapter.estimatedReadTime} 分钟</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {new Date(chapter.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/chapters/${chapter.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/chapters/${chapter.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteChapter(chapter.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && filteredChapters.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600">暂无章节</p>
                                <div className="flex gap-2 mt-4">
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        创建第一个章节
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          返回首页
                        </Link>
                      </Button>
                    </div>
          </CardContent>
        </Card>
      )}

      {/* 创建章节表单 */}
      {showCreateForm && (
        <CreateChapterForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadChapters();
          }}
        />
      )}
    </div>
  );
}

// 创建章节表单组件
function CreateChapterForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    order: 1,
    province: 'ON' as 'AB' | 'BC' | 'ON',
    contentFormat: 'HTML' as 'HTML' | 'MARKDOWN' | 'PLAIN_TEXT',
    estimatedReadTime: 25,
    coverImageUrl: '',
    coverImageAlt: '',
    paymentType: 'FREE' as 'FREE' | 'MEMBER_ONLY' | 'TRIAL_INCLUDED' | 'PREMIUM',
    freePreviewSections: 3,
    publishStatus: 'DRAFT' as 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // 清理空串
          id: formData.id.trim() || undefined,
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          coverImageAlt: formData.coverImageAlt.trim() || undefined,
          titleEn: formData.titleEn.trim() || undefined,
          descriptionEn: formData.descriptionEn.trim() || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('章节创建成功');
          onSuccess();
        } else {
          toast.error(result.message || '创建失败');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>创建新章节</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="id">章节ID（可选，留空自动生成）</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="例如 ch-ab-001 或自定义 slug"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="章节标题"
                  required
                />
              </div>
              <div>
                <Label htmlFor="titleEn">英文标题</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Chapter Title"
                />
              </div>
            </div>

            {/* 封面图片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coverImageUrl">封面图片URL</Label>
                <Input
                  id="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="coverImageAlt">封面图片Alt</Label>
                <Input
                  id="coverImageAlt"
                  value={formData.coverImageAlt}
                  onChange={(e) => setFormData({ ...formData, coverImageAlt: e.target.value })}
                  placeholder="图片替代文本（用于无障碍/SEO）"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="章节描述"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="province">省份 *</Label>
                <Select value={formData.province} onValueChange={(value: any) => setFormData({ ...formData, province: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AB">阿尔伯塔省</SelectItem>
                    <SelectItem value="BC">BC省</SelectItem>
                    <SelectItem value="ON">安大略省</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order">排序 *</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estimatedReadTime">预计阅读时间(分钟) *</Label>
                <Input
                  id="estimatedReadTime"
                  type="number"
                  value={formData.estimatedReadTime}
                  onChange={(e) => setFormData({ ...formData, estimatedReadTime: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentType">付费类型</Label>
                <Select value={formData.paymentType} onValueChange={(value: any) => setFormData({ ...formData, paymentType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">免费</SelectItem>
                    <SelectItem value="TRIAL_INCLUDED">试用包含</SelectItem>
                    <SelectItem value="MEMBER_ONLY">仅会员</SelectItem>
                    <SelectItem value="PREMIUM">高级内容</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="publishStatus">发布状态</Label>
                <Select value={formData.publishStatus} onValueChange={(value: any) => setFormData({ ...formData, publishStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">草稿</SelectItem>
                    <SelectItem value="REVIEW">审核中</SelectItem>
                    <SelectItem value="PUBLISHED">已发布</SelectItem>
                    <SelectItem value="ARCHIVED">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? '创建中...' : '创建章节'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 