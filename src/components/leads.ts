/*
 * Client side of the Zoho lead pipeline: posts form submissions to
 * /api/lead (a Vercel serverless function — see api/lead.ts). Returns
 * true only when the function confirms the CRM accepted the lead, so
 * forms never show a fake success state.
 */

export type LeadForm = 'contact' | 'service-request' | 'marketers-apply'

/* `type="email"` alone accepts "a@b" — Zoho requires a real domain and
   rejects the whole record without one, so the field carries this
   pattern and the visitor is told before they submit */
export const EMAIL_PATTERN = '[^@\\s]+@[^@\\s.]+(\\.[^@\\s.]+)+'

export type LeadPayload = {
  form: LeadForm
  name: string
  phone: string
  email?: string
  message?: string
  org?: string
  service?: string
  serviceLabel?: string
  plan?: string
  planLabel?: string
  planType?: string
  link?: string
  notes?: string
  website?: string /* honeypot */
}

/*
 * AbortSignal.timeout only landed in Safari 16 — calling it on an older
 * iPhone throws before fetch is even reached, which would fail every
 * submission on those devices. Fall back to a controller, and to no
 * timeout at all rather than no request.
 */
function abortAfter(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms)
    }
    const controller = new AbortController()
    setTimeout(() => controller.abort(), ms)
    return controller.signal
  } catch {
    return undefined
  }
}

/* generous enough that the function (12s budget) always answers first —
   aborting early would report a failure for a lead that was created */
const CLIENT_TIMEOUT_MS = 25000

/* On Vercel the function is same-origin; served as the WordPress theme
   the frontend lives on salesup.sa, so the WP build points this at the
   Vercel deployment (see .env.wp) and the function answers with CORS. */
const LEAD_ENDPOINT: string = import.meta.env.VITE_LEAD_API || '/api/lead'

export async function submitLead(payload: LeadPayload): Promise<boolean> {
  try {
    const resp = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: abortAfter(CLIENT_TIMEOUT_MS),
    })
    if (!resp.ok) return false
    const data = (await resp.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}

/* reads a form's fields into a payload; missing fields become '' */
export function leadFromForm(form: HTMLFormElement, base: { form: LeadForm }): LeadPayload {
  const data = new FormData(form)
  const field = (name: string) => {
    const value = data.get(name)
    return typeof value === 'string' ? value.trim() : ''
  }
  /* the custom Select carries a slug in its hidden input (that's what
     routing keys off); its human-readable label lives in the trigger,
     and CRM records are far easier to read with the label alongside */
  const label = (name: string) => {
    const input = form.querySelector(`input[name="${name}"]`)
    const text = input?.closest('.su-select')?.querySelector('.su-select-label')?.textContent
    return typeof text === 'string' ? text.trim() : ''
  }
  return {
    ...base,
    name: field('name'),
    phone: field('phone'),
    email: field('email'),
    message: field('message'),
    org: field('org'),
    service: field('service'),
    serviceLabel: label('service'),
    plan: field('plan'),
    planLabel: label('plan'),
    link: field('link'),
    notes: field('notes'),
    website: field('website'),
  }
}
