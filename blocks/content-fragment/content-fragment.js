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
    graphqlBaseUrl = 'https://publish-p169803-e1812709.adobeaemcloud.com';
  }
  
  const GRAPHQL_ENDPOINT = '/graphql/execute.json/global/getFragment';
  
  // Extract parameters from block content
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim() 
                      || block.querySelector(':scope div:nth-child(1) > div')?.textContent?.trim();
  const variationName = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'main';

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
      queryName: 'getFragment',
      isUniversalEditor,
      isOnAuthorDomain,
      hostname: window.location.hostname,
      endpoint: isUniversalEditor && isOnAuthorDomain ? 'Author (relative - same domain)' 
              : isUniversalEditor ? 'Author (via proxy)' 
              : 'Publish (direct)',
      contentPath,
      variationName,
      fullUrl: graphqlUrl
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
      // Log detailed error information
      const errorDetails = {
        url: graphqlUrl,
        status: response.status,
        statusText: response.statusText,
        isUniversalEditor,
        isOnAuthorDomain,
        hostname: window.location.hostname,
        fullLocation: window.location.href,
        credentials: fetchOptions.credentials
      };
      
      if (response.status === 403) {
        console.error('403 Forbidden - Authentication issue:', errorDetails);
      } else if (response.status === 404) {
        console.error('404 Not Found - GraphQL query or endpoint not found:', errorDetails);
        throw new Error(`GraphQL query not found. Make sure 'getFragment' query is published in AEM.`);
      } else {
        console.error('HTTP error:', errorDetails);
      }
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    // Parse JSON response
    const data = await response.json();
    
    // Log available query keys to help debug response structure
    const availableQueries = data?.data ? Object.keys(data.data) : [];
    console.log('Content Fragment Response:', {
      availableQueries,
      fullResponse: data
    });

    // Extract content fragment data - try different response structures
    // The new getFragment query uses fragmentByPath
    let cfData = data?.data?.fragmentByPath?.item 
                 || data?.data?.telephonicaDemoModelByPath?.item
                 || data?.data?.ctaByPath?.item;

    if (!cfData) {
      console.error('Unable to find content fragment data. Available query keys:', availableQueries);
      console.error('Full response structure:', JSON.stringify(data, null, 2));
      throw new Error(`No content fragment data found. Available queries: ${availableQueries.join(', ') || 'none'}`);
    }

    // Extract data with fallbacks for the new model
    const title = cfData.title || '';
    const discount = cfData.discount || '';
    const model = cfData.model || '';
    const description = cfData.description?.plaintext || '';
    
    // Use _publishUrl for images in EDS, _authorUrl for Universal Editor
    const imageUrl = isUniversalEditor && isOnAuthorDomain 
      ? cfData.bannerimage?._authorUrl || cfData.bannerimage?._publishUrl || ''
      : cfData.bannerimage?._publishUrl || '';

    // Universal Editor attributes
    const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationName}`;

    // Render the content fragment as a card with new fields
    block.innerHTML = `
      <ul>
        <li data-aue-resource="${itemId}" 
            data-aue-label="${variationName || 'Elements'}" 
            data-aue-type="reference" 
            data-aue-filter="contentfragment">
          
          ${imageUrl ? `
            <div class='content-fragment-card-image'>
              <img src="${imageUrl}" 
                   alt="${title || description.substring(0, 50)}" 
                   data-aue-prop="bannerimage" 
                   data-aue-label="Banner Image" 
                   data-aue-type="media">
            </div>
          ` : ''}
          
          <div class='content-fragment-card-body'>
            ${discount ? `
              <p data-aue-prop="discount" 
                 data-aue-label="Discount" 
                 data-aue-type="text">${discount}</p>
            ` : ''}
            
            ${model ? `
              <p data-aue-prop="model" 
                 data-aue-label="Model" 
                 data-aue-type="text">${model}</p>
            ` : ''}
            
            ${title ? `
              <p data-aue-prop="title" 
                 data-aue-label="Title" 
                 data-aue-type="text">${title}</p>
            ` : ''}
            
            ${description ? `
              <div class="cf-description" 
                   data-aue-prop="description" 
                   data-aue-label="Description" 
                   data-aue-type="richtext">
                ${description.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('')}
              </div>
            ` : ''}
          </div>
          
        </li>
      </ul>
    `;

    console.log('Content Fragment rendered successfully');

  } catch (error) {
    // Enhanced error logging
    const endpointType = isUniversalEditor && isOnAuthorDomain ? 'Author (relative - same domain)' 
                       : isUniversalEditor ? 'Author (via proxy)' 
                       : 'Publish (direct)';
    
    // Detect CORS errors
    const isCorsError = error.message.includes('CORS') 
                       || error.message.includes('NetworkError') 
                       || error.name === 'TypeError' && !error.message.includes('HTTP error');
    
    console.error('Error loading Content Fragment:', {
      error: error.message,
      errorType: isCorsError ? 'CORS Error' : 'Other Error',
      stack: error.stack,
      contentPath,
      variationName,
      isUniversalEditor,
      isOnAuthorDomain,
      hostname: window.location.hostname,
      endpointType
    });
    
    // Show error message
    let errorMessage = error.message;
    let troubleshooting = 'Check console for more details';
    
    if (isCorsError) {
      errorMessage = 'CORS Error: Unable to fetch content fragment';
      troubleshooting = `
        <strong>Troubleshooting:</strong><br>
        1. Ensure the GraphQL persisted query 'getFragment' is published in AEM<br>
        2. Check AEM CORS configuration allows requests from this domain<br>
        3. Verify the content fragment is published<br>
        4. Clear browser cache and AEM dispatcher cache
      `;
    }
    
    block.innerHTML = `
      <div class="cf-error">
        <p><strong>Failed to load content fragment</strong></p>
        <p class="error-details">Path: ${contentPath}</p>
        <p class="error-details">Variation: ${variationName}</p>
        <p class="error-details">Error: ${errorMessage}</p>
        <p class="error-details">Endpoint: ${endpointType}</p>
        <div class="error-details" style="margin-top: 12px;">${troubleshooting}</div>
      </div>
    `;
  }
}
