/*
 * POST /api/lead — forwards site form submissions into Zoho CRM as
 * Leads. Runs as a Vercel serverless function so the Zoho OAuth
 * credentials never reach the browser.
 *
 * Required environment variables (Vercel dashboard → Settings →
 * Environment Variables; see docs/ZOHO.md for the full setup):
 *   ZOHO_CLIENT_ID      — Self Client id from the Zoho API console
 *   ZOHO_CLIENT_SECRET  — Self Client secret
 *   ZOHO_REFRESH_TOKEN  — offline refresh token (scope: Leads CREATE)
 * Optional:
 *   ZOHO_ACCOUNTS_URL   — accounts host for the org's data center
 *                         (default https://accounts.zoho.sa; use
 *                         https://accounts.zoho.com etc. for other DCs)
 *   ZOHO_API_DOMAIN     — CRM API origin override; normally taken from
 *                         the token response's api_domain
 *
 * Until the env vars are set the endpoint answers 503 and the site
 * forms show their error state instead of pretending success.
 */

declare const process: { env: Record<string, string | undefined> }

type LeadBody = {
  form?: string
  name?: string
  phone?: string
  email?: string
  message?: string
  org?: string
  service?: string
  plan?: string
  planType?: string
  link?: string
  notes?: string
  website?: string /* honeypot — humans never fill it */
}

const FORMS = new Set(['contact', 'service-request', 'marketers-apply'])
const MAX_LEN = 3000

let cachedToken: { value: string; apiDomain: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<{ token: string; apiDomain: string }> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return { token: cachedToken.value, apiDomain: cachedToken.apiDomain }
  }
  const accounts = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.sa'
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN as string,
    client_id: process.env.ZOHO_CLIENT_ID as string,
    client_secret: process.env.ZOHO_CLIENT_SECRET as string,
    grant_type: 'refresh_token',
  })
  const resp = await fetch(`${accounts}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(8000),
  })
  const data = (await resp.json()) as {
    access_token?: string
    expires_in?: number
    api_domain?: string
    error?: string
  }
  if (!resp.ok || !data.access_token) {
    throw new Error(`zoho token refresh failed: ${resp.status} ${data.error ?? ''}`)
  }
  const apiDomain = process.env.ZOHO_API_DOMAIN || data.api_domain || 'https://www.zohoapis.sa'
  cachedToken = {
    value: data.access_token,
    apiDomain,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  }
  return { token: data.access_token, apiDomain }
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LEN) : ''
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method-not-allowed' })

  let body: LeadBody
  try {
    body = (await request.json()) as LeadBody
  } catch {
    return json(400, { ok: false, error: 'invalid-json' })
  }

  /* bots that fill every field trip the honeypot; answer success so
     they move on, but never forward the record */
  if (clean(body.website)) return json(200, { ok: true })

  const form = clean(body.form)
  const name = clean(body.name)
  const phone = clean(body.phone)
  if (!FORMS.has(form) || !name || !phone) {
    return json(400, { ok: false, error: 'missing-fields' })
  }

  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET || !process.env.ZOHO_REFRESH_TOKEN) {
    return json(503, { ok: false, error: 'zoho-not-configured' })
  }

  const sourceByForm: Record<string, string> = {
    contact: 'SalesUp Website — استشارة مجانية',
    'service-request': 'SalesUp Website — طلب خدمة',
    'marketers-apply': 'SalesUp Website — طلب مسوقين',
  }
  const detailLines = [
    clean(body.message) && `الرسالة: ${clean(body.message)}`,
    clean(body.service) && `الخدمة: ${clean(body.service)}`,
    clean(body.plan) && `الباقة/الخدمة المختارة: ${clean(body.plan)}`,
    clean(body.planType) && `النوع: ${clean(body.planType)}`,
    clean(body.link) && `رابط المنتج: ${clean(body.link)}`,
    clean(body.notes) && `ملاحظات: ${clean(body.notes)}`,
  ].filter(Boolean)

  const record: Record<string, string> = {
    Last_Name: name,
    Company: clean(body.org) || 'غير محدد',
    Phone: phone,
    Lead_Source: sourceByForm[form],
    Description: detailLines.join('\n') || '—',
  }
  const email = clean(body.email)
  if (email) record.Email = email

  try {
    /* attempt 0 may run on a cached token; a 401 clears the cache and
       attempt 1 runs on a freshly-refreshed one */
    for (let attempt = 0; attempt < 2; attempt++) {
      const { token, apiDomain } = await getAccessToken()
      const resp = await fetch(`${apiDomain}/crm/v6/Leads`, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [record] }),
        signal: AbortSignal.timeout(8000),
      })
      const result = (await resp.json().catch(() => null)) as {
        data?: { status?: string; code?: string; message?: string }[]
      } | null
      if (resp.status === 401 && attempt === 0) {
        cachedToken = null
        continue
      }
      const row = result?.data?.[0]
      if (!resp.ok || row?.status !== 'success') {
        console.error('[lead] zoho insert failed:', resp.status, JSON.stringify(result))
        return json(502, { ok: false, error: 'zoho-rejected' })
      }
      return json(200, { ok: true })
    }
    return json(502, { ok: false, error: 'zoho-rejected' })
  } catch (err) {
    console.error('[lead] error:', err)
    return json(500, { ok: false, error: 'lead-failed' })
  }
}
