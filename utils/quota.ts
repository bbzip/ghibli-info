import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// Cookie names
const USER_ID_COOKIE = 'ghibli_user_id';
const USAGE_COUNT_COOKIE = 'ghibli_usage_count';
const CREDITS_COOKIE = 'ghibli_credits';
const IP_HASH_COOKIE = 'ghibli_ip_hash'; // 存储IP哈希值

// Quota constants
export const FREE_QUOTA = 2; // 新用户获得2次免费生成机会
const TEST_MODE = false; // Set to false in production

// Get or create user ID (for visitor tracking)
export const getUserId = (): string => {
  let userId = Cookies.get(USER_ID_COOKIE);
  
  if (!userId) {
    userId = uuidv4();
    Cookies.set(USER_ID_COOKIE, userId, { expires: 365 }); // 1 year expiry
  }
  
  return userId;
};

// 设置IP哈希值（需要在API端调用）
export const setIpHash = (ipHash: string): void => {
  Cookies.set(IP_HASH_COOKIE, ipHash, { expires: 365 });
};

// 获取存储的IP哈希值
export const getIpHash = (): string | undefined => {
  return Cookies.get(IP_HASH_COOKIE);
};

// Get the current usage count
export const getUsageCount = (): number => {
  // If in test mode, always return 0, indicating no usage
  if (TEST_MODE) return 0;
  
  const count = Cookies.get(USAGE_COUNT_COOKIE);
  return count ? parseInt(count, 10) : 0;
};

// Get the current credit count
export const getCredits = (): number => {
  const credits = Cookies.get(CREDITS_COOKIE);
  return credits ? parseInt(credits, 10) : 0;
};

// Add credits (after purchase)
export const addCredits = (amount: number): number => {
  const currentCredits = getCredits();
  const newCredits = currentCredits + amount;
  
  Cookies.set(CREDITS_COOKIE, newCredits.toString(), { expires: 365 });
  
  return newCredits;
};

// Increment usage count for visitor
export const incrementUsage = (): void => {
  // In test mode, don't increment usage
  if (TEST_MODE) return;
  
  const currentFreeRemaining = getRemainingFreeGenerations();
  const currentCredits = getCredits();
  
  // 优先使用免费次数，如果没有免费次数则使用积分
  if (currentFreeRemaining > 0) {
    const currentCount = getUsageCount();
    const newCount = currentCount + 1;
    Cookies.set(USAGE_COUNT_COOKIE, newCount.toString(), { expires: 365 });
  } else if (currentCredits > 0) {
    // 使用积分
    Cookies.set(CREDITS_COOKIE, (currentCredits - 1).toString(), { expires: 365 });
  }
};

// Check if visitor can generate more images
export const canGenerate = (): boolean => {
  // In test mode, always allow generation
  if (TEST_MODE) return true;
  
  const currentCount = getUsageCount();
  const currentCredits = getCredits();
  
  // Free generation available or has credits
  return currentCount < FREE_QUOTA || currentCredits > 0;
};

// Get remaining free generations
export const getRemainingFreeGenerations = (): number => {
  // In test mode, return maximum value
  if (TEST_MODE) return FREE_QUOTA;
  
  const currentCount = getUsageCount();
  
  // Each visitor gets FREE_QUOTA free generations
  return Math.max(0, FREE_QUOTA - currentCount);
};

// Get total remaining generations (free + credits)
export const getTotalRemainingGenerations = (): number => {
  const freeRemaining = getRemainingFreeGenerations();
  const credits = getCredits();
  
  return freeRemaining + credits;
};

// For admin or testing purposes
export const resetQuota = (): void => {
  Cookies.set(USAGE_COUNT_COOKIE, '0', { expires: 365 });
}; 