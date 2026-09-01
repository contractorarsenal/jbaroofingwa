/**
 * Lightweight, dependency-free motion system: scroll reveals, sticky-nav
 * theme switching, active-nav-section indication, and sticky mobile CTA
 * entrance. Everything here is IntersectionObserver + CSS transitions —
 * no scroll-jacking, no animation library, no per-frame scroll listeners.
 */

function initScrollReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

function initNavTheme() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme]');
  if (!header || !sections.length || !('IntersectionObserver' in window)) return;

  const headerHeight = header.offsetHeight || 72;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-nav-theme');
          if (theme) header.setAttribute('data-theme', theme);
        }
      });
    },
    { rootMargin: `-${headerHeight + 1}px 0px -85% 0px`, threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initActiveNav() {
  const sections = document.querySelectorAll<HTMLElement>('[data-nav-section]');
  const links = document.querySelectorAll<HTMLElement>('[data-nav-key]');
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const key = entry.target.getAttribute('data-nav-section');
        if (!key) return;
        links.forEach((link) => {
          if (link.getAttribute('data-nav-key') === key) {
            link.classList.toggle('is-active', entry.isIntersecting);
          }
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initStickyCtaHeroWatch() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const stickyCta = document.querySelector<HTMLElement>('[data-sticky-cta]');
  if (!hero || !stickyCta || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        stickyCta.classList.toggle('sticky-cta--hero-visible', entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );
  observer.observe(hero);
}

export function initMotion() {
  initScrollReveal();
  initNavTheme();
  initActiveNav();
  initStickyCtaHeroWatch();
}
