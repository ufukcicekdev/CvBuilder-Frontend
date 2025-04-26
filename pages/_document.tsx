import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="tr">
        <Head>
          {/* Meta - SSR ile erken yüklenmesi gerekli */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta name="theme-color" content="#4F46E5" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          
          {/* Favicon - basit, inline SVG kullan */}
          <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%234F46E5'/%3E%3Cpath d='M30 30H70V40H30zM30 50H70V60H30zM30 70H50V80H30z' fill='white'/%3E%3C/svg%3E" type="image/svg+xml" />
          
          {/* LCP kritik stiller için inline CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #f8f9fa;
              -webkit-font-smoothing: antialiased;
            }
            
            .hero-section {
              background: #f5f7fa;
              min-height: 600px;
              position: relative;
              padding: 48px 0;
            }
            
            h1 {
              color: #111827;
              font-size: 3rem;
              line-height: 1.2;
              margin-bottom: 1rem;
            }
            
            .critical-image {
              width: 100%;
              max-height: 400px;
              height: auto;
            }
            
            .main-content {
              display: flex;
              flex-direction: column;
              flex: 1;
              max-width: 100%;
            }
            
            .loading {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #f8f9fa;
              z-index: 9999;
              transition: opacity 0.2s;
            }
            
            .loaded .loading {
              display: none;
              opacity: 0;
            }
          `}} />
          
          {/* Optimize edilmiş FOUC önleme scripti */}
          <script dangerouslySetInnerHTML={{ __html: `
            // Performans için optimizasyon - DOM yüklendiğinde çalışacak
            document.addEventListener("DOMContentLoaded", function() {
              requestAnimationFrame(() => {
                document.documentElement.classList.add('loaded');
              });
            });
            
            // Yükleme zaman aşımı
            setTimeout(function() {
              document.documentElement.classList.add('loaded');
            }, 1000);
          `}} />
          
          {/* Font yüklemesi - performans için optimize edildi */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            as="style"
          />
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              var link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
              document.head.appendChild(link);
            })();
          `}} />
          <noscript>
            <link
              href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
              rel="stylesheet"
            />
          </noscript>
        </Head>
        <body>
          <div className="loading">Yükleniyor...</div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 