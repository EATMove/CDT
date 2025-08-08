'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, ArrowLeft, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type UsageType = 'content' | 'cover' | 'diagram' | 'illustration';

interface UploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: any;
}

export default function ImagesUploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sectionIdFromQuery = searchParams.get('sectionId') || '';
  const chapterIdFromQuery = searchParams.get('chapterId') || '';

  const [items, setItems] = useState<UploadItem[]>([]);
  const [altText, setAltText] = useState('');
  const [customId, setCustomId] = useState('');
  const [usage, setUsage] = useState<UsageType>('content');
  const [chapterId, setChapterId] = useState(chapterIdFromQuery);
  const [sectionId, setSectionId] = useState(sectionIdFromQuery);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const canStart = items.length > 0 && !isUploading;

  useEffect(() => {
    setChapterId(chapterIdFromQuery);
    setSectionId(sectionIdFromQuery);
  }, [chapterIdFromQuery, sectionIdFromQuery]);

  // 拖拽上传
  useEffect(() => {
    const node = dropRef.current;
    if (!node) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => {
      prevent(e);
      if (!e.dataTransfer) return;
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length === 0) return;
      setItems(prev => [...prev, ...files.map((file) => ({ file, status: 'pending' as const }))]);
    };
    ['dragenter','dragover','dragleave','drop'].forEach(evt => node.addEventListener(evt, prevent as any));
    node.addEventListener('drop', handleDrop as any);
    return () => {
      ['dragenter','dragover','dragleave','drop'].forEach(evt => node.removeEventListener(evt, prevent as any));
      node.removeEventListener('drop', handleDrop as any);
    };
  }, []);

  const onPickFiles = () => fileInputRef.current?.click();

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files) return;
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setItems(prev => [...prev, ...list.map((file) => ({ file, status: 'pending' as const }))]);
    e.currentTarget.value = '';
  };

  const removeItem = (index: number) => {
    if (isUploading) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (isUploading) return;
    setItems([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startUpload = async () => {
    if (items.length === 0) return;
    setIsUploading(true);
    const next = [...items];

    for (let i = 0; i < next.length; i += 1) {
      const item = next[i];
      if (item.status !== 'pending') continue;
      next[i] = { ...item, status: 'uploading' };
      setItems([...next]);

      try {
        const formData = new FormData();
        formData.append('file', item.file);
        if (altText) formData.append('altText', altText);
        if (customId) formData.append('id', customId);
        if (sectionId) {
          formData.append('sectionId', sectionId);
          formData.append('usage', usage);
        } else if (chapterId) {
          formData.append('chapterId', chapterId);
          formData.append('usage', usage);
        } else {
          formData.append('usage', usage);
        }

        const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || '上传失败');
        }
        const data = await res.json();
        next[i] = { ...next[i], status: 'success', response: data };
        setItems([...next]);
      } catch (err) {
        next[i] = { ...next[i], status: 'error', error: err instanceof Error ? err.message : '上传失败' };
        setItems([...next]);
      }
    }

    setIsUploading(false);
    const okCount = next.filter(it => it.status === 'success').length;
    if (okCount > 0) toast.success(`成功上传 ${okCount} 张图片`);
  };

  const allDone = items.length > 0 && items.every(it => it.status !== 'pending' && it.status !== 'uploading');

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/images">
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回图片管理
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">上传图片</h1>
            <p className="text-slate-600 mt-1">将上传与选择/管理分离：在此批量上传并设置元数据</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>上传设置</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1 block">自定义图片ID（可选）</Label>
            <Input placeholder="img-..." value={customId} onChange={(e) => setCustomId(e.target.value)} />
            <div className="text-xs text-slate-500 mt-1">不填将自动生成：img-{`{sectionId|chapterId|global}`}-xxx</div>
          </div>
          <div>
            <Label className="mb-1 block">Alt 文本</Label>
            <Input placeholder="用于无障碍/SEO" value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">用途</Label>
            <Select value={usage} onValueChange={(v: UsageType) => setUsage(v)}>
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
          <div>
            <Label className="mb-1 block">关联章节ID（可选）</Label>
            <Input placeholder="ch-... 或自定义" value={chapterId} onChange={(e) => setChapterId(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">关联段落ID（可选）</Label>
            <Input placeholder="sec-..." value={sectionId} onChange={(e) => setSectionId(e.target.value)} />
            <div className="text-xs text-slate-500 mt-1">若同时填写，以段落ID为准</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>选择文件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Button onClick={onPickFiles}>
                <Upload className="w-4 h-4 mr-2" /> 选择图片
              </Button>
              <Button variant="outline" onClick={clearAll} disabled={items.length === 0 || isUploading}>
                <Trash2 className="w-4 h-4 mr-2" /> 清空列表
              </Button>
              <div className="text-sm text-slate-600">支持 JPG、PNG、WebP、GIF，单文件最大 4MB</div>
            </div>

            <div ref={dropRef} className="border-2 border-dashed rounded-lg p-8 text-center text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
              将图片拖拽到此处，或点击上方“选择图片”
            </div>

            {items.length > 0 && (
              <div className="mt-6 space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img src={URL.createObjectURL(it.file)} alt={it.file.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-medium truncate max-w-[220px]" title={it.file.name}>{it.file.name}</div>
                        <div className="text-xs text-slate-500">{formatFileSize(it.file.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {it.status === 'pending' && <span className="text-xs text-slate-500">待上传</span>}
                      {it.status === 'uploading' && <span className="text-xs text-blue-600">上传中...</span>}
                      {it.status === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 成功</span>}
                      {it.status === 'error' && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> 失败</span>}
                      <Button size="sm" variant="ghost" onClick={() => removeItem(idx)} disabled={isUploading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>执行</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled={!canStart} onClick={startUpload}>
              {isUploading ? '上传中...' : '开始上传'}
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push('/images')}>
              返回图片管理
            </Button>
            {allDone && (
              <div className="text-xs text-slate-600">提示：你可以返回图片管理或继续添加更多文件。</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


