/**
 * Cloudflare Pages Function — POST /api/lead
 *
 * Receives lead submissions from the Roof Assessment funnel and the contact
 * form. Delivery is adapter-based so a real CRM/webhook can be wired in
 * later without touching the frontend:
 *
 *   - LEAD_WEBHOOK_URL   → posts the lead JSON to a CRM/GoHighLevel webhook.
 *   - LEAD_NOTIFY_EMAIL  → (requires an email adapter, e.g. Resend/Postmark;
 *                           set RESEND_API_KEY to enable) sends a notification.
 *
 * Until real credentials exist, submissions still succeed and are logged so
 * nothing is silently dropped — configure the env vars below in the
 * Cloudflare Pages dashboard when the client's CRM is ready.
 *
 * Required Cloudflare Pages environment variables (documented in
 * CLIENT-CONTENT-NEEDED.md and ARCHITECTURE.md):
 *   LEAD_WEBHOOK_URL   (optional) — CRM/webhook endpoint to forward leads to
 *   RESEND_API_KEY     (optional) — enables email notification fallback
 *   LEAD_NOTIFY_EMAIL  (optional) — destination address for email fallback
 */

interface Env {
  LEAD_WEBHOOK_URL?: string;
  RESEND_API_KEY?: string;
  LEAD_NOTIFY_EMAIL?: string;
}

interface LeadPayload {
  formName?: string;
  zip?: string;
  need?: string;
  symptoms?: string[];
  timeline?: string;
  isInsuranceClaim?: boolean;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  preferredContact?: string;
  notes?: string;
  photoCount?: number;
  /** Base64 data URL (e.g. "data:image/jpeg;base64,...") — see MAX_PHOTO_DATA_URL_LENGTH below. */
  photo?: string;
  photoName?: string;
  path?: string;
  referrer?: string;
  // honeypot field — real users never fill this in
  company_website?: string;
}

// The client caps the original file at 6MB before base64-encoding it (see
// src/pages/assessment/index.astro), which inflates to ~8MB of base64 text.
// This is a server-side backstop against a client that skips that check —
// not a real limit we expect legitimate submissions to hit.
const MAX_PHOTO_DATA_URL_LENGTH = 10 * 1024 * 1024;

function isValidPayload(body: unknown): body is LeadPayload {
  return typeof body === 'object' && body !== null;
}

/**
 * Every delivery channel reports back whether it was actually configured
 * ("attempted") and, if so, whether it actually succeeded ("ok") — a channel
 * that isn't configured must never be counted as a successful delivery just
 * because its promise resolved without throwing. This is what lets the
 * handler below tell "nothing configured yet" apart from "configured but
 * failed" apart from "actually delivered," instead of reporting success
 * across the board regardless of what really happened.
 */
interface DeliveryResult {
  channel: string;
  attempted: boolean;
  ok: boolean;
  error?: string;
}

/** Most CRM/GoHighLevel webhooks expect structured text fields, not a multi-MB
 *  base64 blob — the photo (if any) goes to email as a real attachment
 *  instead; the webhook still gets photoName/photoCount so it knows one exists. */
function withoutPhoto(lead: LeadPayload): Omit<LeadPayload, 'photo'> {
  const { photo, ...rest } = lead;
  return rest;
}

async function forwardToWebhook(url: string, lead: LeadPayload): Promise<DeliveryResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'jbaroofpro.com', receivedAt: new Date().toISOString(), ...withoutPhoto(lead) }),
    });
    return { channel: 'webhook', attempted: true, ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (err) {
    return { channel: 'webhook', attempted: true, ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

async function forwardToEmail(env: Env, lead: LeadPayload): Promise<DeliveryResult> {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_EMAIL) {
    return { channel: 'email', attempted: false, ok: false };
  }

  const attachments = [];
  if (lead.photo?.startsWith('data:')) {
    const base64 = lead.photo.split(',')[1];
    if (base64) {
      attachments.push({ filename: lead.photoName || 'photo.jpg', content: base64 });
    }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'JBA Website <leads@jbaroofpro.com>',
        to: env.LEAD_NOTIFY_EMAIL,
        subject: `New lead: ${lead.name ?? 'Unknown'} — ${lead.need ?? lead.formName ?? 'general inquiry'}`,
        text: JSON.stringify(withoutPhoto(lead), null, 2),
        ...(attachments.length > 0 ? { attachments } : {}),
      }),
    });
    return { channel: 'email', attempted: true, ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (err) {
    return { channel: 'email', attempted: true, ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400 });
  }

  if (!isValidPayload(body)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), { status: 400 });
  }

  // Honeypot: bots fill every field, including ones hidden from real users.
  if (body.company_website) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const lead: LeadPayload = { ...body };
  delete lead.company_website;

  // Server-side backstop: the client caps and encodes the photo before
  // sending, but never trust that alone — reject rather than pass an
  // oversized or malformed value on to the email/webhook adapters.
  if (typeof lead.photo === 'string') {
    const looksLikeDataUrl = lead.photo.startsWith('data:image/');
    if (!looksLikeDataUrl || lead.photo.length > MAX_PHOTO_DATA_URL_LENGTH) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid or oversized photo' }), { status: 400 });
    }
  }

  const deliveries: Promise<DeliveryResult>[] = [];

  if (env.LEAD_WEBHOOK_URL) {
    deliveries.push(forwardToWebhook(env.LEAD_WEBHOOK_URL, lead));
  }
  deliveries.push(forwardToEmail(env, lead));

  // These never reject — every branch above returns a DeliveryResult — so
  // Promise.all is safe and gives us a plain array to reason about below.
  const results = await Promise.all(deliveries);
  const configured = results.filter((r) => r.attempted);
  const delivered = configured.some((r) => r.ok);

  // Always log server-side so a submission is never silently lost, even
  // before any CRM/email destination exists — this is the durable record
  // during the staging period. See CLIENT-CONTENT-NEEDED.md for activating
  // real delivery.
  // eslint-disable-next-line no-console
  console.log('[lead] received', JSON.stringify({ lead: withoutPhoto(lead), deliveryResults: results }));

  if (configured.length === 0) {
    // No LEAD_WEBHOOK_URL and no RESEND_API_KEY/LEAD_NOTIFY_EMAIL set yet.
    // eslint-disable-next-line no-console
    console.warn('[lead] no delivery channel configured — submission was only logged');
  } else if (!delivered) {
    // At least one channel was configured but every attempt failed.
    // eslint-disable-next-line no-console
    console.error('[lead] all configured delivery channels failed', configured);
  }

  // The visitor-facing response only ever confirms the submission was
  // received (true — it's logged server-side regardless), never that a
  // specific CRM/email actually got it. `delivered` and `configured` are
  // plain booleans with no error detail, safe to expose, and let internal
  // tooling or a future admin view distinguish "nothing configured yet"
  // from "configured but failing" without the client ever seeing a stack
  // trace or secret.
  return new Response(JSON.stringify({ ok: true, configured: configured.length > 0, delivered }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), { status: 405 });
};
