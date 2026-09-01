/**
 * Vendor-agnostic analytics event bus.
 *
 * Every conversion-relevant interaction on the site should call `trackEvent`
 * instead of talking to a vendor SDK directly. This keeps components free of
 * "gtag" / "fbq" / etc. calls so the analytics vendor can be swapped (or
 * multiple vendors added) in one place without touching UI code.
 *
 * Wire up a real vendor by pushing to window.dataLayer (GTM), calling
 * window.gtag (GA4), or posting to a custom endpoint — see the TODO below.
 */

export type AnalyticsEvent =
  | 'phone_click'
  | 'quote_started'
  | 'quote_step_completed'
  | 'quote_submitted'
  | 'service_clicked'
  | 'project_opened'
  | 'maintenance_plan_clicked'
  | 'financing_clicked'
  | 'emergency_clicked'
  | 'photo_uploaded'
  | 'location_page_viewed';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  // TODO(client): once an analytics ID is confirmed (GA4 / GTM / Meta Pixel),
  // push events into window.dataLayer here. Left as a no-op-safe dataLayer
  // push so GTM containers configured later pick these events up for free.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, payload);
  }
}

/** Attaches trackEvent(event, payload) to every element matching selector via data-analytics-event. */
export function bindAnalyticsClicks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-analytics-event]').forEach((el) => {
    el.addEventListener('click', () => {
      const event = el.dataset.analyticsEvent as AnalyticsEvent | undefined;
      if (!event) return;
      const payload: AnalyticsPayload = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith('analytics') && key !== 'analyticsEvent') {
          payload[key.replace('analytics', '').toLowerCase()] = value;
        }
      }
      trackEvent(event, payload);
    });
  });
}
