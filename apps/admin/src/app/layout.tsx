import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "加拿大驾考App - 管理后台",
  description: "加拿大驾考App内容管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
