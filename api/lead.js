/*
 * POST /api/lead — forwards site form submissions into Bigin by Zoho
 * as Contacts. Runs as a Vercel serverless function so the Zoho OAuth
 * credentials never reach the browser.
 *
 * Required environment variables (Vercel dashboard → Settings →
 * Environment Variables; see docs/ZOHO.md for the full setup):
 *   ZOHO_CLIENT_ID      — Self Client id from the Zoho API console
 *   ZOHO_CLIENT_SECRET  — Self Client secret
 *   ZOHO_REFRESH_TOKEN  — offline refresh token
 *                         (scope: ZohoBigin.modules.contacts.CREATE)
 * Optional:
 *   ZOHO_ACCOUNTS_URL   — accounts host for the org's data center
 *                         (default https://accounts.zoho.sa; use
 *                         https://accounts.zoho.com etc. for other DCs)
 *   ZOHO_API_DOMAIN     — API origin override; normally taken from the
 *                         token response's api_domain
 *
 * Until the env vars are set the endpoint answers 503 and the site
 * forms show their error state instead of pretending success.
 */

const FORMS = new Set(['contact', 'service-request', 'marketers-apply'])
const MAX_LEN = 3000

let cachedToken = null

async function getAccessToken() {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return { token: cachedToken.value, apiDomain: cachedToken.apiDomain }
  }
  const accounts = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.sa'
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  })
  const resp = await fetch(`${accounts}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(8000),
  })
  const data = await resp.json()
  if (!resp.ok || !data.access_token) {
    throw new Error(`zoho token refresh failed: ${resp.status} ${data.error || ''}`)
  }
  const apiDomain = process.env.ZOHO_API_DOMAIN || data.api_domain || 'https://www.zohoapis.sa'
  cachedToken = {
    value: data.access_token,
    apiDomain,
    expiresAt: now + (data.expires_in || 3600) * 1000,
  }
  return { token: data.access_token, apiDomain }
}

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LEN) : ''
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/* per-method export — Vercel's Node runtime only routes the web
   Request/Response signature through named method exports */
export async function POST(request) {
  let body
  try {
    body = await request.json()
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

  const sourceByForm = {
    contact: 'موقع SalesUp — استشارة مجانية',
    'service-request': 'موقع SalesUp — طلب خدمة',
    'marketers-apply': 'موقع SalesUp — طلب مسوقين',
  }
  /* Bigin contacts have no plain-text Company field (it's a lookup),
     so the organization lands in Description with the rest */
  /* selects carry a slug for routing plus a readable label — prefer the
     label so the CRM record says "المبيعات الداخلية", not "inside-sales" */
  const service = clean(body.serviceLabel) || clean(body.service)
  const plan = clean(body.planLabel) || clean(body.plan)
  const detailLines = [
    clean(body.org) && `الجهة: ${clean(body.org)}`,
    clean(body.message) && `الرسالة: ${clean(body.message)}`,
    service && `الخدمة: ${service}`,
    plan && `الباقة/الخدمة المختارة: ${plan}`,
    clean(body.planType) && `النوع: ${clean(body.planType)}`,
    clean(body.link) && `رابط المنتج: ${clean(body.link)}`,
    clean(body.notes) && `ملاحظات: ${clean(body.notes)}`,
  ].filter(Boolean)

  const record = {
    Last_Name: name,
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
      const resp = await fetch(`${apiDomain}/bigin/v2/Contacts`, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [record] }),
        signal: AbortSignal.timeout(8000),
      })
      const result = await resp.json().catch(() => null)
      if (resp.status === 401 && attempt === 0) {
        cachedToken = null
        continue
      }
      const row = result && result.data && result.data[0]
      if (!resp.ok || !row || row.status !== 'success') {
        console.error('[lead] bigin insert failed:', resp.status, JSON.stringify(result))
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
