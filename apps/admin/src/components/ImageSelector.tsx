'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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

interface ImageSelectorProps {
  onImageSelect: (image: ImageData) => void;
  trigger?: React.ReactNode;
  chapterId?: string;
  sectionId?: string;
  defaultUsage?: string;
}

export default function ImageSelector({ onImageSelect, trigger, chapterId, sectionId, defaultUsage }: ImageSelectorProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsage, setFilterUsage] = useState<string>(defaultUsage || 'all');
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [onlyCurrentSection, setOnlyCurrentSection] = useState<boolean>(Boolean(sectionId));
  

  // 当上下文变化时重新加载图片
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, sectionId, isOpen]);

  // 加载图片列表
  const loadImages = async () => {
    setLoading(true);
    try {
      // 仅按 sectionId 精确筛选并分页，减少加载体量
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (filterUsage !== 'all') params.set('usage', filterUsage);
      if (onlyCurrentSection && sectionId) {
        params.set('sectionId', sectionId);
      }

      const response = await fetch(`/api/images?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setImages(result.data.data || result.data || []);
          const pg = result.data.pagination;
          if (pg) setTotal(pg.total);
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

  // 复制图片URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('图片URL已复制到剪贴板');
  };

  // 选择图片
  const handleSelectImage = (image: ImageData) => {
    onImageSelect(image);
    setIsOpen(false);
  };

  // 过滤图片
  const filteredImages = images.filter(image => {
    const matchesSearch = image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUsage === 'all' || image.usage === filterUsage;
    return matchesSearch && matchesFilter;
  });

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 搜索与用途筛选变更时，回到第一页并刷新
  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterUsage]);

  // 切换“仅当前段落”时刷新
  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyCurrentSection]);

  // 分页变更
  useEffect(() => {
    if (!isOpen) return;
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            选择图片
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader>
          <div className="flex items-center justify-between px-6 pt-4">
            <DialogTitle>选择图片</DialogTitle>
            {(chapterId || sectionId) && (
              <div className="text-sm text-slate-600 bg-blue-50 px-2 py-1 rounded">
                📁 {sectionId ? `段落内容` : `章节内容`}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex flex-col h-full min-h-0">
          {/* 操作栏 */}
          <div className="flex flex-wrap items-center gap-4 px-6 pb-4">
            <Link href={`/images/upload${(chapterId || sectionId) ? `?${new URLSearchParams({ ...(chapterId ? { chapterId } : {}), ...(sectionId ? { sectionId } : {}) }).toString()}` : ''}` } className="inline-flex">
              <Button size="sm" variant="outline">上传新图片</Button>
            </Link>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                placeholder="搜索图片..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
                size={1}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterUsage} onValueChange={setFilterUsage}>
                <SelectTrigger className="w-32">
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

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyCurrentSection}
                onChange={(e) => setOnlyCurrentSection(e.target.checked)}
                disabled={!sectionId}
              />
              仅当前段落
            </label>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">加载中...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative group">
                        <img
                          src={image.fileUrl}
                          alt={image.altText || image.originalName}
                          className="w-full h-28 object-cover"
                          loading="lazy"
                          decoding="async"
                          onClick={() => handleSelectImage(image)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleCopyUrl(image.fileUrl); }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleSelectImage(image); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <h3 className="font-medium text-xs truncate" title={image.originalName}>{image.originalName}</h3>
                          <div className="text-xs text-slate-500">
                            <p>{formatFileSize(image.fileSize)}</p>
                            <p>{image.width} × {image.height}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {!loading && filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600">暂无图片</p>
                </div>
              )}
            </div>

          {/* 分页控件 */}
          <div className="flex items-center justify-between px-6 pb-4">
            <div className="text-xs text-slate-600">共 {total} 条</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
              <div className="text-xs">第 {page} 页</div>
              <Button variant="outline" size="sm" disabled={images.length < limit || page * limit >= total} onClick={() => setPage(page + 1)}>下一页</Button>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">每页 12</SelectItem>
                  <SelectItem value="20">每页 20</SelectItem>
                  <SelectItem value="40">每页 40</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 