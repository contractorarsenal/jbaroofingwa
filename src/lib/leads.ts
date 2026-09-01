/**
 * Client-side lead submission helper.
 *
 * All lead-capture UI (the multi-step Roof Assessment, the contact page form,
 * any future embedded form) should call `submitLead()` rather than issuing
 * its own fetch. The actual delivery — CRM webhook, email, GoHighLevel, a
 * Cloudflare D1 log — lives server-side in functions/api/lead.ts, so this
 * client stays stable even if the backend integration changes.
 */

export interface LeadPayload {
  formName: string;
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
  /** Base64 data URL of a single attached photo (see MAX_PHOTO_BYTES in the assessment page). */
  photo?: string;
  photoName?: string;
  path: string;
  referrer?: string;
}

export interface LeadResult {
  ok: boolean;
  error?: string;
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { ok: false, error: `Request failed (${res.status})` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
