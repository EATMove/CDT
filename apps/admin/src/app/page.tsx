'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { 
  BookOpen, 
  Image, 
  Users, 
  BarChart3, 
  Plus,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // 模拟数据
  const stats = {
    totalChapters: 9,
    totalImages: 3,
    totalUsers: 4,
    totalViews: 1250,
  };

  const recentChapters = [
    { id: 'ch-on-001', title: '安大略省交通标志和信号', province: 'ON', status: '已发布' },
    { id: 'ch-bc-001', title: 'BC省交通标志和信号', province: 'BC', status: '已发布' },
    { id: 'ch-ab-001', title: '阿尔伯塔省交通标志和信号', province: 'AB', status: '已发布' },
  ];

  const quickActions = [
    {
      title: '章节管理',
      description: '管理驾驶手册章节',
      icon: BookOpen,
      href: '/chapters',
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-slate-600 mt-2">加拿大驾考App - 内容管理系统</p>
      </div>

      {/* 导航栏 */}
      <Navigation />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">总章节数</p>
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">总图片数</p>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
              </div>
              <Image className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">注册用户</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">总浏览量</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近章节 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              最近章节
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{chapter.title}</h4>
                    <p className="text-sm text-slate-600">{chapter.province}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {chapter.status}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/content/edit?chapterId=${chapter.id}`}>
                        编辑
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">数据库连接</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">图片存储</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API服务</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">系统运行时间</span>
                <span className="text-sm text-slate-600">2天 14小时</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
