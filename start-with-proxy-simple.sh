#!/bin/bash
# 设置HTTP代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 验证代理有效性
echo "正在验证代理是否有效..."
curl -s --proxy http://127.0.0.1:7890 https://www.google.com > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ 代理连接正常"
else
  echo "❌ 代理连接失败，请检查 ClashX 是否启动"
  exit 1
fi

# 停止已运行的 Node.js 进程
echo "停止已运行的进程..."
pkill -f "node" || true

# 清理缓存
echo "清理缓存..."
rm -rf .next/cache
rm -rf node_modules/.cache

# 启动开发服务器
echo "启动服务器..."
npm run dev 