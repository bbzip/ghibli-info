import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 创建测试用的二进制数据(PNG文件头 + 一些随机数据)
function createTestPngData(): Buffer {
  // PNG文件头
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    // IHDR块
    0x00, 0x00, 0x00, 0x0D, // 长度13字节
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // 宽度1像素
    0x00, 0x00, 0x00, 0x01, // 高度1像素
    0x08, // 位深度
    0x06, // 颜色类型
    0x00, // 压缩方法
    0x00, // 过滤方法
    0x00, // 隔行扫描方法
    0x1F, 0x15, 0xC4, 0x89 // CRC-32校验
  ]);

  // 一些像素数据
  const dataChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x01, // 长度1字节
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, // 压缩的数据
    0x1D, 0x01, 0x82, 0x78 // CRC-32校验
  ]);

  // 结束标志
  const endChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // 长度0字节
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82 // CRC-32校验
  ]);

  return Buffer.concat([pngHeader, dataChunk, endChunk]);
}

// 将Buffer转换为ReadableStream
function bufferToStream(buffer: Buffer): ReadableStream {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null); // 表示流结束
  
  // 由于Node.js的Readable不直接与Web标准的ReadableStream兼容，
  // 这里我们创建一个适配器
  return new ReadableStream({
    start(controller) {
      readable.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      readable.on('end', () => {
        controller.close();
      });
      readable.on('error', (err) => {
        controller.error(err);
      });
    }
  });
}

// 将 stream 转换为 Buffer (来自replicate.ts)
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  // 合并所有块到一个 Buffer
  return Buffer.concat(chunks);
}

// 将 Buffer 保存为文件并返回公共 URL (来自replicate.ts)
async function saveBinaryToFile(buffer: Buffer): Promise<string> {
  try {
    // 创建 public/generated 目录（如果不存在）
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 生成唯一文件名
    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(outputDir, fileName);
    
    // 写入文件
    fs.writeFileSync(filePath, buffer);
    
    // 返回相对 URL
    return `/generated/${fileName}`;
  } catch (error) {
    console.error('保存文件失败:', error);
    throw new Error('保存生成的图像文件失败');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 创建测试PNG数据并转换为流
    const testData = createTestPngData();
    const stream = bufferToStream(testData);
    
    // 使用本地实现的函数
    const buffer = await streamToBuffer(stream);
    const fileUrl = await saveBinaryToFile(buffer);
    
    res.status(200).json({ 
      success: true, 
      message: '成功处理二进制数据', 
      inputSize: testData.length,
      outputSize: buffer.length,
      fileUrl 
    });
  } catch (error) {
    console.error('测试二进制处理失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    });
  }
} 