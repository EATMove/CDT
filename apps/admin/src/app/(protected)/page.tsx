'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-slate-600 mt-2">加拿大驾考App - 内容管理系统</p>
      </div>

      {/* 导航栏 */}
      <Navigation />

      {/* 快捷入口，仅保留章节管理 */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              章节管理
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-slate-600">管理驾驶手册章节与段落</div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/chapters">进入章节管理</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/chapters">新建章节</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
