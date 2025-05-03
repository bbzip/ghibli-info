import { useRouter } from 'next/router';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (newLocale: string) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-white/80 hover:bg-white text-ghibli-brown px-3 py-2 rounded-full transition-all shadow-sm hover:shadow"
        aria-label="Change language"
      >
        <Globe size={16} className="mr-2" />
        <span className="font-medium">{locale === 'zh' ? '中文' : 'English'}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
          <button
            onClick={() => changeLanguage('en')}
            className={`block w-full text-left px-4 py-3 hover:bg-ghibli-beige transition-colors ${
              locale === 'en' ? 'bg-ghibli-beige font-semibold' : ''
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">🇺🇸</span>
              <span>English</span>
            </div>
          </button>
          <button
            onClick={() => changeLanguage('zh')}
            className={`block w-full text-left px-4 py-3 hover:bg-ghibli-beige transition-colors ${
              locale === 'zh' ? 'bg-ghibli-beige font-semibold' : ''
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">🇨🇳</span>
              <span>中文</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 