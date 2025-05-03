import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 用于存储 IP 哈希到使用次数的映射
// 在实际生产环境中，这应该使用持久化存储如数据库
const ipHashUsageMap = new Map<string, number>();

// 类型定义
type RequestBody = {
  ipHash?: string;
};

type ApiResponse = {
  success: boolean;
  newUsageCount?: number;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 提取请求中的 IP 哈希
  const { ipHash } = req.body as RequestBody;

  if (!ipHash) {
    // 没有提供 IP 哈希时，获取当前 IP 并生成哈希
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) 
      : req.socket.remoteAddress || '0.0.0.0';
    
    // 使用密钥对 IP 进行哈希处理
    const secretKey = 'your-secret-key-for-ip-hashing';
    const generatedIpHash = crypto.createHmac('sha256', secretKey)
      .update(ip)
      .digest('hex');
    
    // 增加使用次数
    const currentCount = ipHashUsageMap.get(generatedIpHash) || 0;
    ipHashUsageMap.set(generatedIpHash, currentCount + 1);
    
    return res.status(200).json({ 
      success: true, 
      newUsageCount: currentCount + 1
    });
  }

  // 使用提供的 IP 哈希增加使用次数
  const currentCount = ipHashUsageMap.get(ipHash) || 0;
  ipHashUsageMap.set(ipHash, currentCount + 1);
  
  return res.status(200).json({ 
    success: true, 
    newUsageCount: currentCount + 1
  });
} 