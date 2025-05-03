import { useTranslation } from 'next-i18next';
import { useState, useRef } from 'react';
import { CloudUpload, Zap } from 'lucide-react';

interface UploadPanelProps {
  onImageSelected: (imageDataUrl: string) => void;
  onGenerateImage: () => void;
  onSelectBackground: () => void;
  selectedImage: string | null;
  isGenerating: boolean;
  canGenerate: boolean;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
  onImageSelected,
  onGenerateImage,
  onSelectBackground,
  selectedImage,
  isGenerating,
  canGenerate
}) => {
  const { t } = useTranslation('common');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGenerating) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGenerating) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGenerating) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (isGenerating) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm p-5 h-full flex flex-col">
      <h2 className="text-2xl font-medium text-ghibli-brown tracking-wide mb-2">
        {t('upload.title')}
      </h2>
      <p className="text-ghibli-gray mb-6 text-sm">
        {t('upload.subtitle')}
      </p>
      
      <div 
        className={`
          flex-grow border-2 border-dashed rounded-xl
          flex flex-col items-center justify-center p-6 transition-all
          ${dragActive ? 'border-ghibli-blue bg-blue-50/50' : 'border-gray-300'}
          ${isGenerating ? 'opacity-50' : 'hover:border-ghibli-blue cursor-pointer'}
          mb-4
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        {selectedImage ? (
          <div className="w-full h-full flex flex-col items-center">
            <div className="relative w-full max-h-60 rounded-lg overflow-hidden mb-3">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <button
              type="button"
              className="text-sm text-ghibli-blue hover:text-ghibli-brown transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (isGenerating) return;
                onImageSelected('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              {t('upload.choose_different')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded-full">
              <CloudUpload className="h-8 w-8 text-ghibli-blue" />
            </div>
            <p className="text-ghibli-gray text-center mb-2">
              {t('upload.drag_drop')}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {t('upload.supported_formats')}
            </p>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileInput}
          disabled={isGenerating}
        />
      </div>
      
      <div className="space-y-3">
        <button
          onClick={handleUploadClick}
          className="w-full py-3 bg-ghibli-blue text-white rounded-lg font-medium flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGenerating}
        >
          <CloudUpload className="h-5 w-5 mr-2" />
          {t('upload.button')}
        </button>
        
        {selectedImage && (
          <>
            <button
              onClick={onGenerateImage}
              className="w-full py-3 bg-ghibli-orange text-white rounded-lg font-medium flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating || !canGenerate}
            >
              <Zap className="h-5 w-5 mr-2" />
              {t('generate.button')}
            </button>
            
            {selectedImage && (
              <button
                onClick={onSelectBackground}
                className="w-full py-2 border border-ghibli-brown text-ghibli-brown bg-transparent rounded-lg text-sm hover:bg-ghibli-brown hover:text-white transition-colors"
              >
                {t('background.select_style')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPanel; 