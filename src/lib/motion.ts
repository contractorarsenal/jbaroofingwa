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

/**
 * Very subtle photo parallax (max ~25px displacement) for at most a couple
 * of hero-style images. A scroll listener only runs while at least one
 * [data-parallax] element is actually on screen (toggled via
 * IntersectionObserver), and rAF-throttles the work — no scroll-jacking,
 * no permanent global listener. Fully inert under reduced motion.
 */
function initParallax() {
  const els = document.querySelectorAll<HTMLElement>('[data-parallax]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const active = new Set<HTMLElement>();
  let ticking = false;

  const apply = () => {
    ticking = false;
    active.forEach((el) => {
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const viewportMid = window.innerHeight / 2;
      const elMid = rect.top + rect.height / 2;
      const offset = Math.max(-25, Math.min(25, (viewportMid - elMid) * 0.06));
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) active.add(entry.target as HTMLElement);
      else active.delete(entry.target as HTMLElement);
    });
    if (active.size > 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
      apply();
    } else {
      window.removeEventListener('scroll', onScroll);
    }
  });

  els.forEach((el) => observer.observe(el));
}

export function initMotion() {
  initScrollReveal();
  initNavTheme();
  initActiveNav();
  initStickyCtaHeroWatch();
  initParallax();
}
