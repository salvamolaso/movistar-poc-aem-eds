import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createSlider from '../../scripts/slider.js';


function setCarouselItems(number) {
    document.querySelector('.carousel > ul')?.style.setProperty('--items-per-view', number);
}

export default function decorate(block) {
  setCarouselItems(3); // Set to 3 items per view on desktop
  const slider = document.createElement('ul');
  
  // Process ALL rows as carousel items, skip empty rows
  [...block.children].forEach((row) => {
    // Skip empty rows or rows with no meaningful content
    if (!row.children || row.children.length === 0) {
      return;
    }
    
    // Check if row has at least an image or text content
    const hasImage = row.querySelector('picture, img');
    const hasText = row.textContent.trim().length > 0;
    if (!hasImage && !hasText) {
      return;
    }
    
    const li = document.createElement('li');
    
    // Read card style from the third div (index 2) if it exists
    const styleDiv = row.children[2];
    const styleParagraph = styleDiv?.querySelector('p');
    const cardStyle = styleParagraph?.textContent?.trim() || 'default';
    if (cardStyle && cardStyle !== 'default') {
      li.className = cardStyle;
    }
    
    // Read CTA style from the fourth div (index 3) if it exists
    const ctaDiv = row.children[3];
    const ctaParagraph = ctaDiv?.querySelector('p');
    const ctaStyle = ctaParagraph?.textContent?.trim() || 'default';

    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    
    // Process the li children to identify and style them correctly
    [...li.children].forEach((div, index) => {
      // First div (index 0) - Image
      if (index === 0) {
        div.className = 'cards-card-image';
      }
      // Second div (index 1) - Content with button
      else if (index === 1) {
        div.className = 'cards-card-body';
        
        // Auto-detect and apply content structure classes to ALL cards
        const paragraphs = div.querySelectorAll('p');
        let hasAppliedLabel = false;
        
        paragraphs.forEach((p, pIndex) => {
          const text = p.textContent.trim();
          
          // Skip button containers
          if (p.classList.contains('button-container')) {
            return;
          }
          
          // Check if it's a promotional badge (starts with "Promoción" or contains discount like "-30%")
          if (text.match(/^(Promoción|Oferta)/i) || text.match(/^-\d+%/) || (text.includes('%') && text.length < 10)) {
            p.className = 'promo-badge';
          }
          // Check if it's the top label (first non-badge paragraph)
          else if (!hasAppliedLabel && pIndex === 0) {
            p.className = 'promo-label';
            hasAppliedLabel = true;
          }
          // Check if it contains price information (with € symbol)
          else if (text.includes('€')) {
            p.className = 'promo-price';
            // Wrap the price value in a span if it's on multiple lines
            const lines = text.split(/\r?\n/);
            if (lines.length > 1) {
              const priceLabel = lines[0] || '';
              const priceValue = lines.slice(1).join(' ') || '';
              p.innerHTML = `${priceLabel}${priceValue ? `<span class="promo-price-value">${priceValue}</span>` : ''}`;
            } else {
              // Try to find price pattern in single line
              const priceMatch = text.match(/^(.+?)([\d,]+\s*€\/\w+)$/);
              if (priceMatch) {
                p.innerHTML = `${priceMatch[1]}<span class="promo-price-value">${priceMatch[2]}</span>`;
              }
            }
          }
          // Check if it contains "desde" (from) - typically price label
          else if (text.toLowerCase().includes('desde') || text.toLowerCase().includes('por')) {
            p.className = 'promo-price';
          }
          // Check if it contains IVA or duration info (fine print)
          else if (text.toLowerCase().includes('iva') || text.toLowerCase().includes('durante') || text.toLowerCase().includes('incluido')) {
            p.className = 'promo-details';
          }
          // If it's the first paragraph and no label applied yet
          else if (!hasAppliedLabel) {
            p.className = 'promo-label';
            hasAppliedLabel = true;
          }
        });
      }
      // Third div (index 2) - Card style configuration
      else if (index === 2) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) {
          p.style.display = 'none'; // Hide the configuration text
        }
      }
      // Fourth div (index 3) - CTA style configuration
      else if (index === 3) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) {
          p.style.display = 'none'; // Hide the configuration text
        }
      }
      // Any other divs
      else {
        div.className = 'cards-card-body';
      }
    });
    
    // Apply CTA styles to button containers
    const buttonContainers = li.querySelectorAll('p.button-container');
    buttonContainers.forEach(buttonContainer => {
      // Remove any existing CTA classes
      buttonContainer.classList.remove('default', 'cta-button', 'cta-button-secondary', 'cta-button-dark', 'cta-default');
      // Add the correct CTA class
      buttonContainer.classList.add(ctaStyle);
    });
    
    slider.append(li);
  });

  slider.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  
  block.textContent = '';
  block.append(slider);
  createSlider(block);
}