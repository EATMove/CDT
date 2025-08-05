'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Copy, Eye, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsage, setFilterUsage] = useState<string>(defaultUsage || 'all');
  const [isOpen, setIsOpen] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 当上下文变化时重新加载图片
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [chapterId, sectionId, isOpen]);

  // 加载图片列表
  const loadImages = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      
      // 优先使用上下文API获取相关图片
      if (chapterId || sectionId) {
        if (sectionId) {
          params.append('sectionId', sectionId);
        } else if (chapterId) {
          params.append('chapterId', chapterId);
        }
        
        // 包含最近上传的图片
        params.append('includeRecent', 'true');
        
        const response = await fetch(`/api/images/context?${params}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // 合并上下文图片、最近图片和建议图片
            const allImages = [
              ...(result.data.contextImages || []),
              ...(result.data.recentImages || []),
              ...(result.data.suggestions || [])
            ];
            
            // 去重（基于id）
            const uniqueImages = allImages.filter((image, index, array) => 
              array.findIndex(img => img.id === image.id) === index
            );
            
            setImages(uniqueImages);
          } else {
            toast.error(result.message || '加载图片列表失败');
          }
        } else {
          toast.error('加载图片列表失败');
        }
      } else {
        // 没有上下文时，使用普通图片列表API
        params.append('contextOnly', 'false');
        
        const response = await fetch(`/api/images?${params}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setImages(result.data.data || []);
          } else {
            toast.error(result.message || '加载图片列表失败');
          }
        } else {
          toast.error('加载图片列表失败');
        }
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
        formData.append('altText', file.name);
        
        // 添加上下文关联信息
        if (sectionId) {
          formData.append('sectionId', sectionId);
          formData.append('usage', defaultUsage || 'content');
        } else if (chapterId) {
          formData.append('chapterId', chapterId);
          formData.append('usage', defaultUsage || 'content');
        }

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

  // 当对话框打开时加载图片
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>选择图片</DialogTitle>
            {(chapterId || sectionId) && (
              <div className="text-sm text-slate-600 bg-blue-50 px-2 py-1 rounded">
                📁 {sectionId ? `段落内容` : `章节内容`}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* 操作栏 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button onClick={handleImageUpload} disabled={uploading} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? '上传中...' : '上传图片'}
            </Button>

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
          </div>

          {/* 图片网格 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">加载中...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="relative group">
                      <img
                        src={image.fileUrl}
                        alt={image.altText || image.originalName}
                        className="w-full h-32 object-cover"
                        onClick={() => handleSelectImage(image)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(image.fileUrl);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectImage(image);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <h3 className="font-medium text-xs truncate" title={image.originalName}>
                          {image.originalName}
                        </h3>
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
      </DialogContent>
    </Dialog>
  );
} 