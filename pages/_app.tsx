import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { Providers } from '../providers/Providers';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState, memo } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Script from 'next/script';
import Head from 'next/head';
import { SessionProvider } from "next-auth/react";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import usePerformanceOptimizations from '../hooks/usePerformanceOptimizations';

// RTL cache - Dışarı çıkar ve memorize et
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// LTR cache - Dışarı çıkar ve memorize et
const cacheLtr = createCache({
  key: 'muiltr',
});

// Sabit değerler
const PROGRESS_BAR_CONFIG = {
  height: '3px',
  color: '#38a169',
  options: { showSpinner: false },
  shallowRouting: true
};

// Statik önemli bileşenleri memo ile optimizasyonları yap
const MemoizedProgressBar = memo(ProgressBar);
const MemoizedToaster = memo(Toaster);

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isRTL = router.locale === 'ar';
  const [isSSR, setIsSSR] = useState(true);
  
  // Performans optimizasyonları
  usePerformanceOptimizations();

  // CSR tespiti - sadece bir kez çalışır
  useEffect(() => {
    setIsSSR(false);
    
    // WebSockets sayfalarında önbellek devre dışı - kritik
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hasWebSockets = 
        path.includes('/templates/') || 
        path.includes('/cv/') || 
        path.includes('/web-cv/');
        
      if (hasWebSockets) {
        window.addEventListener('pageshow', (event) => {
          if (event.persisted) {
            window.location.reload();
          }
        });
      }
    }
  }, []);

  // SSR çıkışı - minimal
  if (isSSR) {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>CV Builder</title>
        
        {/* Kritik preconnect'ler */}
        <link rel="preconnect" href="https://web-production-9f41e.up.railway.app" />
        <link rel="preconnect" href="https://cekfisi.fra1.cdn.digitaloceanspaces.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Kritik varlıkları önceden yükle */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        
        {/* DNS önbellekleme */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
          {/* Google Analytics - Production'da ve geç yükleme */}
          {process.env.NODE_ENV === 'production' && (
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-HDJ50NB3XE"
              strategy="afterInteractive"
              async
            />
          )}
          
          <AuthProvider>
            <LanguageProvider>
              <Providers>
                <MemoizedProgressBar {...PROGRESS_BAR_CONFIG} />
                <Component {...pageProps} />
                <MemoizedToaster position={isRTL ? "top-left" : "top-right"} />
              </Providers>
            </LanguageProvider>
          </AuthProvider>
        </CacheProvider>
      </SessionProvider>
    </>
  );
}

// getInitialProps'u optimize et - küçült
MyApp.getInitialProps = async ({ Component, ctx }: any) => {
  return { 
    pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {} 
  };
};

export default appWithTranslation(MyApp); 