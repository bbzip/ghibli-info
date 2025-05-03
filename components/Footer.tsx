import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ghibli-beige py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-serif text-ghibli-brown hover:text-ghibli-blue transition-colors">
              {t('site.title')}
            </Link>
            <p className="text-sm text-ghibli-gray mt-2">
              &copy; {currentYear} Ghibli Generator
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link href="/privacy" className="text-ghibli-gray hover:text-ghibli-blue transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ghibli-gray hover:text-ghibli-blue transition-colors text-sm">
              Terms of Service
            </Link>
            <a 
              href="mailto:support@ghibli-generator.com" 
              className="text-ghibli-gray hover:text-ghibli-blue transition-colors text-sm"
            >
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-ghibli-gray opacity-75">
          <p>
            Powered by <a href="https://replicate.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-ghibli-blue">Replicate</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 