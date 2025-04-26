import { useEffect, useCallback } from 'react';

/**
 * Performans optimizasyon hook'u - Hafifletilmiş
 */
export const usePerformanceOptimizations = () => {
  // Görsel optimizasyonu - İntersection Observer kullanarak
  const optimizeImages = useCallback(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Lazy loading için IntersectionObserver
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    // data-src ile işaretlenmiş tüm görselleri gözlemle
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return () => imageObserver.disconnect();
  }, []);

  useEffect(() => {
    // Sunucu tarafında çalıştırma
    if (typeof window === 'undefined') return;

    // Anahtar optimizasyonları ertele (main thread'i bloklama)
    const runDelayedOptimizations = () => {
      // Yüksek öncelikli görevler - hemen çalıştır
      optimizeImages();
      
      // Düşük öncelikli görevleri requestIdleCallback ile çalıştır
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          // LCP metrikleri için gözlemci
          if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                // LCP metriği - sadece geliştirme modunda 
                if (process.env.NODE_ENV === 'development') {
                  console.info('LCP:', Math.round(lastEntry.startTime));
                }
              }
              lcpObserver.disconnect();
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          }
        });
      }
    };

    // Optimizasyonları yüklenme sonrasına ertele
    if (document.readyState === 'complete') {
      runDelayedOptimizations();
    } else {
      window.addEventListener('load', runDelayedOptimizations, { once: true });
    }

    return () => {
      window.removeEventListener('load', runDelayedOptimizations);
    };
  }, [optimizeImages]);

  return null;
};

export default usePerformanceOptimizations; 