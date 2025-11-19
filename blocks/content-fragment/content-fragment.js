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

  // Validate content path
  if (!contentPath) {
    console.error('Content Fragment: No content path provided');
    block.innerHTML = '<div class="cf-error"><p>Content Fragment path is required</p></div>';
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
    const description = cfData.description?.plaintext || '';
    
    // Use _publishUrl for images in EDS, _authorUrl for Universal Editor
    const imageUrl = isUniversalEditor && isOnAuthorDomain 
      ? cfData.bannerimage?._authorUrl || cfData.bannerimage?._publishUrl || ''
      : cfData.bannerimage?._publishUrl || '';

    // Universal Editor attributes
    const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationName}`;

    // Render the content fragment as a card (same structure as cards block)
    block.innerHTML = `
      <ul>
        <li data-aue-resource="${itemId}" 
            data-aue-label="${variationName || 'Elements'}" 
            data-aue-type="reference" 
            data-aue-filter="contentfragment">
          
          ${imageUrl ? `
            <div class='content-fragment-card-image'>
              <img src="${imageUrl}" 
                   alt="${description.substring(0, 50)}" 
                   data-aue-prop="bannerimage" 
                   data-aue-label="Banner Image" 
                   data-aue-type="media">
            </div>
          ` : ''}
          
          ${description ? `
            <div class='content-fragment-card-body' 
                 data-aue-prop="description" 
                 data-aue-label="Description" 
                 data-aue-type="richtext">
              ${description.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('')}
            </div>
          ` : ''}
          
        </li>
      </ul>
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
