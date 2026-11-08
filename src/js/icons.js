/* Chrono Critters — inline SVG icons (no emoji dependency).
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const ICONS = {
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/>',
  book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z" fill="currentColor"/>',
  star: '<path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1L3.2 9.3l6.1-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9" fill="currentColor"/><rect x="11" y="10.5" width="2" height="6.5" rx="1" fill="#fff"/><circle cx="12" cy="7.6" r="1.3" fill="#fff"/>',
  home: '<path d="M3.5 11.2L12 4l8.5 7.2V19a1 1 0 0 1-1 1H15v-5h-6v5H4.5a1 1 0 0 1-1-1z" fill="currentColor"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/>',
  redo: '<path d="M18.5 12a6.5 6.5 0 1 1-2-4.7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M19.5 4v5h-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  arrowl: '<path d="M19 12H6M11 6l-6 6 6 6" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  sun: '<circle cx="12" cy="12" r="4.6" fill="#ffc53d"/><g stroke="#ffb020" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="#ffe9a8" stroke="#e0c060" stroke-width="1"/>',
  sunrise: '<path d="M3 17h18" stroke="#ff9d57" stroke-width="2" stroke-linecap="round"/><path d="M7 17a5 5 0 0 1 10 0z" fill="#ffc53d"/><g stroke="#ffb020" stroke-width="2" stroke-linecap="round"><path d="M12 6v2.5M5.5 9.5l1.6 1.6M18.5 9.5l-1.6 1.6"/></g>',
  sunset: '<path d="M3 17h18" stroke="#c76b9a" stroke-width="2" stroke-linecap="round"/><path d="M7 17a5 5 0 0 1 10 0z" fill="#ff8f6b"/><path d="M12 5v4M10 7.5l2 2 2-2" stroke="#ff8f6b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
};

function icon(name, size) {
  return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}

function applyIcons(root) {
  (root || document).querySelectorAll('[data-ico]').forEach(el => {
    if (!el.dataset.done) { el.innerHTML = icon(el.dataset.ico); el.dataset.done = '1'; }
  });
}
