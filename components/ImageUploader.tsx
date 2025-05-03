import { useTranslation } from 'next-i18next';
import { useState, useRef, useEffect } from 'react';
import { validateImage, resizeImage } from '../utils/imageUpload';
import QuotaDisplay from './QuotaDisplay';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  disabled = false 
}) => {
  const { t } = useTranslation('common');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset error when disabled changes
  useEffect(() => {
    if (disabled) {
      setError(null);
    }
  }, [disabled]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // Validate file type and size
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.message || 'Invalid file');
      return;
    }
    
    try {
      // Resize the image for preview and processing
      const resizedImage = await resizeImage(file);
      setPreviewUrl(resizedImage);
      onImageSelected(resizedImage);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(t('locale') === 'zh' ? '处理图片时出错' : 'Error processing image');
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <QuotaDisplay />
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive 
            ? 'border-ghibli-blue bg-blue-50' 
            : 'border-gray-300 hover:border-ghibli-blue'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-64 max-w-full object-contain mb-4 rounded-lg shadow-sm" 
            />
            <button 
              type="button"
              className="btn btn-secondary text-sm mt-2"
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={disabled}
            >
              {t('locale') === 'zh' ? '选择其他图片' : 'Choose another image'}
            </button>
          </div>
        ) : (
          <>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0h12a4 4 0 004-4v-8m-20 0v-8m0 0v-8a4 4 0 014-4h8" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <div className="mt-4 flex flex-col items-center text-sm">
              <button
                type="button"
                className="btn btn-primary mb-2"
                disabled={disabled}
              >
                {t('upload.button')}
              </button>
              <p className="text-ghibli-gray">{t('upload.drag_drop')}</p>
            </div>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled}
        />
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 