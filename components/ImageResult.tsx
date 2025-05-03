import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { generatePlatformImage } from '../utils/imageUpload';
import { getRandomCaption } from '../utils/captions';

interface ImageResultProps {
  imageUrl: string;
  onNewImage: () => void;
}

const ImageResult: React.FC<ImageResultProps> = ({ imageUrl, onNewImage }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const [caption] = useState<string>(getRandomCaption(locale));

  const handleDownload = async (platform: 'instagram' | 'pinterest' | 'xiaohongshu' | 'wechat') => {
    try {
      // Generate platform-specific image with caption
      const platformImage = await generatePlatformImage(imageUrl, platform, caption);
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = platformImage;
      
      // Set filename based on platform
      let filename;
      switch (platform) {
        case 'instagram':
          filename = 'ghibli-instagram.jpg';
          break;
        case 'pinterest':
          filename = 'ghibli-pinterest.jpg';
          break;
        case 'xiaohongshu':
          filename = 'ghibli-xiaohongshu.jpg';
          break;
        case 'wechat':
          filename = 'ghibli-wechat.jpg';
          break;
        default:
          filename = 'ghibli-image.jpg';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating platform image:', error);
      alert(locale === 'zh' ? '下载图片时出错' : 'Error downloading image');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
        <h2 className="text-2xl font-serif text-ghibli-brown mb-4 text-center">
          {t('result.title')}
        </h2>
        
        <div className="mb-6">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Ghibli style" 
              className="w-full rounded-xl shadow-md" 
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-xl">
              <p className="text-white text-center text-shadow font-medium">
                {caption}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {locale === 'zh' ? (
            <>
              <button
                onClick={() => handleDownload('xiaohongshu')}
                className="btn btn-primary text-sm"
              >
                {t('result.download_xiaohongshu')}
              </button>
              <button
                onClick={() => handleDownload('wechat')}
                className="btn btn-secondary text-sm"
              >
                {t('result.download_wechat')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleDownload('instagram')}
                className="btn btn-primary text-sm"
              >
                {t('result.download_ig')}
              </button>
              <button
                onClick={() => handleDownload('pinterest')}
                className="btn btn-secondary text-sm"
              >
                {t('result.download_pinterest')}
              </button>
            </>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onNewImage}
            className="btn btn-accent"
          >
            {t('result.new_image')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageResult; 