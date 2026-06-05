/**
 * Decorates the content-teaser block
 * Expected structure: Row 1 = image, Row 2 = heading, Row 3 = text, Row 4 = link
 * OR two-column: | Image | Text content |
 * Variant: "image-right" reverses the order
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Check if it's a single-row two-column layout or multi-row
  if (rows.length === 1) {
    const cols = [...rows[0].querySelectorAll(':scope > div')];
    if (cols.length >= 2) {
      // Two-column layout: image | content
      const imageCol = cols[0];
      const contentCol = cols[1];
      imageCol.classList.add('content-teaser-image');
      contentCol.classList.add('content-teaser-content');
      // Wrap links as buttons
      contentCol.querySelectorAll('a').forEach((a) => {
        a.classList.add('button', 'primary');
      });
    }
  } else {
    // Multi-row: image row + content rows
    const wrapper = document.createElement('div');
    wrapper.classList.add('content-teaser-inner');

    const imageDiv = document.createElement('div');
    imageDiv.classList.add('content-teaser-image');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content-teaser-content');

    rows.forEach((row, i) => {
      const hasPicture = row.querySelector('picture, img');
      if (hasPicture && i === 0) {
        imageDiv.innerHTML = row.innerHTML;
      } else {
        contentDiv.innerHTML += row.innerHTML;
      }
    });

    block.innerHTML = '';
    contentDiv.querySelectorAll('a').forEach((a) => {
      a.classList.add('button', 'primary');
    });
    wrapper.appendChild(imageDiv);
    wrapper.appendChild(contentDiv);
    block.appendChild(wrapper);
  }
}
