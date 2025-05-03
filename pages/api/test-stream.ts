import type { NextApiRequest, NextApiResponse } from 'next';

// 模拟 ReadableStream 返回的处理函数
function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  
  return new Promise((resolve, reject) => {
    function processText({ done, value }: ReadableStreamReadResult<Uint8Array>): void {
      if (done) {
        resolve(result);
        return;
      }
      
      // 将 Uint8Array 转换为字符串
      const decoder = new TextDecoder();
      result += decoder.decode(value, { stream: true });
      
      // 继续读取
      reader.read().then(processText).catch(reject);
    }
    
    reader.read().then(processText).catch(reject);
  });
}

// 创建一个简单的 ReadableStream
function createMockStream(text: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // 将字符串转换为 Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // 将数据推送到流
      controller.enqueue(data);
      
      // 结束流
      controller.close();
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 创建一个模拟的图像URL响应流
    const mockUrl = "https://replicate.delivery/example/image.jpg";
    const stream = createMockStream(mockUrl);
    
    console.log("创建了模拟流");
    
    // 将流转换为字符串
    const result = await streamToString(stream);
    
    console.log("流转换结果:", result);
    
    // 检查结果是否与预期相符
    if (result === mockUrl) {
      return res.status(200).json({
        success: true,
        message: "成功处理流并提取URL",
        originalUrl: mockUrl,
        extractedUrl: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "流处理错误：提取的URL与预期不符",
        originalUrl: mockUrl,
        extractedUrl: result
      });
    }
  } catch (error) {
    console.error("测试流处理时出错:", error);
    return res.status(500).json({
      success: false,
      message: "处理流时出错",
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 