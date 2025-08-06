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
  // 服务器外部包配置
  serverExternalPackages: ['database'],
};

export default nextConfig;
