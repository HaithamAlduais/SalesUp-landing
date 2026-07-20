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

/*
 * Service → Bigin pipeline routing.
 *
 * Keys are the site's own slugs (`service` from the services form,
 * `plan` from the marketers form, or `form:<name>` as the fallback for
 * a submission that carries no selection). Each value places the deal:
 *   teamPipeline / teamPipelineId — the Team Pipeline (Bigin's top
 *     level; plan-limited, so several services may share one)
 *   subPipeline — mandatory; must match that pipeline's configured name
 *   stage       — mandatory; must be a stage valid in THAT sub-pipeline
 *
 * Fill from the real org structure via GET /api/pipelines?key=… — names
 * must match Bigin exactly or the insert is rejected. While a key is
 * missing the contact is still created (with tags) and only the deal is
 * skipped, so routing can be rolled out without risking lost leads.
 */
const PIPELINE_ROUTES = {}

/* Tags: source + form type + the chosen service/package. Three per
   record, within Bigin's limit of 5. The third one matters because all
   three forms share one website pipeline — without it there is no way
   to filter that pipeline down to, say, SEO requests. Keep the
   vocabulary closed (it grows only when the site's own service list
   grows) since Bigin also caps distinct tags per module. */
const TAG_SOURCE = 'موقع الويب'
const tagByForm = {
  contact: 'استشارة',
  'service-request': 'طلب خدمة',
  'marketers-apply': 'مسوقين',
}
const TAG_MAX_LEN = 25

/* Zoho enforces its own field lengths and rejects the whole record when
   one is exceeded, so trim before sending rather than lose the lead */
const LIMITS = { name: 80, phone: 30, email: 100 }

/* stricter than the browser's type="email", which accepts "a@b" —
   Zoho requires a real domain and refuses the record otherwise */
const EMAIL_RE = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/

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
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

/* one Bigin write, with a single retry after a 401 refreshes the token.
   Returns the created record's id, or null when Bigin rejected it. */
async function biginInsert(module, record, getToken, onExpired) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { token, apiDomain } = await getToken()
    const resp = await fetch(`${apiDomain}/bigin/v2/${module}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        /* explicit charset: Arabic must never be re-encoded in transit */
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ data: [record] }),
      signal: AbortSignal.timeout(8000),
    })
    const result = await resp.json().catch(() => null)
    if (resp.status === 401 && attempt === 0) {
      onExpired()
      continue
    }
    const row = result && result.data && result.data[0]
    if (!resp.ok || !row || row.status !== 'success') {
      console.error(`[lead] ${module} insert failed:`, resp.status, JSON.stringify(result))
      return null
    }
    return (row.details && row.details.id) || null
  }
  return null
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
  /* Zoho rejects a record outright if Email isn't a real address, and
     the browser's own type="email" check passes things it won't accept
     (no dot in the domain). Email is optional on every form here, so a
     typo in it must never cost the lead: keep the address only when it
     is genuinely valid, and carry a bad one through in the description
     so the team can still see what the visitor meant to type. */
  const rawEmail = clean(body.email)
  const email = EMAIL_RE.test(rawEmail) ? rawEmail.slice(0, LIMITS.email) : ''
  const badEmail = rawEmail && !email ? rawEmail : ''

  const detailLines = [
    clean(body.org) && `الجهة: ${clean(body.org)}`,
    clean(body.message) && `الرسالة: ${clean(body.message)}`,
    service && `الخدمة: ${service}`,
    plan && `الباقة/الخدمة المختارة: ${plan}`,
    clean(body.planType) && `النوع: ${clean(body.planType)}`,
    clean(body.link) && `رابط المنتج: ${clean(body.link)}`,
    clean(body.notes) && `ملاحظات: ${clean(body.notes)}`,
    badEmail && `الايميل كما كتبه العميل (غير مكتمل): ${badEmail}`,
  ].filter(Boolean)

  const contact = {
    /* Zoho caps Last_Name; an over-long name would fail the insert */
    Last_Name: name.slice(0, LIMITS.name),
    Phone: phone.slice(0, LIMITS.phone),
    Lead_Source: sourceByForm[form],
    Description: detailLines.join('\n') || '—',
    Tag: [{ name: TAG_SOURCE }, { name: tagByForm[form] }],
    /* custom text field on Contacts (api_name, not its "salesup
       website" label) — marks the record as website-originated so it
       can be filtered without relying on tags */
    salesup_website: 'yes',
  }
  /* the chosen service or package, so the shared pipeline stays
     filterable; label over slug, and only when the visitor picked one */
  const choice = (plan || service).slice(0, TAG_MAX_LEN)
  if (choice) contact.Tag.push({ name: choice })
  if (email) contact.Email = email

  try {
    const expire = () => {
      cachedToken = null
    }
    let contactId = await biginInsert('Contacts', contact, getAccessToken, expire)
    if (!contactId) {
      /* last-ditch capture: something in the rich record displeased
         Zoho, so retry with only the fields a lead cannot exist
         without. Better a plain record than a lost customer. */
      console.error('[lead] rich insert rejected, retrying minimal', form)
      const minimal = {
        Last_Name: contact.Last_Name,
        Phone: contact.Phone,
        Lead_Source: contact.Lead_Source,
        Description: [contact.Description, email && `الايميل: ${email}`]
          .filter(Boolean)
          .join('\n'),
        salesup_website: 'yes',
      }
      contactId = await biginInsert('Contacts', minimal, getAccessToken, expire)
      if (!contactId) return json(502, { ok: false, error: 'zoho-rejected' })
    }

    /* deal routing: the selection picks the pipeline, falling back to a
       per-form route for submissions that carry no selection */
    const routeKey = clean(body.plan) || clean(body.service) || `form:${form}`
    const route = PIPELINE_ROUTES[routeKey] || PIPELINE_ROUTES[`form:${form}`]
    if (route) {
      const title = plan || service || sourceByForm[form]
      const deal = {
        Deal_Name: `${name} — ${title}`,
        Sub_Pipeline: route.subPipeline,
        Stage: route.stage,
        Contact_Name: { id: contactId },
        Description: detailLines.join('\n') || '—',
      }
      if (route.teamPipeline && route.teamPipelineId) {
        deal.Pipeline = { name: route.teamPipeline, id: route.teamPipelineId }
      }
      /* the contact is already saved, so a failed deal must not fail the
         submission — the lead is captured either way; log and move on */
      const dealId = await biginInsert('Pipelines', deal, getAccessToken, expire)
      if (!dealId) console.error('[lead] deal not created for contact', contactId, routeKey)
    }

    return json(200, { ok: true })
  } catch (err) {
    console.error('[lead] error:', err)
    return json(500, { ok: false, error: 'lead-failed' })
  }
}
