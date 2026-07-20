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
  plan?: string
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
  return {
    ...base,
    name: field('name'),
    phone: field('phone'),
    email: field('email'),
    message: field('message'),
    org: field('org'),
    service: field('service'),
    plan: field('plan'),
    link: field('link'),
    notes: field('notes'),
    website: field('website'),
  }
}
