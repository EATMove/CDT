'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Image, 
  Users, 
  BarChart3, 
  Plus,
  LogOut,
  User
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    {
      title: '章节管理',
      href: '/chapters',
      icon: BookOpen,
    },
    {
      title: '内容编辑',
      href: '/content',
      icon: Plus,
    },
    {
      title: '图片管理',
      href: '/images',
      icon: Image,
    },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b rounded-lg shadow-sm">
      {/* 左侧导航 */}
      <div className="flex items-center space-x-4">
        {navItems.map((item) => (
          <Button key={item.href} variant="ghost" asChild>
            <Link href={item.href} className="flex items-center space-x-2">
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* 右侧用户信息和登出 */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>管理员: {user.username}</span>
          </div>
        )}
        <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
          <LogOut className="w-4 h-4" />
          <span>登出</span>
        </Button>
      </div>
    </div>
  );
} 