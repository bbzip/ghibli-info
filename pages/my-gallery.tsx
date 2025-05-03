import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dayjs from 'dayjs';
import { ArrowLeft, Trash2, UploadCloud } from 'lucide-react';
import { getImageHistory, removeImageFromHistory, clearImageHistory, ImageRecord } from '../utils/imageHistory';
import ImageModal from '../components/ImageModal';

const MyGallery = () => {
  const { t } = useTranslation('common');
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    // Load images from localStorage on component mount
    const loadImages = () => {
      const history = getImageHistory();
      setImages(history);
    };
    
    loadImages();
    
    // Set up a listener for localStorage changes (in case user has multiple tabs open)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ghibli_generated_images') {
        loadImages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleDeleteImage = (id: string) => {
    removeImageFromHistory(id);
    setImages(images.filter(img => img.id !== id));
  };

  const handleClearHistory = () => {
    if (isConfirmingClear) {
      clearImageHistory();
      setImages([]);
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
      
      // Auto reset confirm state after a delay
      setTimeout(() => {
        setIsConfirmingClear(false);
      }, 3000);
    }
  };

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Head>
        <title>{t('locale') === 'zh' ? '我的作品' : 'My Gallery'}</title>
        <meta name="description" content={t('locale') === 'zh' ? '查看我生成的吉卜力风格图片' : 'View my generated Ghibli-style images'} />
      </Head>
      
      <div className="ghibli-bg min-h-screen">
        {/* Header with back button */}
        <header className="py-5 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link 
              href="/" 
              className="text-[#5a3c2e] hover:text-[#f58f3a] transition flex items-center gap-1 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-sm border border-white/30"
            >
              <ArrowLeft size={16} />
              <span>{t('locale') === 'zh' ? '返回首页' : 'Back to Home'}</span>
            </Link>
            
            <div className="flex items-center">
              <h1 className="text-xl font-wenkai font-bold text-[#5a3c2e] drop-shadow-sm">
                {t('locale') === 'zh' ? '我的作品' : 'My Gallery'}
              </h1>
            </div>
            
            {images.length > 0 && (
              <button
                onClick={handleClearHistory}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm shadow-sm transition ${
                  isConfirmingClear 
                    ? 'bg-red-500 text-white border border-red-500 hover:bg-red-600' 
                    : 'bg-white/80 backdrop-blur-sm text-[#5a3c2e] border border-white/30 hover:bg-white/90'
                }`}
              >
                <Trash2 size={16} />
                <span>{isConfirmingClear 
                  ? (t('locale') === 'zh' ? '确认清除?' : 'Confirm Clear?') 
                  : (t('locale') === 'zh' ? '清除全部' : 'Clear All History')
                }</span>
              </button>
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/30 mb-8">
            <h2 className="text-2xl font-wenkai font-semibold text-[#5a3c2e] mb-6 text-center drop-shadow-sm">
              {t('locale') === 'zh' ? '我生成的吉卜力风格图片' : 'My Generated Ghibli-Style Images'}
            </h2>
            
            {images.length === 0 ? (
              // Empty state
              <div className="text-center py-16">
                <div className="bg-white/50 inline-flex rounded-full p-4 mb-4">
                  <UploadCloud size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {t('locale') === 'zh' 
                    ? '你还没有生成任何吉卜力风格的图片。从上传你的第一张照片开始吧！' 
                    : "You haven't generated any Ghibli-style images yet. Start by uploading your first photo!"}
                </p>
                <Link 
                  href="/" 
                  className="bg-[#f58f3a] hover:bg-[#f5a254] text-white px-6 py-3 rounded-full font-medium text-sm inline-flex items-center gap-2 transition shadow-md"
                >
                  <UploadCloud size={16} />
                  {t('locale') === 'zh' ? '上传照片' : 'Upload a Photo'}
                </Link>
              </div>
            ) : (
              // Grid of images
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map(image => (
                  <div 
                    key={image.id} 
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/30 transition-transform hover:scale-[1.02] duration-300"
                  >
                    <div className="relative">
                      {/* Generated Image (clickable) */}
                      <div 
                        className="rounded-xl overflow-hidden shadow-inner border border-orange-200 aspect-square cursor-pointer"
                        onClick={() => openModal(image.generatedUrl)}
                      >
                        <img 
                          src={image.generatedUrl} 
                          alt="Generated" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Original Image (smaller thumbnail) */}
                      <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-xl overflow-hidden shadow-md border-2 border-white">
                        <img 
                          src={image.originalUrl} 
                          alt="Original" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-red-100 transition"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                    
                    {/* Date created */}
                    <div className="mt-4 text-xs text-gray-500">
                      {t('locale') === 'zh' ? '创建于：' : 'Created on:'} {dayjs(image.timestamp).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <footer className="py-6 bg-[#5a3c2e] text-white text-center text-sm">
          <p>© 2024 {t('site.copyright')} | {t('site.all_rights')}</p>
        </footer>
      </div>
      
      {/* Image modal */}
      <ImageModal
        imageUrl={selectedImage || ''}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default MyGallery; 