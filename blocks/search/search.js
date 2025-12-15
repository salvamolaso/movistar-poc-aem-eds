/**
 * Search Block
 * Simple search bar that redirects to home page
 */
export default function decorate(block) {
  // Clear any existing content
  block.textContent = '';

  // Create search form
  const searchForm = document.createElement('form');
  searchForm.className = 'search-form';
  searchForm.action = '/';
  searchForm.method = 'GET';
  searchForm.setAttribute('role', 'search');

  // Create search icon
  const searchIcon = document.createElement('span');
  searchIcon.className = 'search-icon';
  
  const iconImg = document.createElement('img');
  iconImg.src = '/icons/search.svg';
  iconImg.alt = '';
  iconImg.width = 20;
  iconImg.height = 20;
  
  searchIcon.appendChild(iconImg);

  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = 'Busca en Movistar';
  searchInput.className = 'search-input';
  searchInput.setAttribute('aria-label', 'Buscar en Movistar');
  searchInput.autocomplete = 'off';

  // Assemble the form
  searchForm.appendChild(searchIcon);
  searchForm.appendChild(searchInput);

  // Add submit handler
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Redirect to home page
    window.location.href = '/';
  });

  // Add the form to the block
  block.appendChild(searchForm);
}

