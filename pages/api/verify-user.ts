import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 用于存储 IP 哈希到使用次数的映射
const ipHashUsageMap = new Map<string, number>();

// 这应该替换为服务器端存储或数据库
// 在生产环境中，这会在服务器重启时重置，仅用于演示
type ApiResponse = {
  verified: boolean;
  remainingFree?: number;
  ipHash?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ verified: false });
  }

  // 获取用户的 IP 地址
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) 
    : req.socket.remoteAddress || '0.0.0.0';
  
  // 使用密钥对 IP 进行哈希处理，以保护用户隐私
  // 在生产环境中，应该使用环境变量存储密钥
  const secretKey = 'your-secret-key-for-ip-hashing';
  const ipHash = crypto.createHmac('sha256', secretKey)
    .update(ip)
    .digest('hex');

  // 检查此 IP 是否已达到免费使用限制
  const usageCount = ipHashUsageMap.get(ipHash) || 0;
  const FREE_QUOTA = 2;
  
  if (usageCount >= FREE_QUOTA) {
    // 已达到限制
    return res.status(200).json({ 
      verified: true,
      remainingFree: 0,
      ipHash 
    });
  }
  
  // 还有免费次数
  return res.status(200).json({ 
    verified: true, 
    remainingFree: FREE_QUOTA - usageCount,
    ipHash
  });
} 