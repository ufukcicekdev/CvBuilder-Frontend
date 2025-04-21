/**
 * JavaScript bundle optimizasyonu için yardımcı fonksiyonlar
 * 
 * Bu modül, Next.js uygulamasındaki JavaScript kodunu optimize etmek için
 * çeşitli yöntemler sağlar.
 */

/**
 * Geliştirme ortamında olup olmadığımızı kontrol eder
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Dinamik içe aktarma için yardımcı fonksiyon
 * Bileşenleri yalnızca gerektiğinde yükler
 * 
 * @param {Function} importFunc - import() fonksiyonu
 * @param {Object} options - Dinamik içe aktarma seçenekleri
 * @returns {Object} - Dinamik içe aktarma sonucu
 */
export const loadDynamically = (importFunc, options = {}) => {
  if (typeof window === 'undefined') return null;
  
  // Sadece geliştirme ortamında SSR'ı etkinleştir
  const ssr = isDev ? true : false;
  
  return {
    loader: importFunc,
    ssr,
    ...options
  };
};

/**
 * Belirli kod bloklarını yalnızca üretim ortamında çalıştırır
 * 
 * @param {Function} fn - Çalıştırılacak fonksiyon
 */
export const onlyInProduction = (fn) => {
  if (process.env.NODE_ENV === 'production' && typeof fn === 'function') {
    fn();
  }
};

/**
 * Komponent önbellekleme için HOC (Higher Order Component)
 * Gereksiz yeniden oluşturmaları önler
 * 
 * @param {React.Component} Component - React bileşeni
 * @returns {React.Component} - Önbelleğe alınmış bileşen
 */
export const memoizeComponent = (Component) => {
  // React.memo ile optimize edilmiş bileşeni döndürür
  if (typeof React !== 'undefined' && React.memo) {
    return React.memo(Component);
  }
  return Component;
};

/**
 * Critical JavaScript yükleme için optimizasyon
 */
export const optimizeCriticalLoad = () => {
  if (typeof window !== 'undefined') {
    // Viewport dışındaki kaynakları ertelemek için tembel yükleme
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.src = img.dataset.src;
      });
    }
    
    // Viewport'da olmayan scriptleri ertelemek
    const deferScripts = () => {
      document.querySelectorAll('script[data-defer="true"]').forEach(script => {
        const newScript = document.createElement('script');
        [...script.attributes].forEach(attr => {
          if (attr.name !== 'data-defer') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        newScript.innerHTML = script.innerHTML;
        script.parentNode.replaceChild(newScript, script);
      });
    };
    
    // Sayfa yüklendikten sonra ertelenmiş scriptleri yükle
    if (document.readyState === 'complete') {
      deferScripts();
    } else {
      window.addEventListener('load', deferScripts);
    }
  }
};

// Modül yüklendiğinde optimizasyon işlevini çağır
if (typeof window !== 'undefined' && !isDev) {
  optimizeCriticalLoad();
} 