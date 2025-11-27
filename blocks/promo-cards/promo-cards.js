import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Adds preconnect link for a given URL origin
 * @param {string} url - The URL to preconnect to
 */
function addPreconnect(url) {
  try {
    const urlObj = new URL(url);
    const origin = urlObj.origin;
    
    // Check if preconnect already exists
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      return;
    }
    
    // Create preconnect link
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = origin;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
    
    console.log('Added preconnect for:', origin);
  } catch (error) {
    console.warn('Could not add preconnect for:', url, error);
  }
}

/**
 * Adds preconnect links for image origins from card data
 * @param {Array} cardData - Array of card data
 */
function setupImagePreconnects(cardData) {
  const imageOrigins = new Set();
  
  cardData.forEach((card) => {
    const imageUrl = card.CardimageURL;
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      try {
        const origin = new URL(imageUrl).origin;
        imageOrigins.add(origin);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });
  
  // Add preconnect for each unique origin
  imageOrigins.forEach((origin) => {
    addPreconnect(origin);
  });
}

/**
 * Fetches data from the API endpoint
 * @param {string} apiEndpoint - The API endpoint URL
 * @returns {Promise<Array>} Array of card data
 */
async function fetchCardData(apiEndpoint) {
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching card data:', error);
    return [];
  }
}

/**
 * Creates a single card element
 * @param {Object} cardData - Card data object
 * @returns {HTMLElement} Card list item element
 */
function createCard(cardData) {
  const li = document.createElement('li');
  li.className = 'promo-card';
  
  // Create card image
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'promo-card-image';
  
  const imageUrl = cardData.CardimageURL || '';
  console.log('Processing image URL:', imageUrl);
  
  // Check if URL is external (starts with http:// or https://)
  const isExternalUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  
  if (isExternalUrl) {
    // External URLs: use simple img tag
    console.log('Using simple img tag for external URL');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = cardData.CardTitle || 'Product image';
    imageWrapper.appendChild(img);
  } else {
    // Relative paths (AEM): use createOptimizedPicture
    console.log('Using createOptimizedPicture for relative path');
    const picture = createOptimizedPicture(
      imageUrl,
      cardData.CardTitle || 'Product image',
      false,
      [{ width: '750' }]
    );
    imageWrapper.appendChild(picture);
  }
  
  // Create card body
  const body = document.createElement('div');
  body.className = 'promo-card-body';
  
  const title = document.createElement('h3');
  title.className = 'promo-card-title';
  title.textContent = cardData.CardTitle || '';
  
  const offer = document.createElement('div');
  offer.className = 'promo-card-offer';
  offer.textContent = `Ahorro hasta ${cardData.Offer || '0'}€`;
  
  const priceInfo = document.createElement('div');
  priceInfo.className = 'promo-card-price-info';
  priceInfo.innerHTML = `
    <span class="price-label">${cardData.Description_1 || 'Desde'}</span>
    <div class="price-main">
      <span class="price-value">${cardData.EmiPrice || '0'}</span>
      <span class="price-currency">€<span class="price-period">/mes</span></span>
    </div>
  `;
  
  const packInfo = document.createElement('div');
  packInfo.className = 'promo-card-pack';
  packInfo.textContent = cardData.Description_2 || '';
  
  body.appendChild(title);
  body.appendChild(offer);
  body.appendChild(priceInfo);
  body.appendChild(packInfo);
  
  // Assemble card
  li.appendChild(imageWrapper);
  li.appendChild(body);
  
  return li;
}

/**
 * Decorates the promo-cards block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  // Hardcoded API endpoint - not authored by users
  const apiEndpoint = 'https://691ae6a52d8d78557570a004.mockapi.io/api/getData/Data';
  
  // Add preconnect for API endpoint early
  addPreconnect(apiEndpoint);
  
  // Show loading state
  block.innerHTML = '<div class="promo-cards-loading">Loading cards...</div>';
  
  // Fetch data from API
  const cardData = await fetchCardData(apiEndpoint);
  
  console.log('API Response:', cardData);
  console.log('Sample image URL from API:', cardData[0]?.CardimageURL);
  
  if (cardData.length === 0) {
    block.innerHTML = '<div class="promo-cards-error">No cards available at this time.</div>';
    return;
  }
  
  // Setup preconnect for image origins to improve loading performance
  setupImagePreconnects(cardData);
  
  // Create card list
  const ul = document.createElement('ul');
  ul.className = 'promo-cards-list';
  
  // Create cards from API data
  cardData.forEach((data) => {
    const card = createCard(data);
    ul.appendChild(card);
  });
  
  // Replace block content with cards
  block.textContent = '';
  block.appendChild(ul);
}
