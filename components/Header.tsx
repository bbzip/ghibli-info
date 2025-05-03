import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useTranslation('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <Link href="/" className="text-2xl font-serif text-ghibli-brown hover:text-ghibli-blue transition-colors">
            {t('site.title')}
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <LanguageSwitcher />
          {/* 登录按钮已隐藏 */}
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-ghibli-gray p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <path d="M3 6l18 0M3 12l18 0M3 18l18 0" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-4 bg-white border-t">
          <div className="flex flex-col space-y-4">
            <LanguageSwitcher />
            {/* 移动端登录按钮已隐藏 */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 