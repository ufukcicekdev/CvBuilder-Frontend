import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { Providers } from '../providers/Providers';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Script from 'next/script';
import Head from 'next/head';
import { SessionProvider } from "next-auth/react";
import { initializePerformanceOptimizations } from '../utils/performanceOptimization';
import { optimizeCriticalLoad, onlyInProduction } from '../utils/jsBundleOptimizer';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isRTL = router.locale === 'ar';
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
    
    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    // Initialize JavaScript optimizations in production
    onlyInProduction(optimizeCriticalLoad);

    // Register route change performance markers
    const handleRouteChangeStart = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.performance.mark('routeChangeStart');
      }
    };

    const handleRouteChangeComplete = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.performance.mark('routeChangeComplete');
        window.performance.measure(
          'routeChange',
          'routeChangeStart',
          'routeChangeComplete'
        );
        
        // Optimize JS on route change in production
        onlyInProduction(optimizeCriticalLoad);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  if (isSSR) {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>CV Builder</title>
        {/* Preload kritik kaynaklar */}
        <link rel="preload" href="/images/hero-image.svg" as="image" type="image/svg+xml" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
          {/* Google Analytics - daha verimli hale getirildi */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-HDJ50NB3XE"
            strategy="afterInteractive"
            data-defer="true"
          />
          <Script id="google-analytics" strategy="afterInteractive" data-defer="true">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HDJ50NB3XE', {
                'send_page_view': false,
                'transport_type': 'beacon',
                'anonymize_ip': true
              });
              
              // Optimize pageview sending - only after LCP completes
              window.addEventListener('load', function() {
                // Delay just enough to not interfere with LCP
                setTimeout(() => {
                  gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                  });
                  
                  // Remove js-loading class to restore transitions
                  document.body.classList.remove('js-loading');
                }, 500);
              });
            `}
          </Script>
          
          {/* Script to optimize initial content load */}
          <Script id="optimization-script" strategy="beforeInteractive">
            {`
              // Add js-loading class to disable transitions during load
              document.documentElement.classList.add('js-loading');
              
              // Force eager loading of critical LCP elements
              window.addEventListener('DOMContentLoaded', function() {
                // Force immediate loading of any important image
                const preloadImages = document.querySelectorAll('img[loading="lazy"][data-critical="true"]');
                if (preloadImages.length) {
                  for (let img of preloadImages) {
                    img.loading = 'eager';
                    // Set the src immediately if data-src is present
                    if (img.dataset.src) {
                      img.src = img.dataset.src;
                    }
                  }
                }
              });
            `}
          </Script>
          
          <AuthProvider>
            <LanguageProvider>
              <Providers>
                <Component {...pageProps} />
                <Toaster position={isRTL ? "top-left" : "top-right"} />
              </Providers>
            </LanguageProvider>
          </AuthProvider>
        </CacheProvider>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation(MyApp);

// Add getInitialProps to load translations
MyApp.getInitialProps = async ({ Component, ctx }: any) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps };
}; 