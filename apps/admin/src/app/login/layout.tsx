import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 加拿大驾考App管理后台",
  description: "管理员登录",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 