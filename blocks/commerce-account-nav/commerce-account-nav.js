import { provider as UI, Icon } from '@dropins/tools/components.js';
import { events } from '@dropins/tools/event-bus.js';

import '../../scripts/initializers/auth.js';

export default async function decorate(block) {
  /** Get rows data */
  const [keys, ...$items] = [...block.children].map((child, index) => {
    if (index === 0) return [...child.children].map((c) => c.textContent.trim());
    return child;
  });

  /** Create nav */
  const $nav = document.createElement('div');
  $nav.classList.add('commerce-account-nav');

  /** Get rows indexes */
  const rows = {
    label: Math.max(0, keys.indexOf('label') + 1),
    icon: Math.max(0, keys.indexOf('icon') + 1),
    permission: Math.max(0, keys.indexOf('permission') + 1),
  };

  function populateNav(permissions) {
    $nav.innerHTML = '';

    $items.forEach(($item) => {
      const permission = $item.querySelector(`:scope > div:nth-child(${rows.permission})`)?.textContent?.trim() || 'all';

      if (permissions[permission] === false) return;
      if (!permissions.admin && !permissions[permission]) return;

      const template = document.createRange().createContextualFragment(`
        <a class="commerce-account-nav__item">
          <span class="commerce-account-nav__item__icon"></span>
          <span class="commerce-account-nav__item__title"></span>
          <span class="commerce-account-nav__item__description"></span>
          <span class="commerce-account-nav__item__chevron" aria-hidden="true"></span>
        </a>
      `);

      const $link = template.querySelector('.commerce-account-nav__item');
      const $icon = template.querySelector('.commerce-account-nav__item__icon');
      const $title = template.querySelector('.commerce-account-nav__item__title');
      const $description = template.querySelector('.commerce-account-nav__item__description');

      const $content = $item.querySelector(`:scope > div:nth-child(${rows.label})`)?.children;

      const link = $content[0]?.querySelector('a')?.href;
      const isActive = link && new URL(link).pathname === window.location.pathname;
      $link.classList.toggle('commerce-account-nav__item--active', isActive);
      $link.href = link;

      const icon = $item.querySelector(`:scope > div:nth-child(${rows.icon})`)?.textContent?.trim();
      if (icon) {
        $link.classList.add('commerce-account-nav__item--has-icon');
        UI.render(Icon, { source: icon, size: 24 })($icon);
      }

      $title.textContent = $content[0]?.textContent || '';
      $description.textContent = $content[1]?.textContent || '';

      $nav.appendChild($link);
    });
  }

  events.on('auth/permissions', (permissions) => {
    populateNav(permissions);
  }, { eager: true });

  block.replaceWith($nav);

  // Fallback: if nav is still empty 100ms after decoration, fetch permissions directly.
  // Handles race conditions where auth/permissions fires before this block is decorated.
  setTimeout(async () => {
    if ($nav.children.length > 0) return;

    try {
      const isAuthenticated = events.lastPayload('authenticated');
      if (!isAuthenticated) return;

      const { getCustomerRolePermissions } = await import('@dropins/storefront-auth/api.js');
      const permissions = await getCustomerRolePermissions();
      if ($nav.children.length === 0 && permissions) {
        populateNav(permissions);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('commerce-account-nav: fallback permissions fetch failed', e);
    }
  }, 100);
}
