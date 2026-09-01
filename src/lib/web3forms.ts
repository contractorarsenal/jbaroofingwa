/**
 * Client-side submission helper for Web3Forms (https://web3forms.com).
 *
 * Web3Forms is the active submission system for the Contact page and the
 * Roof Assessment form. The access key below is a public, client-side key
 * by design (this is how Web3Forms' own integration works), not a secret.
 *
 * The previous Cloudflare Pages Function (functions/api/lead.ts) and its
 * client helper (src/lib/leads.ts) are left in place but are no longer
 * called by these forms — kept as documented legacy infrastructure rather
 * than removed, so nothing else that might depend on them regresses.
 */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = '1ca2a091-176a-4429-a2c2-7510f8daa07e';

export interface Web3FormsResult {
  ok: boolean;
  error?: string;
}

export async function submitToWeb3Forms(formData: FormData): Promise<Web3FormsResult> {
  formData.set('access_key', WEB3FORMS_ACCESS_KEY);

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;

    if (res.ok && data?.success) {
      return { ok: true };
    }
    return { ok: false, error: data?.message || `Request failed (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
