import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 确保输出是独立的
  output: 'standalone',
  // 实验性功能
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['database'],
  },
};

export default nextConfig;
