/**
 * Creates a slider with navigation arrows
 * @param {Element} block - The carousel block element
 */
export default function createSlider(block) {
  const slider = block.querySelector('ul');
  if (!slider) return;

  const slides = [...slider.children];
  if (slides.length === 0) return;

  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav carousel-nav-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav carousel-nav-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  block.appendChild(prevButton);
  block.appendChild(nextButton);

  let currentIndex = 0;
  let itemsPerView = parseInt(getComputedStyle(slider).getPropertyValue('--items-per-view') || 3, 10);
  
  // Update items per view on resize
  const updateItemsPerView = () => {
    const newItemsPerView = parseInt(getComputedStyle(slider).getPropertyValue('--items-per-view') || 3, 10);
    if (newItemsPerView !== itemsPerView) {
      itemsPerView = newItemsPerView;
      currentIndex = Math.min(currentIndex, Math.max(0, slides.length - itemsPerView));
      updateSliderPosition();
      updateButtonStates();
    }
  };

  const updateSliderPosition = () => {
    const slideWidth = slider.offsetWidth / itemsPerView;
    const gap = parseInt(getComputedStyle(slider).gap || 20, 10);
    const offset = -(currentIndex * (slideWidth + gap));
    slider.style.transform = `translateX(${offset}px)`;
  };

  const updateButtonStates = () => {
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= slides.length - itemsPerView;
    
    prevButton.style.opacity = prevButton.disabled ? '0.3' : '1';
    nextButton.style.opacity = nextButton.disabled ? '0.3' : '1';
    prevButton.style.cursor = prevButton.disabled ? 'not-allowed' : 'pointer';
    nextButton.style.cursor = nextButton.disabled ? 'not-allowed' : 'pointer';
  };

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateSliderPosition();
      updateButtonStates();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - itemsPerView) {
      currentIndex += 1;
      updateSliderPosition();
      updateButtonStates();
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateItemsPerView();
      updateSliderPosition();
    }, 100);
  });

  // Initialize
  updateButtonStates();
  slider.style.transition = 'transform 0.3s ease-in-out';
}

