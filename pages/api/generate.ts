import type { NextApiRequest, NextApiResponse } from 'next';
import { generateImage } from '../../utils/replicate';

interface GenerateRequestBody {
  imageUrl: string;
}

interface GenerateResponseSuccess {
  success: true;
  imageUrl: string;
}

interface GenerateResponseError {
  success: false;
  error: string;
  details?: any;
}

type GenerateResponse = GenerateResponseSuccess | GenerateResponseError;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body as GenerateRequestBody;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    // 确保 imageUrl 是一个有效的 URL
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid image URL format. Must be a data URL or http(s) URL.'
      });
    }

    // 打印一些调试信息
    console.log('Processing image generation request');
    console.log('Image URL length:', imageUrl.length);
    console.log('Image URL format:', imageUrl.startsWith('data:') ? 'Data URL' : 'HTTP URL');

    // Generate image using Replicate API
    const resultUrl = await generateImage(imageUrl);
    
    // 确保结果是一个有效的 URL
    if (!resultUrl || typeof resultUrl !== 'string') {
      console.error('Invalid result URL returned:', resultUrl);
      return res.status(500).json({ 
        success: false, 
        error: 'API returned invalid image URL',
        details: resultUrl 
      });
    }
    
    // 如果返回的是本地生成的图片URL，需要将其转换为绝对URL
    let finalImageUrl = resultUrl;
    if (resultUrl.startsWith('/generated/')) {
      // 使用请求的主机名构建完整URL
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      finalImageUrl = `${protocol}://${host}${resultUrl}`;
    } else if (!resultUrl.startsWith('http')) {
      console.error('Unsupported URL format returned:', resultUrl);
      return res.status(500).json({ 
        success: false, 
        error: 'API returned unsupported URL format',
        details: resultUrl 
      });
    }
    
    console.log('Successfully generated image:', finalImageUrl);
    
    // Return the result URL
    return res.status(200).json({
      success: true,
      imageUrl: finalImageUrl,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    });
  }
} 