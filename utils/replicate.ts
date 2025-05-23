import Replicate from "replicate";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// 最新模型版本 ID
const MODEL_VERSION = "danila013/ghibli-easycontrol:6c4785d791d08ec65ff2ca5e9a7a0c2b0ac4e07ffadfb367231aa16bc7a52cbb";

// Replicate API 可能返回的输出类型
type ReplicateOutput = string | ReadableStream | any[] | Record<string, any>;

// 创建 Supabase 客户端
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials are not set. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// 检查 Supabase 错误并提供更详细的错误消息
const handleSupabaseError = (error: any): string => {
  if (error?.message?.includes('Permission denied')) {
    return '权限不足，请确认 Supabase Service Role Key 拥有足够权限';
  }
  
  if (error?.message?.includes('authentication failed')) {
    return '认证失败，请检查 Supabase URL 和 Service Role Key 是否正确';
  }
  
  if (error?.message?.includes('bucket not found')) {
    return '存储桶不存在，且自动创建失败';
  }
  
  if (error?.message?.includes('rate limit')) {
    return '请求频率超过 Supabase 限制，请稍后再试';
  }
  
  return error?.message || '上传到 Supabase 时发生未知错误';
};

// 创建 Replicate 实例
const getReplicate = () => {
  // 在服务器端可以使用 process.env，在客户端需要使用 NEXT_PUBLIC_ 前缀
  const apiToken = process.env.REPLICATE_API_TOKEN || process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error('Replicate API token is not set. Please set REPLICATE_API_TOKEN environment variable.');
  }
  
  return new Replicate({
    auth: apiToken,
  });
};

// 简单的日志函数
const logOutput = (message: string, data: any) => {
  console.log(message);
  try {
    if (typeof data === 'string' || data instanceof Uint8Array) {
      console.log(`${typeof data}, length: ${data.length}`);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('无法序列化:', typeof data);
  }
};

// 将 stream 转换为 Buffer
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

// 将 Buffer 上传到 Supabase Storage 并返回公共 URL
async function uploadBufferToSupabase(buffer: Buffer): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    const fileName = `ghibli/${uuidv4()}.png`;
    const bucketName = 'generated-images';
    
    console.log(`正在上传文件到 Supabase Storage: ${bucketName}/${fileName}`);
    
    // 检查 bucket 是否存在，不存在则创建
    try {
      const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
      
      if (listBucketsError) {
        console.error('获取 buckets 列表失败:', listBucketsError);
        throw new Error(handleSupabaseError(listBucketsError));
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket "${bucketName}" 不存在，正在创建...`);
        const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,  // 设置为公开访问
          fileSizeLimit: 5 * 1024 * 1024,  // 5MB 限制
        });
        
        if (createBucketError) {
          console.error('创建 bucket 失败:', createBucketError);
          throw new Error(handleSupabaseError(createBucketError));
        }
        console.log(`Bucket "${bucketName}" 创建成功`);
      }
    } catch (error: any) {
      if (error.message.includes('not have permission')) {
        // 如果没有权限创建 bucket，继续尝试上传（bucket 可能已存在）
        console.log('无权限列出或创建 bucket，尝试直接上传...');
      } else {
        throw error;
      }
    }
    
    // 上传文件到 Supabase
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('上传到 Supabase 失败:', error);
      throw new Error(handleSupabaseError(error));
    }
    
    // 获取公共 URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('获取公共 URL 失败，请检查 bucket 权限设置');
    }
    
    console.log('上传成功，公共 URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('上传图像到 Supabase 失败:', error);
    if (error instanceof Error) {
      throw error; // 重新抛出已处理的错误
    }
    throw new Error('上传生成的图像到 Supabase 失败');
  }
}

// 处理二进制图像数据
async function handleBinaryImage(stream: ReadableStream): Promise<string> {
  console.log('处理二进制图像数据...');
  
  try {
    // 将流转换为 Buffer
    const buffer = await streamToBuffer(stream);
    console.log(`接收到二进制数据，大小: ${buffer.length} 字节`);
    
    // 检查数据是否是有效的 PNG（简单检查 PNG 签名）
    if (buffer.length >= 8 && 
        buffer[0] === 0x89 && 
        buffer[1] === 0x50 && 
        buffer[2] === 0x4E && 
        buffer[3] === 0x47) {
      console.log('识别到有效的 PNG 数据');
    } else {
      console.log('警告：数据不是标准 PNG 格式');
    }
    
    // 上传 Buffer 到 Supabase 并返回公共 URL
    return await uploadBufferToSupabase(buffer);
  } catch (error) {
    console.error('处理二进制数据失败:', error);
    throw new Error('处理图像数据失败');
  }
}

// 从二进制数据创建 Buffer
function createBufferFromBinary(data: any): Buffer {
  if (data instanceof Uint8Array) {
    return Buffer.from(data.buffer);
  } else if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  } else {
    // 尝试作为字符串处理
    return Buffer.from(String(data), 'binary');
  }
}

// 运行模型并生成图片 - 完全按照官方示例实现
export const generateImage = async (imageUrl: string): Promise<string> => {
  try {
    const replicate = getReplicate();
    
    // 构建输入参数 - 精确匹配官方示例
    // const input = {
    //   input_image: imageUrl
    // };
    const input = {
      seed: -1,
      prompt: "Ghibli Studio style, Charming hand-drawn anime-style illustration",
      // prompt: "Ghibli Studio style, cozy room, warm lighting, soft shadows, hand-painted look, similar to My Neighbor Totoro",
      input_image: imageUrl,
      lora_weight: 1,
      guidance_scale: 3.5,
      num_inference_steps: 25

    };

    logOutput('发送请求到 Replicate API:', input);
    
    // 按照官方示例调用 API - 显式转换返回类型
    const output = await replicate.run(MODEL_VERSION, { input }) as ReplicateOutput;
    
    logOutput('收到 Replicate API 响应类型:', typeof output);
    
    // 处理不同类型的输出
    if (typeof output === 'string') {
      // 记录字符串开头，便于调试
      console.log('字符串响应的开头:', output.substring(0, Math.min(50, output.length)));
      
      // 如果是 URL 字符串
      if (output.startsWith('http')) {
        return output;
      }
      
      // 如果是 base64 字符串
      if (output.startsWith('data:image')) {
        // 解码 base64
        const base64Data = output.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        return await uploadBufferToSupabase(buffer);
      }
      
      // 尝试将字符串作为原始图像数据处理
      try {
        const buffer = Buffer.from(output, 'binary');
        return await uploadBufferToSupabase(buffer);
      } catch (e) {
        console.error('无法将字符串转换为图像:', e);
      }
      
      throw new Error(`无效的字符串响应格式`);
    } else if (output instanceof ReadableStream) {
      console.log('响应是 ReadableStream，处理二进制数据');
      return await handleBinaryImage(output);
    } else if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      
      if (typeof firstItem === 'string') {
        if (firstItem.startsWith('http')) {
          return firstItem;
        }
        
        // 尝试将字符串作为图像数据处理
        try {
          const buffer = Buffer.from(firstItem, 'binary');
          return await uploadBufferToSupabase(buffer);
        } catch (e) {
          console.error('无法将数组字符串转换为图像:', e);
        }
      }
      
      // 如果第一个元素是 ReadableStream
      if (firstItem instanceof ReadableStream) {
        return await handleBinaryImage(firstItem);
      }
      
      // 尝试作为二进制数据处理
      try {
        const buffer = createBufferFromBinary(firstItem);
        return await uploadBufferToSupabase(buffer);
      } catch (e) {
        console.error('无法将数组元素转换为图像:', e);
      }
      
      throw new Error(`无法处理数组响应`);
    } else if (output && typeof output === 'object') {
      // 检查常见的响应格式
      const obj = output as Record<string, any>;
      
      if (obj.output) {
        if (typeof obj.output === 'string') {
          if (obj.output.startsWith('http')) {
            return obj.output;
          }
          
          // 尝试将字符串作为图像数据处理
          try {
            const buffer = Buffer.from(obj.output, 'binary');
            return await uploadBufferToSupabase(buffer);
          } catch (e) {
            console.error('无法将对象字符串转换为图像:', e);
          }
        }
        
        if (Array.isArray(obj.output) && obj.output.length > 0) {
          const firstOutput = obj.output[0];
          if (typeof firstOutput === 'string') {
            if (firstOutput.startsWith('http')) {
              return firstOutput;
            }
            
            // 尝试将字符串作为图像数据处理
            try {
              const buffer = Buffer.from(firstOutput, 'binary');
              return await uploadBufferToSupabase(buffer);
            } catch (e) {
              console.error('无法将对象数组字符串转换为图像:', e);
            }
          }
          
          // 如果第一个元素是 ReadableStream
          if (firstOutput instanceof ReadableStream) {
            return await handleBinaryImage(firstOutput);
          }
          
          // 尝试作为二进制数据处理
          try {
            const buffer = createBufferFromBinary(firstOutput);
            return await uploadBufferToSupabase(buffer);
          } catch (e) {
            console.error('无法将对象数组元素转换为图像:', e);
          }
        }
        
        // 尝试 output 本身作为二进制数据
        try {
          const buffer = createBufferFromBinary(obj.output);
          return await uploadBufferToSupabase(buffer);
        } catch (e) {
          console.error('无法将 output 转换为图像:', e);
        }
      }
      
      // 如果对象本身是二进制数据
      if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
        try {
          const buffer = createBufferFromBinary(obj);
          return await uploadBufferToSupabase(buffer);
        } catch (e) {
          console.error('无法将对象转换为图像:', e);
        }
      }
      
      throw new Error(`无法处理对象响应`);
    }
    
    throw new Error('Replicate API 返回了不支持的输出格式');
  } catch (error) {
    console.error('生成图像时出错:', error);
    throw error;
  }
}; 