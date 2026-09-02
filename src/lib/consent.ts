/**
 * Shared cookie-consent preference storage, read by the inline Google
 * Consent Mode bootstrap in BaseLayout.astro (as plain duplicated JS, since
 * that script runs before any module import is available) and written by
 * CookieNotice.astro when the visitor makes a choice.
 */

export const CONSENT_STORAGE_KEY = 'jba_cookie_consent';

export type ConsentValue = 'analytics' | 'necessary';

export function getStoredConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'analytics' || value === 'necessary' ? value : null;
  } catch {
    return null;
  }
}

export function setStoredConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // best-effort only — the banner will just reappear next visit
  }
}

/** Updates Google Consent Mode. Safe no-op if gtag never loaded. */
export function updateAnalyticsConsent(granted: boolean): void {
  try {
    window.gtag?.('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  } catch {
    // Analytics must never break the site.
  }
}

declare global {
  interface Window {
    clarity?: { (...args: unknown[]): void; q?: unknown[] };
  }
}

function isLocalhost(): boolean {
  return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
}

/**
 * Loads Microsoft Clarity once, only when analytics consent has actually
 * been granted. Safe to call multiple times — no-ops if already loaded,
 * on localhost, or without a project ID. Never throws.
 */
export function loadClarity(clarityId: string | undefined): void {
  if (!clarityId || isLocalhost() || window.clarity) return;

  try {
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function (...args: unknown[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);
  } catch {
    // Analytics must never break the site.
  }
}

/**
 * A small set of Clarity-native custom events (recordings/heatmaps context,
 * not a second analytics system) — safe no-op if Clarity never loaded or
 * consent wasn't granted. Never pass PII as the event name or elsewhere.
 */
export function trackClarityEvent(name: string): void {
  try {
    window.clarity?.('event', name);
  } catch {
    // Analytics must never break the site.
  }
}
