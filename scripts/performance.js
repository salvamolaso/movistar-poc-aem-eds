/**
 * Performance optimization utilities
 * Handles lazy loading, image optimization, and resource prioritization
 */

/**
 * Optimize images with Intersection Observer for better lazy loading
 */
export function optimizeLazyLoading() {
  // Early return if browser doesn't support IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          // Load srcset if exists
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          // Remove loading state
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    },
    {
      // Start loading images 50px before they enter viewport
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  // Observe all lazy images
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Preload critical images
 */
export function preloadCriticalImages() {
  // Find the first visible image (likely LCP element)
  const firstImage = document.querySelector('.first-content-fragment img, .hero img, .content-fragment-card-image img');
  
  if (firstImage && firstImage.src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = firstImage.src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  }
}

/**
 * Optimize font loading with font-display swap
 */
export function optimizeFontLoading() {
  // Check if fonts are already loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
      // Store in sessionStorage for subsequent page loads
      try {
        sessionStorage.setItem('fonts-loaded', 'true');
      } catch (e) {
        // Ignore storage errors
      }
    });
  }
}

/**
 * Reduce JavaScript execution time
 */
export function deferNonCriticalScripts() {
  // Find and defer non-critical scripts
  document.querySelectorAll('script[src]:not([type="module"])').forEach((script) => {
    if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
      script.defer = true;
    }
  });
}

/**
 * Optimize third-party resources
 */
export function optimizeThirdParty() {
  // Lazy load third-party iframes
  document.querySelectorAll('iframe[data-src]').forEach((iframe) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          iframe.src = iframe.dataset.src;
          observer.unobserve(iframe);
        }
      });
    });
    observer.observe(iframe);
  });
}

/**
 * Add image dimension hints to prevent layout shift
 */
export function addImageDimensions() {
  document.querySelectorAll('img:not([width]):not([height])').forEach((img) => {
    // Get natural dimensions or use aspect ratio
    const aspectRatio = 4 / 3; // Default aspect ratio
    
    if (img.complete && img.naturalWidth) {
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;
    } else {
      // Set reasonable defaults
      img.loading = 'lazy';
      img.decoding = 'async';
    }
  });
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runOptimizations();
    });
  } else {
    runOptimizations();
  }
}

function runOptimizations() {
  // Optimize font loading
  optimizeFontLoading();
  
  // Optimize lazy loading
  optimizeLazyLoading();
  
  // Add image dimensions
  addImageDimensions();
  
  // Optimize third-party resources
  optimizeThirdParty();
  
  // Defer non-critical scripts
  deferNonCriticalScripts();
}

// Auto-initialize if not imported as module
if (typeof window !== 'undefined') {
  initPerformanceOptimizations();
}

