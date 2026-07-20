/*
 * Client side of the Zoho lead pipeline: posts form submissions to
 * /api/lead (a Vercel serverless function — see api/lead.ts). Returns
 * true only when the function confirms the CRM accepted the lead, so
 * forms never show a fake success state.
 */

export type LeadForm = 'contact' | 'service-request' | 'marketers-apply'

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

export async function submitLead(payload: LeadPayload): Promise<boolean> {
  try {
    const resp = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
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
