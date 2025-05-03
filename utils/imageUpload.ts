// Convert a file to a data URL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convert a data URL to an image element
export const dataUrlToImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

// Resize an image to the specified dimensions while maintaining aspect ratio
export const resizeImage = async (
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> => {
  const dataUrl = await fileToDataUrl(file);
  const img = await dataUrlToImage(dataUrl);
  
  // Calculate new dimensions while maintaining aspect ratio
  let width = img.width;
  let height = img.height;
  
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }
  
  // Create canvas with the desired dimensions
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Draw the image onto the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/jpeg', quality);
};

// Validate file type and size
export const validateImage = (file: File): { valid: boolean, message?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'Image size should be less than 5MB'
    };
  }
  
  return { valid: true };
};

// Generate image with specific aspect ratio for different platforms
export const generatePlatformImage = async (
  imageUrl: string,
  platform: 'instagram' | 'pinterest' | 'xiaohongshu' | 'wechat',
  text?: string
): Promise<string> => {
  // Load the image
  const img = await dataUrlToImage(imageUrl);
  
  // Define dimensions based on platform
  let width, height;
  switch (platform) {
    case 'instagram':
      width = 1080;
      height = 1920; // 9:16 aspect ratio
      break;
    case 'pinterest':
      width = 1000;
      height = 1500; // 2:3 aspect ratio
      break;
    case 'xiaohongshu':
    case 'wechat':
      width = 1080;
      height = 1440; // 3:4 aspect ratio
      break;
    default:
      width = 1080;
      height = 1080; // Square by default
  }
  
  // Create canvas with the desired dimensions
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Get the canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Fill the background with a color (optional)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Calculate dimensions to fit the image while maintaining aspect ratio
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  
  let drawWidth, drawHeight, x, y;
  
  if (imgRatio > canvasRatio) {
    // Image is wider than canvas
    drawHeight = height;
    drawWidth = height * imgRatio;
    x = (width - drawWidth) / 2;
    y = 0;
  } else {
    // Image is taller than canvas
    drawWidth = width;
    drawHeight = width / imgRatio;
    x = 0;
    y = (height - drawHeight) / 2;
  }
  
  // Draw the image centered
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
  
  // Add text if provided
  if (text) {
    // Configure text style
    ctx.font = '32px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    
    // Position the text at the bottom with padding
    const textY = height - 60;
    
    // Draw text stroke
    ctx.strokeText(text, width / 2, textY, width - 40);
    
    // Draw text fill
    ctx.fillText(text, width / 2, textY, width - 40);
  }
  
  // Return the canvas as a data URL
  return canvas.toDataURL('image/jpeg', 0.9);
}; 