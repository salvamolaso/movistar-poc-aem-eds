/**
 * Decorates the Customer Service Features block
 * Supports two formats:
 * 1. Horizontal: Row 1 = heading, Row 2 = 3 features, Row 3 = CTA
 * 2. Vertical: Sequential rows with heading, icon, title, description per feature
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];

  // Check if this is horizontal format (row 2 has multiple divs with content)
  const isHorizontalFormat = rows.length === 3
    && rows[1]?.querySelectorAll(':scope > div').length >= 3;

  if (isHorizontalFormat) {
    decorateHorizontalFormat(block, rows);
  } else {
    decorateVerticalFormat(block, rows);
  }
}

/**
 * Decorate horizontal format where features are in columns
 */
function decorateHorizontalFormat(block, rows) {
  // Extract main heading from first row
  const headingRow = rows[0];
  const heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');

  // Extract features from second row (three sibling div elements)
  const featuresRow = rows[1];
  const featureColumns = [...featuresRow.querySelectorAll(':scope > div')];

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

/**
 * Decorate vertical format where each row contains one piece of data
 * Format: heading | icon | title | description | icon | title | description | icon | title | description | cta
 */
function decorateVerticalFormat(block, rows) {
  // Create new structure
  const container = document.createElement('div');
  container.className = 'customer-service-features-container';

  // First row is the heading
  const headingRow = rows[0];
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
  // Skip first row (heading) and process remaining rows
  let currentFeature = null;
  const features = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cell = row.querySelector(':scope > div');

    if (!cell) continue;

    const picture = cell.querySelector('picture');
    const text = cell.textContent.trim();
    const link = cell.querySelector('a');

    // If row has a picture, start a new feature
    if (picture) {
      if (currentFeature) {
        features.push(currentFeature);
      }
      currentFeature = { icon: picture };
    } else if (link && text) {
      // This is the CTA link - we're done with features
      break;
    } else if (text && currentFeature) {
      // If no title yet, this is the title
      if (!currentFeature.title) {
        currentFeature.title = text;
      } else if (!currentFeature.description) {
        // Otherwise it's the description
        currentFeature.description = text;
      }
    }
  }

  // Add last feature
  if (currentFeature) {
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

    featuresGrid.append(feature);
  });

  container.append(featuresGrid);

  // Look for CTA link in remaining rows
  for (let i = 1; i < rows.length; i += 1) {
    const ctaLink = rows[i].querySelector('a');
    if (ctaLink) {
      const ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'customer-service-features-cta';
      ctaLink.classList.add('button');
      ctaWrapper.append(ctaLink);
      container.append(ctaWrapper);
      break;
    }
  }

  // Replace block content
  block.replaceChildren(container);
}

