import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import useAuth from '../utils/useAuth';

const Login = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({
        type: 'error',
        text: t('locale') === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address'
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await loginWithEmail(email);
      
      setMessage({
        type: 'success',
        text: t('locale') === 'zh' ? '登录链接已发送到您的邮箱' : 'Login link has been sent to your email'
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: t('locale') === 'zh' ? '登录失败，请重试' : 'Login failed, please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({
        type: 'error',
        text: t('locale') === 'zh' ? '谷歌登录失败，请重试' : 'Google login failed, please try again'
      });
    }
  };

  return (
    <Layout title={t('auth.sign_in')}>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
          <h1 className="text-2xl font-serif text-ghibli-brown mb-6 text-center">
            {t('auth.sign_in')}
          </h1>
          
          <button
            onClick={handleGoogleLogin}
            className="btn w-full mb-4 flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            <span>
              {t('locale') === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
            </span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-ghibli-gray">
                {t('locale') === 'zh' ? '或使用电子邮箱' : 'Or with email'}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-ghibli-gray mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>
            
            {message && (
              <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {message.text}
              </div>
            )}
            
            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('locale') === 'zh' ? '处理中...' : 'Processing...'}
                  </span>
                ) : (
                  t('auth.magic_link')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Login; 