'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Tablet, Monitor, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import HtmlRenderer from './HtmlRenderer';

interface ContentPreviewProps {
  content: string;
  device: 'mobile' | 'tablet' | 'desktop';
  onDeviceChange: (device: 'mobile' | 'tablet' | 'desktop') => void;
}

export default function ContentPreview({ content, device, onDeviceChange }: ContentPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // 强制刷新预览
  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 获取设备尺寸
  const getDeviceDimensions = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: 'auto' };
      default:
        return { width: '100%', height: 'auto' };
    }
  };

  const dimensions = getDeviceDimensions();

  // 获取设备宽度
  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
        return 800;
      default:
        return 800;
    }
  };

  return (
    <Card className={`flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} style={{ minHeight: '700px' }}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5" />
            实时预览
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">设备：</span>
            <Button
              variant={device === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('mobile')}
              title="移动端预览"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('tablet')}
              title="平板预览"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={device === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('desktop')}
              title="桌面预览"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-slate-300 mx-2" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              title="刷新预览"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? '退出全屏' : '全屏预览'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full border-t bg-white overflow-hidden">
          <div className="h-full overflow-auto bg-gray-50">
            <div className="bg-slate-100 p-2 text-sm text-slate-600 text-center sticky top-0 z-10 flex-shrink-0 border-b">
              📱 {device === 'mobile' ? '移动端' : device === 'tablet' ? '平板' : '桌面端'} 预览效果
              <span className="ml-2 text-xs">
                ({dimensions.width} × {dimensions.height})
              </span>
            </div>
            
            <div className="bg-white p-4">
              <div 
                className="mx-auto"
                style={{
                  maxWidth: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
                  margin: '0 auto'
                }}
              >
                <HtmlRenderer
                  key={previewKey}
                  html={content}
                  width={getDeviceWidth()}
                  baseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
