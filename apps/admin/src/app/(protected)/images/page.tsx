'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Search, Filter, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  captionEn?: string;
  usage: 'content' | 'cover' | 'diagram' | 'illustration';
  order: number;
  uploadedBy: string;
  createdAt: string;
  chapterId?: string;
  sectionId?: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsage, setFilterUsage] = useState<string>('all');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 加载图片列表
  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const loadImages = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (filterUsage !== 'all') params.set('usage', filterUsage);
      if (filterSectionId) params.set('sectionId', filterSectionId);

      const response = await fetch(`/api/images?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setImages(result.data.data || result.data || []);
          const pg = result.data.pagination;
          if (pg) {
            setTotal(pg.total);
          } else if (Array.isArray(result.data)) {
            setTotal(result.data.length);
          }
        } else {
          toast.error(result.message || '加载图片列表失败');
        }
      } else {
        toast.error('加载图片列表失败');
      }
    } catch (error) {
      toast.error('加载图片列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 图片上传处理
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name);

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '上传失败');
        }

        const result = await response.json();
        return result.data;
      } catch (error) {
        console.error('上传失败:', error);
        toast.error(`${file.name} 上传失败`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        toast.success(`成功上传 ${successfulUploads.length} 张图片`);
        loadImages(); // 重新加载图片列表
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('图片删除成功');
          loadImages();
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

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedImages.length === 0) {
      toast.error('请选择要删除的图片');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedImages.length} 张图片吗？`)) return;

    try {
      const response = await fetch('/api/images/batch-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedImages }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('批量删除成功');
          setSelectedImages([]);
          loadImages();
        } else {
          toast.error(result.message || '批量删除失败');
        }
      } else {
        toast.error('批量删除失败');
      }
    } catch (error) {
      toast.error('批量删除失败');
    }
  };

  // 复制图片URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('图片URL已复制到剪贴板');
  };

  // 当搜索或筛选变化时重置到第一页并重新加载（防抖可后续加入）
  useEffect(() => {
    setPage(1);
    setLoading(true);
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterUsage, filterSectionId]);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">图片管理</h1>
        <p className="text-slate-600 mt-2">管理应用中的所有图片资源</p>
      </div>

      {/* 操作栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={handleImageUpload} disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? '上传中...' : '上传图片'}
            </Button>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                placeholder="搜索图片..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filterUsage} onValueChange={setFilterUsage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部用途</SelectItem>
                  <SelectItem value="content">内容图片</SelectItem>
                  <SelectItem value="cover">封面图片</SelectItem>
                  <SelectItem value="diagram">图表</SelectItem>
                  <SelectItem value="illustration">插图</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="按 sectionId 过滤 (可选)"
                value={filterSectionId}
                onChange={(e) => setFilterSectionId(e.target.value.trim())}
                className="w-64"
              />
            </div>

            {selectedImages.length > 0 && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedImages.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 图片表格（不渲染图片本体，减少请求） */}
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
                  <TableHead className="w-10"></TableHead>
                  <TableHead>文件名</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>用途</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>尺寸</TableHead>
                  <TableHead>所属</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedImages([...selectedImages, image.id]);
                          else setSelectedImages(selectedImages.filter(id => id !== image.id));
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-64 truncate" title={image.originalName}>{image.originalName}</TableCell>
                    <TableCell className="max-w-64 truncate" title={image.fileUrl}>{image.fileUrl}</TableCell>
                    <TableCell>{image.usage}</TableCell>
                    <TableCell>{formatFileSize(image.fileSize)}</TableCell>
                    <TableCell>{image.width} × {image.height}</TableCell>
                    <TableCell>{image.sectionId ? `段落 ${image.sectionId}` : (image.chapterId ? `章节 ${image.chapterId}` : '-')}</TableCell>
                    <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleCopyUrl(image.fileUrl)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)}>
                          <Trash2 className="w-3 h-3" />
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

      {!loading && images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">暂无图片</p>
        </div>
      )}

      {/* 分页控件 */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">共 {total} 条</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
          <div className="text-sm">第 {page} 页</div>
          <Button variant="outline" size="sm" disabled={images.length < limit || page * limit >= total} onClick={() => setPage(page + 1)}>下一页</Button>
          <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">每页 10</SelectItem>
              <SelectItem value="20">每页 20</SelectItem>
              <SelectItem value="50">每页 50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
} 