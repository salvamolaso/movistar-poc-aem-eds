/**
 * Decorates the Customer Service Features block
 * Supports two formats:
 * 1. Horizontal: Optional image row, heading row, 3 features row, CTA row
 * 2. Vertical: Sequential rows with optional image, heading, icon, title, description per feature
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];

  // Check if first row contains only an image (hero image)
  const firstRowHasOnlyImage = rows[0]?.querySelector('picture') 
    && !rows[0]?.querySelector('h1, h2, h3, h4, h5, h6, p, a');

  // Check if this is horizontal format
  // Horizontal format: 3-4 rows with row containing 3 feature columns
  const featureRowIndex = firstRowHasOnlyImage ? 2 : 1;
  const isHorizontalFormat = (rows.length === 3 || rows.length === 4)
    && rows[featureRowIndex]?.querySelectorAll(':scope > div').length >= 3;

  if (isHorizontalFormat) {
    decorateHorizontalFormat(block, rows);
  } else {
    decorateVerticalFormat(block, rows);
  }
}

/**
 * Decorate horizontal format where features are in columns
 * Format: [Optional image row] | heading row | features row (3 columns) | CTA row
 */
function decorateHorizontalFormat(block, rows) {
  let currentRowIndex = 0;

  // Check for optional hero image in first row
  const heroImage = rows[currentRowIndex]?.querySelector('picture');
  const hasHeroImage = heroImage && !rows[currentRowIndex]?.querySelector('h1, h2, h3, h4, h5, h6, p, a');
  
  if (hasHeroImage) {
    currentRowIndex += 1;
  }

  // Extract main heading
  const headingRow = rows[currentRowIndex];
  const heading = headingRow?.querySelector('h1, h2, h3, h4, h5, h6');
  currentRowIndex += 1;

  // Extract features from features row (three sibling div elements)
  const featuresRow = rows[currentRowIndex];
  const featureColumns = [...featuresRow.querySelectorAll(':scope > div')];
  currentRowIndex += 1;

  // Extract CTA from last row
  const ctaRow = rows[currentRowIndex];
  const ctaLink = ctaRow?.querySelector('a');

  // Create new structure
  const container = document.createElement('div');
  container.className = 'customer-service-features-container';

  // Add hero image if it exists
  if (hasHeroImage && heroImage) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'customer-service-features-image';
    imageWrapper.append(heroImage);
    container.append(imageWrapper);
  }

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

/**
 * Decorate vertical format where each row contains one piece of data
 * Format: [Optional image row] | heading | icon | title | description | icon | title | description | icon | title | description | link | cta-text
 */
function decorateVerticalFormat(block, rows) {
  let currentRowIndex = 0;

  // Check for optional hero image in first row
  const heroImage = rows[currentRowIndex]?.querySelector('picture');
  const firstRowHeading = rows[currentRowIndex]?.querySelector('h1, h2, h3, h4, h5, h6');
  const hasHeroImage = heroImage && !firstRowHeading;
  
  if (hasHeroImage) {
    currentRowIndex += 1;
  }

  // Create new structure
  const container = document.createElement('div');
  container.className = 'customer-service-features-container';

  // Add hero image if it exists
  if (hasHeroImage && heroImage) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'customer-service-features-image';
    imageWrapper.append(heroImage.cloneNode(true));
    container.append(imageWrapper);
  }

  // Extract heading from current row
  const headingRow = rows[currentRowIndex];
  const heading = headingRow?.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    const headingWrapper = document.createElement('div');
    headingWrapper.className = 'customer-service-features-heading';
    headingWrapper.append(heading);
    container.append(headingWrapper);
  }

  // Create features grid
  const featuresGrid = document.createElement('div');
  featuresGrid.className = 'customer-service-features-grid';

  // Parse rows to extract features
  // Skip processed rows and process remaining rows
  // Look for patterns of: icon title description
  const features = [];
  let currentFeature = null;

  for (let i = currentRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cell = row.querySelector(':scope > div');

    if (!cell) continue;

    const picture = cell.querySelector('picture');
    const text = cell.textContent.trim();
    const link = cell.querySelector('a');

    // If row has a link, this is the CTA section - stop processing features
    if (link) {
      // Save current feature if exists
      if (currentFeature && (currentFeature.title || currentFeature.description)) {
        features.push(currentFeature);
        currentFeature = null;
      }
      break;
    }

    // Skip empty rows
    if (!text && !picture) {
      // Empty row might signal end of a feature
      if (currentFeature && (currentFeature.title || currentFeature.description)) {
        features.push(currentFeature);
        currentFeature = null;
      }
      continue;
    }

    // If row has a picture, start a new feature with icon
    if (picture) {
      // Save previous feature if exists
      if (currentFeature && (currentFeature.title || currentFeature.description)) {
        features.push(currentFeature);
      }
      currentFeature = { icon: picture };
      continue;
    }

    // If we have text content
    if (text) {
      // Start a new feature if we don't have one
      if (!currentFeature) {
        currentFeature = {};
      }

      // If no title yet, this is the title
      if (!currentFeature.title) {
        currentFeature.title = text;
      } else if (!currentFeature.description) {
        // Otherwise it's the description
        currentFeature.description = text;
        // After description, feature is complete
        features.push(currentFeature);
        currentFeature = null;
      }
    }
  }

  // Add last feature if exists
  if (currentFeature && (currentFeature.title || currentFeature.description)) {
    features.push(currentFeature);
  }

  // Create feature items
  features.forEach((featureData) => {
    const feature = document.createElement('div');
    feature.className = 'customer-service-features-item';

    if (featureData.icon) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'customer-service-features-icon';
      iconWrapper.append(featureData.icon);
      feature.append(iconWrapper);
    }

    if (featureData.title) {
      const titleWrapper = document.createElement('div');
      titleWrapper.className = 'customer-service-features-title';
      const titleElement = document.createElement('h2');
      titleElement.textContent = featureData.title;
      titleWrapper.append(titleElement);
      feature.append(titleWrapper);
    }

    if (featureData.description) {
      const descWrapper = document.createElement('div');
      descWrapper.className = 'customer-service-features-description';
      const descElement = document.createElement('p');
      descElement.textContent = featureData.description;
      descWrapper.append(descElement);
      feature.append(descWrapper);
    }

    // Only add feature if it has at least a title
    if (featureData.title) {
      featuresGrid.append(feature);
    }
  });

  container.append(featuresGrid);

  // Look for CTA: link row followed by text row
  // The link row has the URL, the next row has the button text
  let ctaUrl = null;
  let ctaText = null;

  for (let i = currentRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cell = row.querySelector(':scope > div');
    if (!cell) continue;

    const link = cell.querySelector('a');
    const text = cell.textContent.trim();

    if (link && !ctaUrl) {
      // Found the link row
      ctaUrl = link.getAttribute('href');
      // Check next row for button text
      if (i + 1 < rows.length) {
        const nextRow = rows[i + 1];
        const nextCell = nextRow.querySelector(':scope > div');
        const nextText = nextCell?.textContent.trim();
        if (nextText && !nextCell.querySelector('a')) {
          ctaText = nextText;
        }
      }
      break;
    }
  }

  // Create CTA button if we have URL
  if (ctaUrl) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'customer-service-features-cta';
    const ctaLink = document.createElement('a');
    ctaLink.href = ctaUrl;
    ctaLink.textContent = ctaText || 'Learn More';
    ctaLink.classList.add('button');
    ctaWrapper.append(ctaLink);
    container.append(ctaWrapper);
  }

  // Replace block content
  block.replaceChildren(container);
}

