import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorates the category-grid block
 * Expected structure:
 * Each row = one category: | Image | Category Name | Link URL |
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  block.innerHTML = '';

  const grid = document.createElement('ul');
  grid.classList.add('category-grid-list');

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const picture = cells[0]?.querySelector('picture, img');
    const nameEl = cells[1];
    const linkEl = cells[2]?.querySelector('a') || cells[1]?.querySelector('a');

    const li = document.createElement('li');
    li.classList.add('category-grid-item');

    const name = nameEl ? nameEl.textContent.trim() : '';
    const href = linkEl ? linkEl.href : '#';

    const a = document.createElement('a');
    a.href = href;
    a.classList.add('category-grid-link');
    a.setAttribute('aria-label', name);

    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(img.src, name, false, [{ width: '200' }]);
        optimized.querySelector('img').classList.add('category-grid-img');
        a.appendChild(optimized);
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.classList.add('category-grid-img-placeholder');
      a.appendChild(placeholder);
    }

    const label = document.createElement('span');
    label.classList.add('category-grid-label');
    label.textContent = name;
    a.appendChild(label);

    li.appendChild(a);
    grid.appendChild(li);
  });

  block.appendChild(grid);
}
