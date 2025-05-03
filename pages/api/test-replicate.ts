import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取 API 密钥
    const apiToken = process.env.REPLICATE_API_TOKEN || process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      return res.status(500).json({ 
        error: 'Replicate API token is missing. Please set REPLICATE_API_TOKEN in .env.local' 
      });
    }

    // 创建 Replicate 客户端
    const replicate = new Replicate({ auth: apiToken });
    
    // 发送一个简单的请求检查连接
    // 获取模型 owner/name 的两个部分
    const [owner, name] = "danila013/ghibli-easycontrol".split('/');
    const modelInfo = await replicate.models.get(owner, name);

    // 返回成功响应
    return res.status(200).json({ 
      success: true, 
      apiKeyConfigured: true,
      model: modelInfo 
    });
  } catch (error) {
    console.error('Error testing Replicate API:', error);
    
    // 返回错误信息
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
} 