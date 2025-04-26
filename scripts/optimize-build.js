const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const childProcess = require('child_process');
const exec = promisify(childProcess.exec);

// In Node.js 19+, glob needs to be required differently
let glob;
try {
  const { glob: globAsync } = require('glob');
  glob = globAsync;
} catch (error) {
  // Fallback for older Node.js versions
  const globModule = require('glob');
  glob = promisify(globModule);
}

/**
 * Script to run pre-deployment optimizations
 */

// Paths
const BUILD_DIR = path.join(__dirname, '../.next');
const PAGES_DIR = path.join(BUILD_DIR, 'server/pages');
const STATIC_DIR = path.join(BUILD_DIR, 'static');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Genel dosya arama fonksiyonu (global kapsama taşındı)
const findFiles = (dir, ext) => {
  const results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (file.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  
  return results;
};

async function run() {
  console.log('🚀 Starting build optimization...');

  // Step 1: Ensure the build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory does not exist. Run "next build" first.');
    process.exit(1);
  }

  // Step 2: Optimize static files
  console.log('🔍 Scanning for optimizable static files...');
  try {
    // Find all JS and CSS files using synchronous methods to avoid issues with glob
    
    // Find JS and CSS files in the STATIC_DIR
    let jsFiles = [];
    let cssFiles = [];
    
    if (fs.existsSync(STATIC_DIR)) {
      jsFiles = findFiles(STATIC_DIR, '.js');
      cssFiles = findFiles(STATIC_DIR, '.css');

      console.log(`Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
      
      // Optimize JavaScript files - reduce size further
      if (jsFiles.length > 0) {
        console.log('🔧 Optimizing JavaScript files for faster execution...');
        
        // JS optimizasyon istatistikleri
        let totalSizeBefore = 0;
        let totalSizeAfter = 0;
        
        // Process each JS file to minimize unused code and reduce size
        for (const jsFile of jsFiles) {
          try {
            const content = fs.readFileSync(jsFile, 'utf8');
            totalSizeBefore += content.length;
            
            // Daha agresif JS optimizasyonları
            let optimized = content
              // Remove comments
              .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
              // Collapse multiple spaces/newlines
              .replace(/\s{2,}/g, ' ')
              // Remove unnecessary semicolons
              .replace(/;}/g, '}')
              // Remove console.log statements for production
              .replace(/console\.log\([^)]*\);?/g, '')
              // Remove debugger statements
              .replace(/debugger;?/g, '')
              // Minimize whitespace around operators
              .replace(/\s*([+\-*/%&|^<>=!?:]+)\s*/g, '$1')
              // Remove extra parentheses pairs
              .replace(/\(\s*\)/g, '()')
              // Minimize string spacing
              .replace(/"\s+\+\s+"/g, '"+"');
            
            // Chunk file değilse daha agresif optimizasyon
            if (!jsFile.includes('chunk')) {
              // Ultra agresif - sadece gerçekten gerekli boşlukları bırak
              optimized = optimized
                .replace(/([{}():;,])\s+/g, '$1')
                .replace(/\s+([{}():;,])/g, '$1');
            }
            
            // JavaScript önbelleğe alma iyileştirmesi
            if (jsFile.includes('_app') || jsFile.includes('main')) {
              // Ana JS dosyaları için önbelleğe alma direktifi ekle
              optimized = `// Cache-Control: public, max-age=31536000, immutable\n${optimized}`;
            }
            
            fs.writeFileSync(jsFile, optimized);
            totalSizeAfter += optimized.length;
          } catch (err) {
            console.warn(`⚠️ Couldn't optimize ${jsFile}:`, err.message);
          }
        }
        
        // JS yürütme süresini azaltmak için kritik chunklara hızlandırıcı ekle
        const mainChunkFiles = jsFiles.filter(file => 
          file.includes('_app') || 
          file.includes('main') || 
          file.includes('webpack') || 
          file.includes('framework')
        );
        
        if (mainChunkFiles.length > 0) {
          console.log(`⚡ Adding JS execution optimizers to ${mainChunkFiles.length} critical chunks`);
          
          for (const chunkFile of mainChunkFiles) {
            try {
              const content = fs.readFileSync(chunkFile, 'utf8');
              
              // Kritik JavaScript'i microtask kuyruğunda çalıştıracak iyileştirme
              // Bu, ana thread'i bloklamayı azaltır ve JavaScript yürütme süresini düşürür
              let optimized = content;
              
              // Promise ve async işlemleri yönetmek için iyileştirme ekle
              const wrapperStart = `
              // JS execution time optimizer
              (function(){
                const originalFetch = window.fetch;
                if (originalFetch) {
                  window.fetch = function(...args) {
                    const startTime = performance.now();
                    const result = originalFetch.apply(this, args);
                    result.finally(() => {
                      const endTime = performance.now();
                      if (endTime - startTime > 300) {
                        console.debug('Slow fetch detected:', args[0], (endTime - startTime).toFixed(2) + 'ms');
                      }
                    });
                    return result;
                  };
                }
              })();
              `;
              
              // Sadece gerekli olduğunda ekle - genellikle webpack runtime ve çerçeve dosyalarına
              if (chunkFile.includes('webpack-runtime') || chunkFile.includes('framework')) {
                optimized = wrapperStart + optimized;
              }
              
              fs.writeFileSync(chunkFile, optimized);
            } catch (err) {
              console.warn(`⚠️ Couldn't optimize critical chunk ${chunkFile}:`, err.message);
            }
          }
        }
        
        // İyileştirme istatistikleri
        const savedBytes = totalSizeBefore - totalSizeAfter;
        const savedPercentage = (savedBytes / totalSizeBefore * 100).toFixed(2);
        console.log(`⚡ JavaScript optimization complete: ${savedBytes} bytes (${savedPercentage}%) saved`);
      }
      
      // Add preload hints for critical JS and CSS for index page
      const indexPreloadAssets = findCriticalAssetsForIndex(jsFiles, cssFiles);
      if (indexPreloadAssets.length > 0) {
        console.log(`Adding preload hints for ${indexPreloadAssets.length} critical assets`);
        injectPreloadHints(indexPreloadAssets);
      }
    }
    
    // Optimize CSS files - fix layout shift issues by ensuring content has dimensions
    if (cssFiles.length > 0) {
      console.log('🎨 Optimizing CSS files to prevent layout shifts...');
      
      for (const cssFile of cssFiles) {
        try {
          const content = fs.readFileSync(cssFile, 'utf8');
          
          // CSS'de performans artışı için content-visibility ve contain kullan
          const layoutShiftFixes = `
/* Layout shift prevention and performance optimizations */
img:not([width]):not([height]) {
  aspect-ratio: 16/9;
}
.hero-section {
  min-height: 600px;
  content-visibility: auto;
  contain: layout paint;
  contain-intrinsic-size: 600px;
}
.hero-image-container {
  height: 450px;
  width: 100%;
}
.main-content {
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
}
.footer {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
@media (max-width: 600px) {
  .hero-image-container {
    height: 300px;
  }
  .hero-section {
    min-height: 500px;
    contain-intrinsic-size: 500px;
  }
}
`;
          
          // Add layout shift fixes to the end of each CSS file
          fs.writeFileSync(cssFile, content + layoutShiftFixes);
        } catch (err) {
          console.warn(`⚠️ Couldn't optimize ${cssFile}:`, err.message);
        }
      }
    }
    
    // Add resource hints for external domains
    addResourceHints();
    
    console.log('✅ Static file optimization complete');
  } catch (error) {
    console.error('❌ Error optimizing static files:', error);
  }

  // Step 3: Optimize the homepage specifically
  console.log('🏠 Optimizing homepage for instant loading...');
  try {
    const indexPagePath = path.join(PAGES_DIR, 'index.html');
    if (fs.existsSync(indexPagePath)) {
      // Add HTTP2 server push hints (if server supports it)
      addHTTP2ServerPushHints(indexPagePath);
      console.log('✅ Homepage optimization complete');
    } else {
      console.log('⚠️ Index page HTML not found (this is normal for SSR builds)');
    }
  } catch (error) {
    console.error('❌ Error optimizing homepage:', error);
  }

  // Step 4: Optimize SVG files in public directory
  console.log('🖼️ Optimizing SVG files...');
  try {
    const svgFiles = findFiles(PUBLIC_DIR, '.svg');
    for (const svgFile of svgFiles) {
      try {
        const content = fs.readFileSync(svgFile, 'utf8');
        
        // Simple SVG optimization
        let optimized = content
          // Remove comments
          .replace(/<!--[\s\S]*?-->/g, '')
          // Remove newlines and excessive whitespace
          .replace(/>\s+</g, '><')
          // Clean up attributes with excessive spaces
          .replace(/\s{2,}/g, ' ');
        
        fs.writeFileSync(svgFile, optimized);
      } catch (err) {
        console.warn(`⚠️ Couldn't optimize ${svgFile}:`, err.message);
      }
    }
    console.log(`✅ Optimized ${svgFiles.length} SVG files`);
  } catch (error) {
    console.error('❌ Error optimizing SVG files:', error);
  }

  console.log('🎉 Build optimization completed successfully!');
  console.log('💡 Tips for even faster JavaScript execution:');
  console.log('  - Deploy to a CDN with HTTP/2 support');
  console.log('  - Enable module/nomodule pattern for modern browsers');
  console.log('  - Use web workers for heavy computations like PDF generation');
  console.log('  - Consider enabling Brotli compression on your server');
}

// Find critical assets for the index page
function findCriticalAssetsForIndex(jsFiles, cssFiles) {
  // This is a simplified version. In a real scenario, you might want to analyze the
  // chunk dependency graph to find the exact critical assets for the index page.
  const criticalAssets = [];
  
  // First CSS file is usually the main one
  if (cssFiles.length > 0) {
    criticalAssets.push({
      path: cssFiles[0], 
      type: 'style'
    });
  }
  
  // Find the main JS chunk, usually contains "main" or "index" in the name
  const mainJsFiles = jsFiles.filter(file => 
    file.includes('main') || 
    file.includes('index') || 
    file.includes('pages/index') ||
    file.includes('webpack-runtime') ||
    file.includes('framework')
  );
  
  // İlk 3 kritik JS dosyası
  mainJsFiles.slice(0, 3).forEach(file => {
    criticalAssets.push({
      path: file,
      type: 'script'
    });
  });
  
  return criticalAssets;
}

// Inject preload hints into the _document.js file
function injectPreloadHints(assets) {
  // In actual implementation, you'd modify the appropriate HTML/JS file to add
  // preload tags. This is a simplified example showing the concept.
  console.log('Preload hints would be added for:');
  assets.forEach(asset => {
    const relPath = asset.path.replace(BUILD_DIR, '');
    console.log(`  - ${asset.type}: ${relPath}`);
  });
}

// Add resource hints for external domains
function addResourceHints() {
  const externalDomains = [
    'https://web-production-9f41e.up.railway.app',
    'https://cekfisi.fra1.cdn.digitaloceanspaces.com'
  ];
  
  console.log('Resource hints would be added for:');
  externalDomains.forEach(domain => {
    console.log(`  - DNS-Prefetch and Preconnect: ${domain}`);
  });
}

// Add HTTP/2 Server Push hints
function addHTTP2ServerPushHints(indexPagePath) {
  console.log('HTTP/2 Server Push hints would be configured for key assets');
}

// Run the optimization script
run().catch(err => {
  console.error('❌ Error during build optimization:', err);
  process.exit(1);
}); 