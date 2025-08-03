'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Search, Filter, Download, Trash2, Eye, Copy } from 'lucide-react';
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 加载图片列表
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
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
          throw new Error('上传失败');
        }

        return await response.json();
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
        toast.success('图片删除成功');
        loadImages();
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
        toast.success('批量删除成功');
        setSelectedImages([]);
        loadImages();
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

            {selectedImages.length > 0 && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedImages.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 图片网格 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative group">
                <img
                  src={image.fileUrl}
                  alt={image.altText || image.originalName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(image.fileUrl)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedImages([...selectedImages, image.id]);
                    } else {
                      setSelectedImages(selectedImages.filter(id => id !== image.id));
                    }
                  }}
                  className="absolute top-2 left-2"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm truncate" title={image.originalName}>
                    {image.originalName}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>大小: {formatFileSize(image.fileSize)}</p>
                    <p>尺寸: {image.width} × {image.height}</p>
                    <p>用途: {image.usage}</p>
                    <p>上传: {new Date(image.createdAt).toLocaleDateString()}</p>
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