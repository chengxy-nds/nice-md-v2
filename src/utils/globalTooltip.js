/**
 * Global Tooltip System
 * Automatically intercepts title & data-tooltip attributes across the whole application
 * and renders a sleek, modern dark tooltip with arrow pointers matching desktop pro UI standards.
 */

let tooltipEl = null;
let arrowEl = null;
let textEl = null;
let currentTarget = null;
let showTimer = null;
let hideTimer = null;

function ensureTooltipElements() {
  if (tooltipEl) return;

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'nice-global-tooltip';
  tooltipEl.setAttribute('aria-hidden', 'true');

  textEl = document.createElement('span');
  textEl.className = 'nice-tooltip-content';

  arrowEl = document.createElement('div');
  arrowEl.className = 'nice-tooltip-arrow';

  tooltipEl.appendChild(textEl);
  tooltipEl.appendChild(arrowEl);
  document.body.appendChild(tooltipEl);
}

function getTooltipTarget(node) {
  let el = node;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.nodeType !== 1) {
      el = el.parentElement;
      continue;
    }
    // Skip if explicitly marked no-tooltip or inside hover trigger menus
    if (el.hasAttribute('data-no-tooltip') || el.closest('[data-no-tooltip]')) {
      return null;
    }
    // Check title or data-nice-title or data-tooltip
    if (el.hasAttribute('title') || el.hasAttribute('data-nice-title') || el.hasAttribute('data-tooltip')) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function getTooltipText(el) {
  if (!el) return '';
  if (el.hasAttribute('title')) {
    const text = el.getAttribute('title');
    if (text) {
      el.setAttribute('data-nice-title', text);
      el.removeAttribute('title');
      return text;
    }
  }
  return el.getAttribute('data-nice-title') || el.getAttribute('data-tooltip') || '';
}

function calculatePosition(targetEl) {
  const rect = targetEl.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const gap = 8; // distance from target element
  const padding = 8; // screen edge padding

  // Detect ideal placement
  let placement = targetEl.getAttribute('data-placement');
  if (!placement) {
    // If element is on the right side of the screen (e.g. right sidebar or right icons)
    if (rect.right > window.innerWidth - 160) {
      placement = 'left';
    } else if (rect.left < 160) {
      placement = 'right';
    } else if (rect.top < 90) {
      placement = 'bottom';
    } else if (rect.bottom > window.innerHeight - 80) {
      placement = 'top';
    } else {
      placement = 'bottom';
    }
  }

  let top = 0;
  let left = 0;

  if (placement === 'left') {
    // Tooltip placed to the LEFT of the element, arrow points RIGHT (matching user's design)
    left = rect.left - tooltipRect.width - gap;
    top = rect.top + (rect.height - tooltipRect.height) / 2;
  } else if (placement === 'right') {
    // Tooltip placed to the RIGHT of the element, arrow points LEFT
    left = rect.right + gap;
    top = rect.top + (rect.height - tooltipRect.height) / 2;
  } else if (placement === 'top') {
    // Tooltip placed ABOVE the element, arrow points DOWN
    left = rect.left + (rect.width - tooltipRect.width) / 2;
    top = rect.top - tooltipRect.height - gap;
  } else {
    // Default 'bottom': Tooltip placed BELOW the element, arrow points UP
    left = rect.left + (rect.width - tooltipRect.width) / 2;
    top = rect.bottom + gap;
  }

  // Constrain within viewport
  if (left < padding) left = padding;
  if (left + tooltipRect.width > window.innerWidth - padding) {
    left = window.innerWidth - tooltipRect.width - padding;
  }
  if (top < padding) top = padding;
  if (top + tooltipRect.height > window.innerHeight - padding) {
    top = window.innerHeight - tooltipRect.height - padding;
  }

  return { top, left, placement };
}

function showTooltip(el) {
  const text = getTooltipText(el);
  if (!text || !text.trim()) return;

  ensureTooltipElements();
  textEl.textContent = text.trim();

  tooltipEl.style.display = 'block';
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'scale(0.96)';

  // Calculate position after content is updated
  const pos = calculatePosition(el);
  tooltipEl.setAttribute('data-placement', pos.placement);
  tooltipEl.style.top = `${Math.round(pos.top)}px`;
  tooltipEl.style.left = `${Math.round(pos.left)}px`;

  // Trigger smooth reveal animation
  requestAnimationFrame(() => {
    tooltipEl.classList.add('is-visible');
    tooltipEl.style.opacity = '1';
    tooltipEl.style.transform = 'scale(1)';
  });
}

function hideTooltip() {
  clearTimeout(showTimer);
  if (!tooltipEl) return;
  tooltipEl.classList.remove('is-visible');
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'scale(0.96)';
  hideTimer = setTimeout(() => {
    if (tooltipEl && !tooltipEl.classList.contains('is-visible')) {
      tooltipEl.style.display = 'none';
    }
  }, 150);
  currentTarget = null;
}

export function initGlobalTooltip() {
  if (typeof window === 'undefined') return;

  document.addEventListener('mouseover', (e) => {
    const target = getTooltipTarget(e.target);
    if (!target) {
      if (currentTarget) hideTooltip();
      return;
    }

    if (target === currentTarget) return;

    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    currentTarget = target;

    // Fast response delay (100ms)
    showTimer = setTimeout(() => {
      if (currentTarget === target) {
        showTooltip(target);
      }
    }, 100);
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = getTooltipTarget(e.target);
    if (target && target === currentTarget) {
      hideTooltip();
    }
  }, { passive: true });

  document.addEventListener('click', () => {
    hideTooltip();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (currentTarget) hideTooltip();
  }, { passive: true });
}
