import { useEffect } from 'react';
import { useRouter } from 'next/router';

const LanguageDetector: React.FC = () => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // Get browser language
    const browserLanguage = navigator.language.split('-')[0];
    
    // If browser language is Chinese and current locale is not Chinese
    if (browserLanguage === 'zh' && locale !== 'zh') {
      router.push({ pathname, query }, asPath, { locale: 'zh' });
    }
    // If browser language is not Chinese and current locale is Chinese
    else if (browserLanguage !== 'zh' && locale === 'zh') {
      router.push({ pathname, query }, asPath, { locale: 'en' });
    }
    // Default to English for other languages
  }, []);

  // This component doesn't render anything
  return null;
};

export default LanguageDetector; 