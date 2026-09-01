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

/**
 * Nav theme tracks the page's hero (dark) vs. the rest of the page (white),
 * not a running tally of whichever section happens to sit under the header —
 * this avoids the nav flickering black/white/black/white as it passes over
 * later dark sections further down the page. The crossfade itself is
 * scroll-linked rather than an instant attribute-toggle snap: a CSS custom
 * property (--nav-progress, 0 = black, 1 = white) is updated every animation
 * frame as the hero's bottom edge passes under the header, over a ~200px
 * band, so the header's colors interpolate smoothly with scroll position in
 * both directions instead of jumping at one intersection point.
 */
function initNavTheme() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const hero = document.querySelector<HTMLElement>('.hero, .page-hero');
  if (!header || !hero) return;

  const TRANSITION_SPAN = 200; // px of scroll the black -> white crossfade plays over
  const headerHeight = header.offsetHeight || 72;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setProgress = (value: number) => {
    header.style.setProperty('--nav-progress', value.toFixed(3));
  };

  // 0 right as the hero's bottom edge reaches the header, 1 once it has
  // scrolled TRANSITION_SPAN further past it (and vice versa scrolling up).
  const computeProgress = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const distancePastCross = headerHeight - heroBottom + TRANSITION_SPAN / 2;
    return Math.max(0, Math.min(1, distancePastCross / TRANSITION_SPAN));
  };

  if (typeof IntersectionObserver === 'undefined') {
    setProgress(computeProgress());
    window.addEventListener('scroll', () => setProgress(reduceMotion ? Math.round(computeProgress()) : computeProgress()), { passive: true });
    return;
  }

  if (reduceMotion) {
    // Instant black/white switch, no crossfade: snap to whichever side of
    // the boundary the hero is currently on.
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setProgress(entry.isIntersecting ? 0 : 1)),
      { rootMargin: `-${headerHeight + 1}px 0px -85% 0px`, threshold: 0 }
    );
    observer.observe(hero);
    return;
  }

  let ticking = false;
  const apply = () => {
    ticking = false;
    setProgress(computeProgress());
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          apply();
        } else {
          window.removeEventListener('scroll', onScroll);
          setProgress(entry.boundingClientRect.bottom < 0 ? 1 : 0);
        }
      });
    },
    { rootMargin: `${TRANSITION_SPAN / 2}px 0px ${TRANSITION_SPAN / 2}px 0px`, threshold: 0 }
  );

  observer.observe(hero);
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
