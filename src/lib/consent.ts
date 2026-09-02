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
