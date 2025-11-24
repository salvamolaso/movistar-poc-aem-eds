/**
 * LCP Image Preload Script
 * This script runs BEFORE the main scripts to discover and preload the LCP image
 * Add this as an inline script in head.html for maximum performance
 */

(function() {
  'use strict';
  
  /**
   * Extract potential LCP image URLs from the page content
   * This runs synchronously to discover images before blocks are decorated
   */
  function extractLCPImages() {
    const lcpCandidates = [];
    
    // 1. Check for meta tags (og:image, lcp-image)
    const metaTags = document.querySelectorAll('meta[property="og:image"], meta[name="lcp-image"], meta[property="lcp-image"]');
    metaTags.forEach(meta => {
      const url = meta.getAttribute('content');
      if (url) lcpCandidates.push({ url, priority: 10 });
    });
    
    // 2. Check first content-fragments block for image URLs
    const firstFragmentBlock = document.querySelector('.content-fragments, .content-fragment, .hero');
    if (firstFragmentBlock) {
      // Look for image URLs in the block content (before JavaScript transforms it)
      const images = firstFragmentBlock.querySelectorAll('img');
      images.forEach((img, index) => {
        if (img.src && index === 0) { // First image is likely LCP
          lcpCandidates.push({ url: img.src, priority: 9 });
        }
      });
      
      // Look for image URLs in links or text content
      const links = firstFragmentBlock.querySelectorAll('a[href*=".jpg"], a[href*=".png"], a[href*=".webp"], a[href*="get-pic"]');
      links.forEach((link, index) => {
        if (index === 0) { // First link might be the image
          lcpCandidates.push({ url: link.href, priority: 8 });
        }
      });
      
      // Look for data attributes
      const dataImage = firstFragmentBlock.querySelector('[data-lcp-image], [data-image-url]');
      if (dataImage) {
        const url = dataImage.getAttribute('data-lcp-image') || dataImage.getAttribute('data-image-url');
        if (url) lcpCandidates.push({ url, priority: 10 });
      }
    }
    
    // 3. Check for images in the first section
    const firstSection = document.querySelector('main .section:first-child img');
    if (firstSection && firstSection.src) {
      lcpCandidates.push({ url: firstSection.src, priority: 7 });
    }
    
    return lcpCandidates;
  }
  
  /**
   * Preload an image with high priority
   */
  function preloadImage(url) {
    // Check if already preloaded
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) {
      return; // Already preloaded
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    
    // Detect and set image type
    if (url.includes('.webp') || url.includes('format=webp') || url.includes('format=webply')) {
      link.type = 'image/webp';
    } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('format=jpg')) {
      link.type = 'image/jpeg';
    } else if (url.includes('.png') || url.includes('format=png')) {
      link.type = 'image/png';
    }
    
    // Add crossorigin for external images
    if (url.startsWith('http') && !url.includes(window.location.hostname)) {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    console.log('[LCP Preload] Preloading image:', url);
  }
  
  /**
   * Preconnect to image domains
   */
  function preconnectImageDomains() {
    const domains = [
      'https://ssr.col.movistar.es',
      'https://publish-p171966-e1846391.adobeaemcloud.com',
      'https://author-p171966-e1846391.adobeaemcloud.com'
    ];
    
    domains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }
  
  /**
   * Main execution
   */
  function init() {
    // Preconnect to image domains immediately
    preconnectImageDomains();
    
    // Extract and preload LCP images
    const candidates = extractLCPImages();
    
    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);
    
    // Preload top candidate
    if (candidates.length > 0) {
      preloadImage(candidates[0].url);
      
      // Also preload second candidate if exists (as backup)
      if (candidates.length > 1 && candidates[1].priority >= 8) {
        preloadImage(candidates[1].url);
      }
    } else {
      console.warn('[LCP Preload] No LCP image candidates found. Consider adding og:image meta tag or data-lcp-image attribute.');
    }
  }
  
  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

