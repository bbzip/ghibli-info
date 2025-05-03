import { useTranslation } from 'next-i18next';
import Image from 'next/image';

const PreviewCard: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm">
      <div className="absolute top-2 right-2 bg-ghibli-blue text-white text-xs px-2 py-1 rounded-full">
        {t('preview.sample_tag')}
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-ghibli-brown text-xl font-medium tracking-wide">
          {t('preview.title')}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image 
                src="/assets/sample-before.jpg" 
                alt={t('preview.before')}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-sm text-gray-500">
              {t('preview.before')}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image 
                src="/assets/sample-after.jpg" 
                alt={t('preview.after')}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-sm text-gray-500">
              {t('preview.after')}
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-3 text-sm text-ghibli-brown">
          <p>{t('preview.description')}</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard; 