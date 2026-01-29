/**
 * Decorates the Customer Service Features block
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];
  
  // Extract main heading from first row
  const headingRow = rows[0];
  const heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
  
  // Extract features from second row (contains 3 columns)
  const featuresRow = rows[1];
  const featureColumns = [...featuresRow.children];
  
  // Extract CTA from third row
  const ctaRow = rows[2];
  const ctaLink = ctaRow.querySelector('a');
  
  // Create new structure
  const container = document.createElement('div');
  container.className = 'customer-service-features-container';
  
  // Add heading if it exists
  if (heading) {
    const headingWrapper = document.createElement('div');
    headingWrapper.className = 'customer-service-features-heading';
    headingWrapper.append(heading);
    container.append(headingWrapper);
  }
  
  // Create features grid
  const featuresGrid = document.createElement('div');
  featuresGrid.className = 'customer-service-features-grid';
  
  featureColumns.forEach((column) => {
    const feature = document.createElement('div');
    feature.className = 'customer-service-features-item';
    
    const icon = column.querySelector('picture');
    const title = column.querySelector('h1, h2, h3, h4, h5, h6');
    const description = column.querySelector('p');
    
    if (icon) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'customer-service-features-icon';
      iconWrapper.append(icon);
      feature.append(iconWrapper);
    }
    
    if (title) {
      const titleWrapper = document.createElement('div');
      titleWrapper.className = 'customer-service-features-title';
      titleWrapper.append(title);
      feature.append(titleWrapper);
    }
    
    if (description) {
      const descWrapper = document.createElement('div');
      descWrapper.className = 'customer-service-features-description';
      descWrapper.append(description);
      feature.append(descWrapper);
    }
    
    featuresGrid.append(feature);
  });
  
  container.append(featuresGrid);
  
  // Add CTA button if it exists
  if (ctaLink) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'customer-service-features-cta';
    ctaLink.classList.add('button');
    ctaWrapper.append(ctaLink);
    container.append(ctaWrapper);
  }
  
  // Replace block content
  block.replaceChildren(container);
}

