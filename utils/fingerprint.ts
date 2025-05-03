import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedFingerprint: string | null = null;

// 获取设备指纹
export const getDeviceFingerprint = async (): Promise<string> => {
  // 如果已缓存，直接返回
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    // 加载 FingerprintJS 库
    const fp = await FingerprintJS.load();
    
    // 生成设备指纹
    const result = await fp.get();
    
    // 指纹是一个可靠的设备标识符
    const fingerprint = result.visitorId;
    
    // 缓存结果
    cachedFingerprint = fingerprint;
    
    return fingerprint;
  } catch (error) {
    console.error('获取设备指纹失败:', error);
    // 返回一个随机值作为后备方案
    return Math.random().toString(36).substring(2);
  }
};

// 检查存储的设备指纹
export const getStoredFingerprint = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('device_fingerprint');
  }
  return null;
};

// 存储设备指纹
export const storeFingerprint = (fingerprint: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('device_fingerprint', fingerprint);
  }
}; 