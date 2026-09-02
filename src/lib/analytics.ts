/**
 * Analytics event bus, backed by Google Analytics 4 (gtag.js).
 *
 * GA4 itself is loaded once, globally, in BaseLayout.astro, along with
 * Google Consent Mode defaults. This module only ever calls `window.gtag`
 * defensively (optional chaining, wrapped in try/catch) — if gtag hasn't
 * loaded (analytics not configured, consent denied, ad blocker, dev mode),
 * every function here is a safe no-op. Analytics must never throw, log
 * console noise, or affect site functionality.
 *
 * CRITICAL: never pass personally identifiable information (name, phone,
 * email, address, ZIP, message text, form answers) as an event parameter.
 * Only behavior/conversion metadata belongs here.
 */

export type AnalyticsEvent =
  | 'call_click'
  | 'email_click'
  | 'estimate_cta_click'
  | 'assessment_start'
  | 'assessment_step'
  | 'assessment_submit_success'
  | 'contact_form_start'
  | 'contact_form_submit_success'
  | 'financing_click'
  | 'project_view'
  | 'roofing_video_play'
  | 'before_after_interaction'
  | 'outbound_click'
  | 'service_clicked'
  | 'emergency_clicked'
  | 'project_opened'
  | 'maintenance_plan_clicked'
  | 'location_page_viewed'
  | 'photo_uploaded';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends one event to GA4. Safe to call even if GA never loaded. */
export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  try {
    const enrichedPayload: AnalyticsPayload = {
      page_path: window.location.pathname,
      page_title: document.title,
      ...payload,
    };
    window.gtag?.('event', event, enrichedPayload);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, enrichedPayload);
    }
  } catch {
    // Analytics must never break the site.
  }
}

/** Attaches trackEvent(event, {cta_location, service_intent}) to every element matching data-analytics-event. */
export function bindAnalyticsClicks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-analytics-event]').forEach((el) => {
    el.addEventListener('click', () => {
      const event = el.dataset.analyticsEvent as AnalyticsEvent | undefined;
      if (!event) return;
      const payload: AnalyticsPayload = {};
      if (el.dataset.analyticsLocation) payload.cta_location = el.dataset.analyticsLocation;
      if (el.dataset.analyticsIntent) payload.service_intent = el.dataset.analyticsIntent;
      if (el.dataset.analyticsDestination) payload.destination_type = el.dataset.analyticsDestination;
      trackEvent(event, payload);
    });
  });
}

// ---------------------------------------------------------------------
// Named helpers for the specific conversion events called directly from
// component scripts (forms, video players, the before/after slider).
// Prefer these over raw trackEvent() calls so parameter names stay
// consistent everywhere.
// ---------------------------------------------------------------------

export function trackCallClick(location: string): void {
  trackEvent('call_click', { cta_location: location });
}

export function trackEmailClick(location: string): void {
  trackEvent('email_click', { cta_location: location });
}

export function trackEstimateClick(location: string, intent?: string): void {
  trackEvent('estimate_cta_click', { cta_location: location, service_intent: intent });
}

export function trackFinancingClick(location: string): void {
  trackEvent('financing_click', { cta_location: location });
}

export function trackAssessmentStart(): void {
  trackEvent('assessment_start');
}

export function trackAssessmentStep(stepNumber: number, stepName: string): void {
  trackEvent('assessment_step', { step_number: stepNumber, step_name: stepName });
}

export function trackAssessmentSuccess(intent?: string): void {
  trackEvent('assessment_submit_success', { service_intent: intent });
}

export function trackContactFormStart(): void {
  trackEvent('contact_form_start');
}

export function trackContactFormSuccess(): void {
  trackEvent('contact_form_submit_success');
}

export function trackProjectView(projectSlug: string, projectType?: string): void {
  trackEvent('project_view', { project_slug: projectSlug, project_type: projectType });
}

export function trackVideoPlay(videoTitle: string, videoTopic?: string): void {
  trackEvent('roofing_video_play', { video_title: videoTitle, video_topic: videoTopic });
}

export function trackBeforeAfterInteraction(): void {
  trackEvent('before_after_interaction');
}

export function trackOutboundClick(destinationType: string): void {
  trackEvent('outbound_click', { destination_type: destinationType });
}
