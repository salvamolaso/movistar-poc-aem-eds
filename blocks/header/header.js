import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Parse navigation items from authored content
 * @param {string} navItemsText Navigation items text (can be HTML from richtext)
 * @returns {Array} Array of navigation item objects
 */
function parseNavItems(navItemsText) {
  if (!navItemsText) return [];
  
  // Remove HTML tags if present (from richtext component)
  let cleanText = navItemsText;
  if (navItemsText.includes('<')) {
    // Extract text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = navItemsText;
    cleanText = tempDiv.textContent || tempDiv.innerText || '';
  }
  
  const items = cleanText.split('\n').filter(item => item.trim());
  return items.map(item => {
    const parts = item.split('|');
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const url = parts[1].trim();
      const subItems = parts[2] ? parts[2].split(',').map(sub => {
        const [subLabel, subUrl] = sub.split(':');
        return { label: subLabel.trim(), url: subUrl.trim() };
      }) : null;
      
      return { label, url, subItems };
    }
    return null;
  }).filter(item => item !== null);
}

/**
 * Create navigation from authored content
 * @param {Object} data Authored data from Universal Editor
 * @returns {Element} Navigation element
 */
function createAuthoredNav(data) {
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // Brand section
  const brandDiv = document.createElement('div');
  brandDiv.classList.add('nav-brand');
  const logoLink = document.createElement('a');
  logoLink.href = data.logoLink || '/';
  logoLink.setAttribute('aria-label', data.logoAlt || 'Home');
  
  if (data.logo) {
    const logoImg = document.createElement('img');
    logoImg.src = data.logo;
    logoImg.alt = data.logoAlt || 'Logo';
    logoLink.appendChild(logoImg);
  } else {
    logoLink.textContent = data.logoAlt || 'Logo';
  }
  
  brandDiv.appendChild(logoLink);

  // Search section
  const searchDiv = document.createElement('div');
  searchDiv.classList.add('nav-search');
  const searchForm = document.createElement('form');
  searchForm.action = data.searchAction || '/search';
  searchForm.method = 'GET';
  searchForm.setAttribute('role', 'search');
  
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = data.searchPlaceholder || 'Search';
  searchInput.setAttribute('aria-label', 'Search');
  
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.setAttribute('aria-label', 'Submit search');
  searchButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
  
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  searchDiv.appendChild(searchForm);

  // Navigation sections
  const sectionsDiv = document.createElement('div');
  sectionsDiv.classList.add('nav-sections');
  const navItems = parseNavItems(data.navItems);
  
  if (navItems.length > 0) {
    const ul = document.createElement('ul');
    navItems.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.label;
      li.appendChild(link);
      
      if (item.subItems && item.subItems.length > 0) {
        li.classList.add('nav-drop');
        const subUl = document.createElement('ul');
        item.subItems.forEach(subItem => {
          const subLi = document.createElement('li');
          const subLink = document.createElement('a');
          subLink.href = subItem.url;
          subLink.textContent = subItem.label;
          subLi.appendChild(subLink);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      
      ul.appendChild(li);
    });
    sectionsDiv.appendChild(ul);
  }

  // Tools section
  const toolsDiv = document.createElement('div');
  toolsDiv.classList.add('nav-tools');
  
  // Store link
  if (data.storeLabel || data.storeIcon) {
    const storeLink = document.createElement('a');
    storeLink.href = data.storeLink || '/tiendas';
    storeLink.classList.add('nav-tool-item');
    
    if (data.storeIcon) {
      const storeIconImg = document.createElement('img');
      storeIconImg.src = data.storeIcon;
      storeIconImg.alt = '';
      storeIconImg.classList.add('nav-tool-icon');
      storeLink.appendChild(storeIconImg);
    }
    
    if (data.storeLabel) {
      const storeSpan = document.createElement('span');
      storeSpan.textContent = data.storeLabel;
      storeLink.appendChild(storeSpan);
    }
    
    toolsDiv.appendChild(storeLink);
  }
  
  // User link
  if (data.userLabel || data.userIcon) {
    const userLink = document.createElement('a');
    userLink.href = data.userLink || '/login';
    userLink.classList.add('nav-tool-item');
    
    if (data.userIcon) {
      const userIconImg = document.createElement('img');
      userIconImg.src = data.userIcon;
      userIconImg.alt = '';
      userIconImg.classList.add('nav-tool-icon');
      userLink.appendChild(userIconImg);
    }
    
    if (data.userLabel) {
      const userSpan = document.createElement('span');
      userSpan.textContent = data.userLabel;
      userLink.appendChild(userSpan);
    }
    
    toolsDiv.appendChild(userLink);
  }

  // Append all sections to nav
  nav.appendChild(brandDiv);
  nav.appendChild(searchDiv);
  nav.appendChild(sectionsDiv);
  nav.appendChild(toolsDiv);

  return nav;
}

/**
 * Extract authored data from block
 * @param {Element} block The header block element
 * @returns {Object} Authored data object
 */
function extractAuthoredData(block) {
  const data = {};
  
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim();
      
      // Check for image first
      const img = cells[1].querySelector('img');
      let value;
      
      if (img) {
        value = img.src;
      } else {
        // For richtext fields, get innerHTML; for text fields, get textContent
        const hasHtml = cells[1].querySelector('p, div, br');
        value = hasHtml ? cells[1].innerHTML.trim() : cells[1].textContent.trim();
      }
      
      // Convert key to camelCase
      const camelKey = key.replace(/[-\s](.)/g, (_, char) => char.toUpperCase()).replace(/^./, str => str.toLowerCase());
      data[camelKey] = value;
    }
  });
  
  return data;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  let nav;
  
  // Check if block has authored content (Universal Editor)
  if (block.children.length > 0 && block.querySelector('div > div')) {
    // Authored content from Universal Editor
    const data = extractAuthoredData(block);
    nav = createAuthoredNav(data);
    block.textContent = '';
  } else {
    // Load nav as fragment (legacy approach)
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    const fragment = await loadFragment(navPath);

    // decorate nav DOM
    block.textContent = '';
    nav = document.createElement('nav');
    nav.id = 'nav';
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navBrand = nav.querySelector('.nav-brand');
    const brandLink = navBrand?.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
