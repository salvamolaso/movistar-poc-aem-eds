import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Content Fragments Block - Container for multiple content fragment items
 * Each item uses the content-fragment block functionality
 * Similar to cards block but for content fragments
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  const decoratePromises = [];
  
  // Dynamically import the content-fragment block decorator
  const { default: contentFragmentDecorate } = await import('../content-fragment/content-fragment.js');
  
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    
    // Create a temporary container for the content-fragment block
    const contentFragmentBlock = document.createElement('div');
    contentFragmentBlock.className = 'content-fragment';
    
    // Move all row content into the content-fragment block
    while (row.firstElementChild) {
      contentFragmentBlock.append(row.firstElementChild);
    }
    
    // Add the content-fragment block to the li
    li.append(contentFragmentBlock);
    ul.append(li);
    
    // Decorate each content-fragment block with its full functionality
    decoratePromises.push(contentFragmentDecorate(contentFragmentBlock));
  });
  
  block.textContent = '';
  block.append(ul);
  
  // Wait for all content fragments to load
  await Promise.all(decoratePromises);
}

