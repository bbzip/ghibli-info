import { useTranslation } from 'next-i18next';
import React from 'react';
import { X } from 'lucide-react';

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (bgId: string) => void;
  selectedBackground: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  isOpen,
  onClose,
  onSelectBackground,
  selectedBackground
}) => {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;
  
  const backgrounds = [
    { id: 'bg-1', src: '/assets/bg-1.jpg', name: t('background.forest') },
    { id: 'bg-2', src: '/assets/bg-2.jpg', name: t('background.window') },
    { id: 'bg-3', src: '/assets/bg-3.jpg', name: t('background.hills') }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-ghibli-brown">
            {t('background.title')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-ghibli-gray text-sm mb-4">
            {t('background.description')}
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                className={`
                  rounded-lg overflow-hidden border-2 transition-all hover:opacity-90
                  ${selectedBackground === bg.id ? 'border-ghibli-blue ring-2 ring-blue-200' : 'border-gray-200'}
                `}
                onClick={() => onSelectBackground(bg.id)}
              >
                <div className="aspect-video w-full">
                  <img 
                    src={bg.src} 
                    alt={bg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 text-xs text-center font-medium">
                  {bg.name}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-ghibli-brown hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('background.cancel')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-ghibli-blue text-white rounded-lg hover:bg-ghibli-blue/90 transition-colors"
          >
            {t('background.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSelector; 