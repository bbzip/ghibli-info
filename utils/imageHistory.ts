import dayjs from 'dayjs';

export interface ImageRecord {
  id: string;
  originalUrl: string;
  generatedUrl: string;
  timestamp: number;
  background?: string;
}

const STORAGE_KEY = 'ghibli_generated_images';

// Get all image records from localStorage
export const getImageHistory = (): ImageRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving image history:', error);
    return [];
  }
};

// Add a new image record to localStorage
export const addImageToHistory = (originalUrl: string, generatedUrl: string, background?: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getImageHistory();
    const newRecord: ImageRecord = {
      id: generateId(),
      originalUrl,
      generatedUrl,
      timestamp: Date.now(),
      background,
    };
    
    // Add to the beginning of the array (newest first)
    history.unshift(newRecord);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding image to history:', error);
  }
};

// Remove a specific image record by ID
export const removeImageFromHistory = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getImageHistory();
    const updatedHistory = history.filter(record => record.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing image from history:', error);
  }
};

// Clear all image history
export const clearImageHistory = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing image history:', error);
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 