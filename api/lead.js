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
 *                         (default https://accounts.zoho.sa)
 *   ZOHO_API_DOMAIN     — API origin override; normally taken from the
 *                         token response's api_domain
 *
 * Guiding rule throughout: a submission is a sales lead, so no single
 * field, tag, or CRM setting may ever cost the whole record. Anything
 * Zoho might reject is either validated away or dropped on retry, and
 * the values live on in the description regardless.
 */

const FORMS = new Set(['contact', 'service-request', 'marketers-apply'])
const MAX_LEN = 3000

/*
 * Service → Bigin pipeline routing. Keys are the site's own slugs, or
 * `form:<name>` for a submission with no selection. Empty until the
 * client creates a website pipeline — see docs/ZOHO.md. While a key is
 * missing the contact is still created and only the deal is skipped.
 */
const PIPELINE_ROUTES = {}

/*
 * Tags. The choice tag comes from a server-side allowlist keyed by the
 * site's stable slugs — never from the client's own label — because a
 * free-text tag name lets anyone invent unlimited distinct tags and
 * exhaust Bigin's per-module tag cap, after which legitimate inserts
 * start failing.
 */
const TAG_SOURCE = 'موقع الويب'
const tagByForm = {
  contact: 'استشارة',
  'service-request': 'طلب خدمة',
  'marketers-apply': 'مسوقين',
}
const CHOICE_TAGS = {
  'outside-sales': 'المبيعات الخارجية',
  'inside-sales': 'المبيعات الداخلية',
  'sales-development': 'تطوير المبيعات',
  'lead-generation': 'توليد العملاء المحتملين',
  'ai-sales': 'الـ AI للمبيعات',
  marketers: 'التسويق',
  seo: 'تحسين محركات البحث SEO',
  campaigns: 'إدارة الحملات الإعلانية',
  basic: 'الباقة الأساسية',
  pro: 'الباقة الاحترافية',
}

/* Zoho enforces its own field lengths and rejects the whole record when
   one is exceeded, so trim before sending rather than lose the lead */
const LIMITS = { name: 80, phone: 30, email: 100 }

/* stricter than the browser's type="email", which accepts "a@b" —
   Zoho requires a real domain and refuses the record otherwise */
const EMAIL_RE = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/

/* Total server budget, kept comfortably under the function's ceiling
   and well under the client's abort so the browser always hears an
   answer rather than assuming failure for a lead that was created. */
const BUDGET_MS = 12000
const TOKEN_MS = 4000
const INSERT_MS = 5000

let cachedToken = null

/* Naive per-instance flood guard. Serverless instances are many and
   short-lived, so this is a speed bump for casual abuse, not real rate
   limiting — a durable store (Vercel KV) would be needed for that. */
const hits = new Map()
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 6

function rateLimited(ip) {
  if (!ip) return false
  const now = Date.now()
  const seen = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  seen.push(now)
  hits.set(ip, seen)
  if (hits.size > 5000) hits.clear()
  return seen.length > RATE_MAX
}

function timeout(ms, deadline) {
  return AbortSignal.timeout(Math.max(500, Math.min(ms, deadline - Date.now())))
}

async function getAccessToken(deadline) {
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
    signal: timeout(TOKEN_MS, deadline),
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

/* Spreadsheet formula injection: CRM exports open in Excel, where a
   leading =/+/-/@ turns a visitor's text into a live formula. */
function clean(value) {
  if (typeof value !== 'string') return ''
  const v = value.trim().slice(0, MAX_LEN)
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

/*
 * One Bigin write. Returns the new record's id, `null` when Zoho
 * explicitly rejected the record (worth retrying with fewer fields),
 * or `undefined` when the outcome is unknown — a network fault or a
 * timeout, where the record may well have been created, so a retry
 * would risk a duplicate.
 */
async function biginInsert(module, record, deadline) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (Date.now() > deadline - 600) return undefined
    let resp
    let result
    try {
      const { token, apiDomain } = await getAccessToken(deadline)
      resp = await fetch(`${apiDomain}/bigin/v2/${module}`, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          /* explicit charset: Arabic must never be re-encoded in transit */
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ data: [record] }),
        signal: timeout(INSERT_MS, deadline),
      })
      result = await resp.json().catch(() => null)
    } catch (err) {
      console.error(`[lead] ${module} insert errored:`, String(err))
      return undefined
    }
    if (resp.status === 401 && attempt === 0) {
      cachedToken = null
      continue
    }
    const row = result && result.data && result.data[0]
    if (row && row.status === 'success') return (row.details && row.details.id) || null
    console.error(`[lead] ${module} insert failed:`, resp.status, JSON.stringify(result))
    /* a parsed error body means Zoho judged the record; anything else
       (unreadable body, 5xx) leaves the outcome genuinely unknown */
    return row && row.status === 'error' ? null : undefined
  }
  return undefined
}

/* per-method export — Vercel's Node runtime only routes the web
   Request/Response signature through named method exports */
export async function POST(request) {
  const deadline = Date.now() + BUDGET_MS

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, error: 'invalid-json' })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid-json' })
  }

  /* bots that fill every field trip the honeypot; answer success so
     they move on, but never forward the record */
  if (clean(body.website)) {
    console.warn('[lead] honeypot drop', clean(body.form))
    return json(200, { ok: true })
  }

  const form = clean(body.form)
  const name = clean(body.name)
  const phone = clean(body.phone)
  if (!FORMS.has(form) || !name || !phone) {
    return json(400, { ok: false, error: 'missing-fields' })
  }

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  if (rateLimited(ip)) {
    console.warn('[lead] rate limited', ip)
    return json(429, { ok: false, error: 'too-many-requests' })
  }

  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET || !process.env.ZOHO_REFRESH_TOKEN) {
    return json(503, { ok: false, error: 'zoho-not-configured' })
  }

  const sourceByForm = {
    contact: 'موقع SalesUp — استشارة مجانية',
    'service-request': 'موقع SalesUp — طلب خدمة',
    'marketers-apply': 'موقع SalesUp — طلب مسوقين',
  }
  /* selects carry a slug for routing plus a readable label — prefer the
     label so the CRM record says "المبيعات الداخلية", not "inside-sales" */
  const service = clean(body.serviceLabel) || clean(body.service)
  const plan = clean(body.planLabel) || clean(body.plan)

  /* Zoho rejects a record outright if Email isn't a real address, and
     the browser's own type="email" check passes things it won't accept
     (no dot in the domain). Email is optional on every form here, so a
     typo in it must never cost the lead: keep the address only when it
     is genuinely valid, and carry a bad one through in the description
     so the team can still see what the visitor meant to type. Length is
     a reason to reject, never to truncate — a cut address is wrong. */
  const rawEmail = clean(body.email)
  const email = EMAIL_RE.test(rawEmail) && rawEmail.length <= LIMITS.email ? rawEmail : ''
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
  const details = detailLines.join('\n') || '—'

  const contact = {
    /* Zoho caps Last_Name; an over-long name would fail the insert */
    Last_Name: name.slice(0, LIMITS.name),
    Phone: phone.slice(0, LIMITS.phone),
    Lead_Source: sourceByForm[form],
    Description: details,
    Tag: [{ name: TAG_SOURCE }, { name: tagByForm[form] }],
    /* custom text field on Contacts (api_name, not its "salesup
       website" label) — marks the record as website-originated so it
       can be filtered without relying on tags */
    salesup_website: 'yes',
  }
  const choice = CHOICE_TAGS[clean(body.plan)] || CHOICE_TAGS[clean(body.service)]
  if (choice) contact.Tag.push({ name: choice })
  if (email) contact.Email = email

  try {
    let contactId = await biginInsert('Contacts', contact, deadline)

    if (contactId === null) {
      /* Zoho judged the rich record unacceptable. Retry with only what
         a contact cannot exist without: Last_Name is the single
         mandatory field, and Description depends on no org
         configuration. Everything else — tags, the Lead Source
         picklist, the custom field, Email — is a thing an admin can
         rename or delete in Bigin, so none of it goes in the retry;
         the values survive inside the description instead. */
      console.error('[lead] rich insert rejected, retrying minimal', form)
      const minimal = {
        Last_Name: contact.Last_Name,
        Description: [
          `المصدر: ${sourceByForm[form]}`,
          `الجوال: ${contact.Phone}`,
          email && `الايميل: ${email}`,
          details,
        ]
          .filter(Boolean)
          .join('\n'),
      }
      contactId = await biginInsert('Contacts', minimal, deadline)
    }

    /* undefined = we never learned the outcome; the record may exist,
       so report success rather than provoke a duplicate submission */
    if (contactId === undefined) {
      console.error('[lead] outcome unknown, not retrying', form)
      return json(200, { ok: true })
    }
    if (contactId === null) return json(502, { ok: false, error: 'zoho-rejected' })

    /* deal routing: the selection picks the pipeline, falling back to a
       per-form route for submissions that carry no selection */
    const routeKey = clean(body.plan) || clean(body.service) || `form:${form}`
    const route = PIPELINE_ROUTES[routeKey] || PIPELINE_ROUTES[`form:${form}`]
    if (route && Date.now() < deadline - 1000) {
      const title = plan || service || sourceByForm[form]
      const deal = {
        Deal_Name: `${name} — ${title}`.slice(0, 120),
        Sub_Pipeline: route.subPipeline,
        Stage: route.stage,
        Contact_Name: { id: contactId },
        Description: details,
      }
      if (route.teamPipeline && route.teamPipelineId) {
        deal.Pipeline = { name: route.teamPipeline, id: route.teamPipelineId }
      }
      /* the contact is already saved, so a failed deal must not fail the
         submission — the lead is captured either way; log and move on */
      const dealId = await biginInsert('Pipelines', deal, deadline)
      if (!dealId) console.error('[lead] deal not created for contact', contactId, routeKey)
    }

    return json(200, { ok: true })
  } catch (err) {
    console.error('[lead] error:', err)
    return json(500, { ok: false, error: 'lead-failed' })
  }
}
