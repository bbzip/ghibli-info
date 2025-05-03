import { useTranslation } from 'next-i18next';

interface TotoroLoaderProps {
  message?: string;
}

const TotoroLoader: React.FC<TotoroLoaderProps> = ({ message }) => {
  const { t } = useTranslation('common');
  const loadingMessage = message || t('upload.generating');

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Totoro SVG animation */}
      <div className="w-24 h-24 mb-4 animate-bounce-slow">
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <g>
            {/* Totoro body */}
            <ellipse cx="60" cy="65" rx="40" ry="45" fill="#93867F" />
            <ellipse cx="60" cy="75" rx="30" ry="30" fill="#C5C9C4" />
            
            {/* Eyes */}
            <circle cx="45" cy="50" r="6" fill="white" />
            <circle cx="75" cy="50" r="6" fill="white" />
            <circle cx="45" cy="50" r="3" fill="black" />
            <circle cx="75" cy="50" r="3" fill="black" />
            
            {/* Nose */}
            <ellipse cx="60" cy="60" rx="5" ry="4" fill="#333" />
            
            {/* Whiskers */}
            <line x1="40" y1="62" x2="25" y2="60" stroke="#333" strokeWidth="2" />
            <line x1="40" y1="66" x2="25" y2="70" stroke="#333" strokeWidth="2" />
            <line x1="80" y1="62" x2="95" y2="60" stroke="#333" strokeWidth="2" />
            <line x1="80" y1="66" x2="95" y2="70" stroke="#333" strokeWidth="2" />
            
            {/* Ears */}
            <path d="M40,35 Q45,25 50,35" fill="#93867F" stroke="#333" strokeWidth="1" />
            <path d="M80,35 Q75,25 70,35" fill="#93867F" stroke="#333" strokeWidth="1" />
            
            {/* Belly pattern */}
            <ellipse cx="60" cy="85" rx="4" ry="4" fill="#93867F" />
            <ellipse cx="50" cy="80" rx="4" ry="4" fill="#93867F" />
            <ellipse cx="70" cy="80" rx="4" ry="4" fill="#93867F" />
          </g>
        </svg>
      </div>
      
      <p className="text-ghibli-gray text-lg font-medium">{loadingMessage}</p>
      <p className="text-ghibli-gray text-sm opacity-75 mt-2">
        {t('locale') === 'zh' 
          ? '这可能需要15-30秒...' 
          : 'This might take 15-30 seconds...'}
      </p>
    </div>
  );
};

export default TotoroLoader; 