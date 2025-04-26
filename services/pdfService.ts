// html2pdf'yi doğrudan import etmek yerine, dinamik olarak yüklüyoruz
// import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';

// PDF modüllerini tip tanımları
type JsPDFType = any;
type Html2CanvasType = any;

// Modül yükleme için önbellek - tekrar hesaplama önlenir
let jsPDFPromise: Promise<JsPDFType> | null = null;
let html2CanvasPromise: Promise<Html2CanvasType> | null = null;

// Kütüphaneleri önbelleğe alan ve sadece bir kez yükleyen fonksiyon
const loadDependencies = () => {
  // JsPDF modülünü yükle (gerekirse)
  if (!jsPDFPromise) {
    jsPDFPromise = import('jspdf').then(module => module.default);
  }
  
  // html2canvas modülünü yükle (gerekirse)
  if (!html2CanvasPromise) {
    html2CanvasPromise = import('html2canvas').then(module => module.default);
  }
  
  // Her iki kütüphaneyi paralel olarak yükle
  return Promise.all([jsPDFPromise, html2CanvasPromise]);
};

interface GeneratePdfOptions {
  filename?: string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  html2canvasOptions?: any;
  jsPdfOptions?: {
    orientation?: 'portrait' | 'landscape';
    unit?: string;
    format?: string;
  };
  scale?: number;
  optimizeImages?: boolean;
  element?: HTMLElement;
  containerWidth?: number;
  pageBreaks?: boolean;
}

// Optimize edilmiş PDF servis
export const pdfService = {
  /**
   * HTML elementinden PDF oluşturur ve indirir
   * @param element - HTML elementi veya selector
   * @param options - PDF oluşturma ayarları
   */
  async generatePdf(
    elementOrSelector: string | HTMLElement,
    options: GeneratePdfOptions = {}
  ): Promise<void> {
    try {
      // Kütüphaneleri yükle - sadece gerektiğinde
      const [jsPDF, html2canvas] = await loadDependencies();
      
      // Element seçimi veya doğrudan kullanım
      const element = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector) as HTMLElement
        : elementOrSelector;
  
      // Element bulunamadıysa hata fırlat
      if (!element) {
        throw new Error('PDF için dönüştürülecek element bulunamadı');
      }
  
      // Varsayılan ayarları birleştir
      const pdfOptions = {
        filename: options.filename || 'cv.pdf',
        margin: {
          top: options.margin?.top || 10,
          right: options.margin?.right || 10,
          bottom: options.margin?.bottom || 10,
          left: options.margin?.left || 10
        },
        html2canvasOptions: {
          scale: options.scale || 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          ...options.html2canvasOptions
        },
        jsPdfOptions: {
          orientation: options.jsPdfOptions?.orientation || 'portrait',
          unit: options.jsPdfOptions?.unit || 'mm',
          format: options.jsPdfOptions?.format || 'a4',
          ...options.jsPdfOptions
        },
        optimizeImages: options.optimizeImages !== undefined ? options.optimizeImages : true
      };
  
      // Geçici bir konteynır oluştur
      const container = document.createElement('div');
      container.innerHTML = element.innerHTML;
      
      // Stil ve görüntü optimizasyonları
      container.style.width = `${element.offsetWidth}px`;
      document.body.appendChild(container);
      
      // Stil kopyalama
      const computedStyle = window.getComputedStyle(element);
      Array.from(computedStyle).forEach(key => {
        container.style[key as any] = computedStyle.getPropertyValue(key);
      });
  
      // Görünmez elemanları gizle
      const hiddenElements = container.querySelectorAll(
        'input[type="hidden"], .hidden, .d-none, [style*="display: none"], [style*="display:none"]'
      );
      hiddenElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
  
      // Görüntüleri optimize et (eğer ayarlanmışsa)
      if (pdfOptions.optimizeImages) {
        const images = container.querySelectorAll('img');
        images.forEach(img => {
          // Gereksiz stiller temizlenir
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.setAttribute('decoding', 'async');
        });
      }
  
      // HTML'i canvas'a dönüştür - web worker kullan
      requestAnimationFrame(async () => {
        try {
          const canvas = await html2canvas(container, pdfOptions.html2canvasOptions);
          
          // Canvas temizlik
          document.body.removeChild(container);
          
          // Doküman boyutları hesapla
          const imgData = canvas.toDataURL('image/png');
          const imgProps = jsPDF.getImageProperties(imgData);
          
          const pdfWidth = jsPDF.pageSize.getWidth();
          const pdfHeight = jsPDF.pageSize.getHeight();
          
          const widthRatio = pdfWidth / canvas.width;
          const heightRatio = pdfHeight / canvas.height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          const canvasWidth = canvas.width * ratio;
          const canvasHeight = canvas.height * ratio;
          
          const marginX = (pdfWidth - canvasWidth) / 2;
          const marginY = (pdfHeight - canvasHeight) / 2;
          
          // PDF dokümanı oluştur
          const orientation = pdfOptions.jsPdfOptions.orientation || 'portrait';
          const unit = pdfOptions.jsPdfOptions.unit || 'mm';
          const format = pdfOptions.jsPdfOptions.format || 'a4';
          
          const doc = new jsPDF(orientation, unit, format);
          
          // PDF'e görüntüyü ekle
          doc.addImage(
            imgData,
            'PNG',
            marginX, 
            marginY,
            canvasWidth, 
            canvasHeight
          );
          
          // PDF dosyasını indir
          doc.save(pdfOptions.filename);
        } catch (canvasError) {
          console.error('Canvas oluşturulurken hata:', canvasError);
          throw canvasError;
        }
      });
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw error;
    }
  }
}; 