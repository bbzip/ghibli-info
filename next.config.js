/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

// 导入代理修复模块
require('./proxy-fix');

// 简化配置，移除可能冲突的代理设置
const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: ['replicate.delivery'],
  },
};

module.exports = nextConfig; 