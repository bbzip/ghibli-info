#!/bin/bash
# 添加所有可能的代理环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export ALL_PROXY=socks5://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1
export no_proxy=localhost,127.0.0.1

# 验证代理有效性
echo "正在验证代理是否有效..."
curl -s --proxy http://127.0.0.1:7890 https://www.google.com > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ 代理连接正常，可以访问 Google"
else
  echo "❌ 代理连接失败，请检查 ClashX 是否启动并配置正确"
  exit 1
fi

# 停止已运行的 Node.js 进程
echo "停止已运行的 Node.js 进程..."
pkill -f "node" || true

# 清除缓存
echo "清除缓存..."
rm -rf .next/cache

# 启动开发服务器
echo "启动服务器..."
NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev 