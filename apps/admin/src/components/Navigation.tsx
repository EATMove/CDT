'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  BookOpen, 
  Image, 
  Edit3, 
  Users, 
  Settings, 
  Database,
  BarChart3
} from 'lucide-react';

const navigationItems = [
  {
    name: '仪表板',
    href: '/',
    icon: Home,
  },
  {
    name: '章节管理',
    href: '/chapters',
    icon: BookOpen,
  },
  {
    name: '内容编辑',
    href: '/content/edit',
    icon: Edit3,
  },
  {
    name: '图片管理',
    href: '/images',
    icon: Image,
  },
  {
    name: '用户管理',
    href: '/users',
    icon: Users,
  },
  {
    name: '数据统计',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: '系统设置',
    href: '/settings',
    icon: Settings,
  },
  {
    name: '数据库',
    href: '/database',
    icon: Database,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <Card className="p-4">
      <nav className="flex flex-wrap gap-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            </Button>
          );
        })}
      </nav>
    </Card>
  );
} 