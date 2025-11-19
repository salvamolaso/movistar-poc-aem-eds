import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Handle nested blocks inside columns
  // Look for divs with class names (blocks have classes like 'content-fragment', 'hero', etc.)
  const nestedBlocks = block.querySelectorAll(':scope > div > div > div[class]');
  
  // Decorate and load any nested blocks that haven't been loaded yet
  for (const nestedBlock of nestedBlocks) {
    // Check if it's a block (has a class and is not just a wrapper like 'button-container')
    const hasBlockClass = Array.from(nestedBlock.classList).some(cls => 
      !cls.includes('columns') && 
      !cls.includes('button-container') &&
      !cls.includes('default-content')
    );
    
    if (hasBlockClass && !nestedBlock.dataset.blockStatus) {
      decorateBlock(nestedBlock);
      await loadBlock(nestedBlock);
    }
  }
}
