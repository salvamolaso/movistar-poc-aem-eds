/**
 * Content Fragment Block - Simplified Version
 * Fetches from AEM Publish with proper headers
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Detect Universal Editor context
  const isUniversalEditor = window.location.pathname.includes('.html') 
                            || window.self !== window.top 
                            || document.referrer.includes('adobe.com')
                            || window.location.hostname.includes('author-');
  
  // Check if we're actually on the AEM Author domain
  const isOnAuthorDomain = window.location.hostname.includes('adobeaemcloud.com');
  
  // Determine the GraphQL endpoint
  let graphqlBaseUrl;
  if (isUniversalEditor && isOnAuthorDomain) {
    // Running on AEM Author domain - use relative URL (no proxy needed, auth automatic)
    graphqlBaseUrl = '';
  } else if (isUniversalEditor) {
    // Running in Universal Editor but not on author domain - use proxy
    graphqlBaseUrl = '/graphql-author';
  } else {
    // Running on EDS site - direct to publish
    graphqlBaseUrl = 'https://publish-p171966-e1846391.adobeaemcloud.com';
  }
  
  const GRAPHQL_ENDPOINT = '/graphql/execute.json/global/CTAByPath';
  
  // Extract parameters from block content
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim() 
                      || block.querySelector(':scope div:nth-child(1) > div')?.textContent?.trim();
  const variationName = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';
  const displayStyle = block.querySelector(':scope div:nth-child(3) > div')?.textContent?.trim() || '';
  const alignment = block.querySelector(':scope div:nth-child(4) > div')?.textContent?.trim() || '';
  const ctaStyle = block.querySelector(':scope div:nth-child(5) > div')?.textContent?.trim() || 'button';

  // Validate content path
  if (!contentPath) {
    console.error('Content Fragment: No content path provided');
    block.innerHTML = '<p class="error">Content Fragment path is required</p>';
    return;
  }

  // Show loading state
  block.innerHTML = '<div class="cf-loading">Loading content...</div>';

  try {
    // URL encode the content path
    const encodedPath = encodeURIComponent(contentPath);
    
    // Build the GraphQL parameters string and encode semicolons and equals signs
    const params = `;cfPath=${encodedPath};variation=${variationName}`;
    const encodedParams = params.replace(/;/g, '%3B').replace(/=/g, '%3D');
    
    // Build the complete GraphQL URL
    const graphqlUrl = `${graphqlBaseUrl}${GRAPHQL_ENDPOINT}${encodedParams}`;
    
    console.log('Content Fragment Configuration:', {
      url: graphqlUrl,
      isUniversalEditor,
      isOnAuthorDomain,
      hostname: window.location.hostname,
      endpoint: isUniversalEditor && isOnAuthorDomain ? 'Author (relative - same domain)' 
              : isUniversalEditor ? 'Author (via proxy)' 
              : 'Publish (direct)',
      contentPath,
      variationName
    });
    
    // Make GET request to GraphQL endpoint
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    // Include credentials in Universal Editor to use existing AEM authentication
    if (isUniversalEditor) {
      fetchOptions.credentials = 'include';
    }
    
    const response = await fetch(graphqlUrl, fetchOptions);

    if (!response.ok) {
      // Log detailed error information for 403
      if (response.status === 403) {
        console.error('403 Forbidden - Authentication issue:', {
          url: graphqlUrl,
          isUniversalEditor,
          isOnAuthorDomain,
          hostname: window.location.hostname,
          fullLocation: window.location.href,
          credentials: fetchOptions.credentials
        });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    
    console.log('Content Fragment Response:', data);

    // Extract content fragment data
    const cfData = data?.data?.ctaByPath?.item;

    if (!cfData) {
      throw new Error('No content fragment data found in response');
    }

    // Extract data with fallbacks
    const title = cfData.title || '';
    const subtitle = cfData.subtitle || '';
    const description = cfData.description?.plaintext || '';
    const ctalabel = cfData.ctalabel || '';
    const ctaurl = cfData.ctaurl || '#';
    
    // Always use _publishUrl for images (as requested)
    const imageUrl = cfData.bannerimage?._publishUrl || '';

    // Universal Editor attributes
    const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationName}`;

    // Determine layout styles
    let bannerContentStyle = '';
    let bannerDetailStyle = '';
    
    if (imageUrl) {
      if (displayStyle === 'image-left' || displayStyle === 'image-right' || 
          displayStyle === 'image-top' || displayStyle === 'image-bottom') {
        // For specific layouts, set image as background on content
        bannerContentStyle = `background-image: url(${imageUrl});`;
      } else {
        // Default layout: image as background with gradient overlay
        bannerDetailStyle = `background-image: linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%), url(${imageUrl});`;
      }
    }

    // Render the content fragment
    block.innerHTML = `
      <div class='banner-content block ${displayStyle}' 
           data-aue-resource="${itemId}" 
           data-aue-label="${variationName || 'Elements'}" 
           data-aue-type="reference" 
           data-aue-filter="contentfragment" 
           style="${bannerContentStyle}">
        
        <div class='banner-detail ${alignment}' 
             style="${bannerDetailStyle}" 
             data-aue-prop="bannerimage" 
             data-aue-label="Main Image" 
             data-aue-type="media">
          
          ${title ? `<p data-aue-prop="title" data-aue-label="Title" data-aue-type="text" class='cftitle'>${title}</p>` : ''}
          
          ${subtitle ? `<p data-aue-prop="subtitle" data-aue-label="SubTitle" data-aue-type="text" class='cfsubtitle'>${subtitle}</p>` : ''}
          
          ${description ? `<div data-aue-prop="description" data-aue-label="Description" data-aue-type="richtext" class='cfdescription'><p>${description}</p></div>` : ''}
          
          ${ctalabel ? `
            <p class="button-container ${ctaStyle}">
              <a href="${ctaurl}" 
                 data-aue-prop="ctaUrl" 
                 data-aue-label="Button Link/URL" 
                 data-aue-type="reference" 
                 target="_blank" 
                 rel="noopener" 
                 data-aue-filter="page" 
                 class='button'>
                <span data-aue-prop="ctalabel" data-aue-label="Button Label" data-aue-type="text">
                  ${ctalabel}
                </span>
              </a>
            </p>
          ` : ''}
          
        </div>
        
        <div class='banner-logo'></div>
      </div>
    `;

    console.log('Content Fragment rendered successfully');

  } catch (error) {
    // Enhanced error logging
    const endpointType = isUniversalEditor && isOnAuthorDomain ? 'Author (relative - same domain)' 
                       : isUniversalEditor ? 'Author (via proxy)' 
                       : 'Publish (direct)';
    
    console.error('Error loading Content Fragment:', {
      error: error.message,
      stack: error.stack,
      contentPath,
      variationName,
      isUniversalEditor,
      isOnAuthorDomain,
      hostname: window.location.hostname,
      endpointType
    });
    
    // Show error message
    block.innerHTML = `
      <div class="cf-error">
        <p>Failed to load content fragment</p>
        <p class="error-details">Path: ${contentPath}</p>
        <p class="error-details">Error: ${error.message}</p>
        <p class="error-details">Endpoint: ${endpointType}</p>
        <p class="error-details">Check console for more details</p>
      </div>
    `;
  }
}
