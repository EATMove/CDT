'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

type UsageType = 'content' | 'cover' | 'diagram' | 'illustration';

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
  usage: UsageType;
  order: number;
  uploadedBy: string;
  createdAt: string;
  chapterId?: string;
  sectionId?: string;
}

interface ImagePickerProps {
  onPick: (image: ImageData) => void;
  trigger?: React.ReactNode;
  chapterId?: string;
  sectionId?: string;
  defaultUsage?: UsageType;
  autoInsertAfterUpload?: boolean;
}

export default function ImagePicker({ onPick, trigger, chapterId, sectionId, defaultUsage = 'content', autoInsertAfterUpload = true }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');

  // library state
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsage, setFilterUsage] = useState<string>(defaultUsage || 'all');
  const [onlyCurrentSection, setOnlyCurrentSection] = useState<boolean>(Boolean(sectionId));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // upload state
  const [customId, setCustomId] = useState('');
  const [customAlt, setCustomAlt] = useState('');
  const [customUsage, setCustomUsage] = useState<UsageType>(defaultUsage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // load images
  const loadImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (filterUsage !== 'all') params.set('usage', filterUsage);
      if (onlyCurrentSection && sectionId) params.set('sectionId', sectionId);

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

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chapterId, sectionId]);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterUsage, onlyCurrentSection]);

  useEffect(() => {
    if (!isOpen) return;
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // upload handlers
  const handleImageUploadClick = () => fileInputRef.current?.click();

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', customAlt || file.name);
        if (customId.trim()) formData.append('id', customId.trim());
        if (sectionId) {
          formData.append('sectionId', sectionId);
          formData.append('usage', customUsage);
        } else if (chapterId) {
          formData.append('chapterId', chapterId);
          formData.append('usage', customUsage);
        } else {
          formData.append('usage', customUsage);
        }

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error((errorData as any).message || '上传失败');
        }

        const result = await response.json();
        const data = result.data || {};
        // 兼容上传返回字段为 url 与列表返回字段为 fileUrl 的差异
        const normalized = { ...data, fileUrl: data.fileUrl ?? data.url } as ImageData;
        return normalized;
      } catch (error) {
        console.error('上传失败:', error);
        toast.error(`${file.name} 上传失败`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as ImageData[];
      if (successfulUploads.length > 0) {
        toast.success(`成功上传 ${successfulUploads.length} 张图片`);
        setActiveTab('library');
        await loadImages();
        if (successfulUploads.length === 1 && autoInsertAfterUpload) {
          onPick(successfulUploads[0]);
          setIsOpen(false);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // drag & drop upload
  useEffect(() => {
    const node = dropRef.current;
    if (!node) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => {
      prevent(e);
      const dt = e.dataTransfer;
      if (!dt) return;
      const files = Array.from(dt.files).filter(f => f.type.startsWith('image/'));
      if (files.length === 0) return;
      const input = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(input);
    };
    ['dragenter','dragover','dragleave','drop'].forEach(evt => node.addEventListener(evt, prevent as any));
    node.addEventListener('drop', handleDrop as any);
    return () => {
      ['dragenter','dragover','dragleave','drop'].forEach(evt => node.removeEventListener(evt, prevent as any));
      node.removeEventListener('drop', handleDrop as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFileSelect]);

  // helpers
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('图片URL已复制到剪贴板');
  };

  const handleSelectImage = (image: ImageData) => {
    onPick(image);
    setIsOpen(false);
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.filename.toLowerCase().includes(searchTerm.toLowerCase()) || image.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUsage === 'all' || image.usage === (filterUsage as UsageType);
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" /> 插入图片
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader>
          <div className="flex items-center justify-between px-6 pt-4">
            <DialogTitle>插入图片</DialogTitle>
            {(chapterId || sectionId) && (
              <div className="text-sm text-slate-600 bg-blue-50 px-2 py-1 rounded">
                📁 {sectionId ? `段落内容` : `章节内容`}
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="flex flex-col h-full min-h-0">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0">
            <TabsList className="px-6">
              <TabsTrigger value="library">资源库</TabsTrigger>
              <TabsTrigger value="upload">上传</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
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
                  <input type="checkbox" checked={onlyCurrentSection} onChange={(e) => setOnlyCurrentSection(e.target.checked)} disabled={!sectionId} />
                  仅当前段落
                </label>
              </div>

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

              <div className="flex items-center justify-between mt-4">
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
            </TabsContent>

            <TabsContent value="upload" className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Button onClick={handleImageUploadClick} disabled={uploading} size="sm">
                  <Upload className="w-4 h-4 mr-2" />{uploading ? '上传中...' : '选择图片'}
                </Button>
              </div>
              <div ref={dropRef} className="border-2 border-dashed rounded-lg p-8 text-center text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                <p className="mb-2">拖拽图片到此处，或点击上方“选择图片”按钮</p>
                <p className="text-xs">支持 JPG、PNG、WebP、GIF，最大 4MB</p>
                {(chapterId || sectionId) && (
                  <div className="mt-3 text-xs text-slate-500">默认ID示例：img-{(sectionId || chapterId || 'global')}-001</div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="mb-1 block">自定义图片ID（可选）</Label>
                  <Input value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="img-..." />
                </div>
                <div>
                  <Label className="mb-1 block">Alt 文本</Label>
                  <Input value={customAlt} onChange={(e) => setCustomAlt(e.target.value)} placeholder="用于无障碍/SEO" />
                </div>
                <div>
                  <Label className="mb-1 block">用途</Label>
                  <Select value={customUsage} onValueChange={(v: any) => setCustomUsage(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">内容图片</SelectItem>
                      <SelectItem value="cover">封面图片</SelectItem>
                      <SelectItem value="diagram">图表</SelectItem>
                      <SelectItem value="illustration">插图</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}


