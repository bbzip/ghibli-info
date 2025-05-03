import '../styles/globals.css';
import '../styles/custom-bg.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';

function GhibliApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const { locale } = router;

  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:locale" content={locale} />
        <meta property="og:type" content="website" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default appWithTranslation(GhibliApp); 