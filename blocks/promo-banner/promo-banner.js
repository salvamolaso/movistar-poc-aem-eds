import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Create main container structure
  const container = document.createElement('div');
  container.className = 'promo-banner-container';

  // Section 1: Image collage (left)
  const imageSection = document.createElement('div');
  imageSection.className = 'promo-banner-image';

  // Section 2: Discount (center)
  const discountSection = document.createElement('div');
  discountSection.className = 'promo-banner-discount';

  // Section 3: Details (right)
  const detailsSection = document.createElement('div');
  detailsSection.className = 'promo-banner-details';

  // Process rows based on content
  rows.forEach((row, index) => {
    const content = row.querySelector('div');
    if (!content) return;

    switch (index) {
      case 0: {
        // First row: Image
        const picture = row.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) {
            const optimizedPic = createOptimizedPicture(
              img.src,
              img.alt || 'Promotional content',
              false,
              [{ width: '600' }],
            );
            moveInstrumentation(img, optimizedPic.querySelector('img'));
            imageSection.appendChild(optimizedPic);
          }
        }
        break;
      }
      case 1: {
        // Second row: Discount section (value + label)
        // First element is typically the large discount value
        const discountValue = document.createElement('div');
        discountValue.className = 'promo-banner-discount-value';

        const offerLabel = document.createElement('div');
        offerLabel.className = 'promo-banner-offer-label';

        // Parse the content - first line is discount, rest is label
        const paragraphs = content.querySelectorAll('p');
        if (paragraphs.length > 0) {
          discountValue.innerHTML = paragraphs[0].innerHTML;
          if (paragraphs.length > 1) {
            offerLabel.innerHTML = paragraphs[1].innerHTML;
          }
        } else {
          discountValue.innerHTML = content.innerHTML;
        }

        discountSection.appendChild(discountValue);
        discountSection.appendChild(offerLabel);
        break;
      }
      case 2: {
        // Third row: Product details (title + price)
        const paragraphs = content.querySelectorAll('p');
        paragraphs.forEach((p, pIndex) => {
          const text = p.textContent.trim();
          if (pIndex === 0) {
            // First paragraph is the title
            const title = document.createElement('h2');
            title.className = 'promo-banner-title';
            title.innerHTML = p.innerHTML;
            detailsSection.appendChild(title);
          } else if (text.includes('€') || text.includes('mes')) {
            // Price information
            const priceInfo = document.createElement('div');
            priceInfo.className = 'promo-banner-price';
            priceInfo.innerHTML = p.innerHTML;
            detailsSection.appendChild(priceInfo);
          } else {
            // Other text
            const textDiv = document.createElement('div');
            textDiv.className = 'promo-banner-text';
            textDiv.innerHTML = p.innerHTML;
            detailsSection.appendChild(textDiv);
          }
        });
        break;
      }
      case 3: {
        // Fourth row: CTA button
        const ctaContainer = document.createElement('div');
        ctaContainer.className = 'promo-banner-cta';
        const link = content.querySelector('a');
        if (link) {
          link.className = 'promo-banner-button';
          ctaContainer.appendChild(link.cloneNode(true));
        } else {
          ctaContainer.innerHTML = content.innerHTML;
        }
        detailsSection.appendChild(ctaContainer);
        break;
      }
      default:
        break;
    }
  });

  // Assemble the layout
  container.appendChild(imageSection);
  container.appendChild(discountSection);
  container.appendChild(detailsSection);

  // Clear block and append new structure
  block.textContent = '';
  block.appendChild(container);
}
