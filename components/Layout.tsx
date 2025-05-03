import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import LanguageDetector from './LanguageDetector';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title: customTitle, 
  description: customDescription 
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  const title = customTitle || t('site.meta_title');
  const description = customDescription || t('site.meta_description');

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale} />
      </Head>

      <LanguageDetector />
      
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout; 