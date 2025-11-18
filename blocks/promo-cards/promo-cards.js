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
  
  // Create card header with blue background
  const header = document.createElement('div');
  header.className = 'promo-card-header';
  
  const blueWeeks = document.createElement('div');
  blueWeeks.className = 'promo-card-badge';
  blueWeeks.innerHTML = `
    <span class="badge-text">Blue<br>Weeks</span>
  `;
  
  const headerPrice = document.createElement('div');
  headerPrice.className = 'promo-card-header-price';
  headerPrice.innerHTML = `
    <span class="price-label">Desde</span>
    <span class="price-value">0€<span class="price-period">/mes</span></span>
  `;
  
  header.appendChild(blueWeeks);
  header.appendChild(headerPrice);
  
  // Create card image
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'promo-card-image';
  const img = document.createElement('img');
  img.src = cardData.CardimageURL;
  img.alt = cardData.CardTitle;
  img.loading = 'lazy';
  imageWrapper.appendChild(img);
  
  // Create card body
  const body = document.createElement('div');
  body.className = 'promo-card-body';
  
  const title = document.createElement('h3');
  title.className = 'promo-card-title';
  title.textContent = cardData.CardTitle;
  
  const offer = document.createElement('div');
  offer.className = 'promo-card-offer';
  offer.textContent = `Ahorro hasta ${cardData.Offer}€`;
  
  const priceInfo = document.createElement('div');
  priceInfo.className = 'promo-card-price-info';
  priceInfo.innerHTML = `
    <span class="price-label">Desde</span>
    <div class="price-main">
      <span class="price-value">0</span>
      <span class="price-currency">€<span class="price-period">/mes</span></span>
    </div>
  `;
  
  const packInfo = document.createElement('div');
  packInfo.className = 'promo-card-pack';
  packInfo.textContent = 'Con tu pack miMovistar';
  
  body.appendChild(title);
  body.appendChild(offer);
  body.appendChild(priceInfo);
  body.appendChild(packInfo);
  
  // Assemble card
  li.appendChild(header);
  li.appendChild(imageWrapper);
  li.appendChild(body);
  
  return li;
}

/**
 * Decorates the promo-cards block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  // Get API endpoint from block configuration
  // Default endpoint if not specified
  const defaultEndpoint = 'https://691ae6a52d8d78557570a004.mockapi.io/api/getData/Data';
  let apiEndpoint = defaultEndpoint;
  
  // Check if block has configuration (first row with endpoint)
  const firstRow = block.querySelector(':scope > div');
  if (firstRow) {
    const textContent = firstRow.textContent.trim();
    if (textContent && textContent.startsWith('http')) {
      apiEndpoint = textContent;
    }
  }
  
  // Show loading state
  block.innerHTML = '<div class="promo-cards-loading">Loading cards...</div>';
  
  // Fetch data from API
  const cardData = await fetchCardData(apiEndpoint);
  
  if (cardData.length === 0) {
    block.innerHTML = '<div class="promo-cards-error">No cards available at this time.</div>';
    return;
  }
  
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

