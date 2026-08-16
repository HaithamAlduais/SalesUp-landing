/*
 * Google Sheets side of the lead pipeline: appends one row per form
 * submission to the SalesUp leads workbook, alongside the Bigin (Zoho)
 * contact that api/lead.js creates.
 *
 * Lives outside api/ on purpose — every file under api/ becomes a public
 * route on Vercel, and this is a library, not an endpoint.
 *
 * Required environment variables (Vercel → Settings → Environment
 * Variables; see docs/SHEETS.md for the full setup):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — …@….iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY           — the PEM from the service account's
 *                                  JSON key (real newlines or \n escapes)
 * Optional:
 *   GOOGLE_SHEETS_ID             — override the workbook below
 *
 * Guiding rule, same as the CRM side: the sheet is a second home for a
 * lead, never a way to lose one. Every failure here is logged and
 * swallowed — api/lead.js decides the visitor's answer from whether
 * EITHER destination accepted the submission.
 */

import crypto from 'node:crypto'

/* not a secret — the workbook is private, access is granted by sharing
   it with the service account, and the id is in docs/SHEETS.md anyway */
const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1Mk0ixESjj3_BSExngUeIOlwBqpaOc1xOW8Sfp84ZHuM'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

/* One tab per form. These names must match the workbook exactly — a
   typo appends nothing and Sheets answers 400. */
const TABS = {
  contact: 'الاستشارات · Contact',
  'service-request': 'طلبات الخدمة · Service',
  'marketers-apply': 'المسوقين · Marketers',
  'job-apply': 'التوظيف · Jobs',
}

/*
 * The columns each tab carries between the five shared lead fields and
 * the shared technical block. Order IS the contract — it must match the
 * header row in the workbook, so never reorder without changing both.
 */
const FORM_COLUMNS = {
  contact: ['message'],
  'service-request': ['serviceLabel', 'service', 'org', 'notes'],
  'marketers-apply': ['planType', 'planLabel', 'plan', 'link', 'notes'],
  'job-apply': ['jobLabel', 'job', 'linkedin', 'cv', 'portfolio', 'about'],
}

let cachedToken = null

/* Vercel stores multi-line values fine, but a key pasted through a shell
   or a .env file arrives with literal \n — PEM parsing needs real ones */
function privateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY || ''
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key
}

export function sheetsConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && privateKey() && SHEET_ID)
}

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function timeout(ms, deadline) {
  return AbortSignal.timeout(Math.max(500, Math.min(ms, deadline - Date.now())))
}

/*
 * Service-account auth: sign a JWT with the private key and trade it for
 * an access token. No SDK — node:crypto signs RS256 in four lines, and a
 * dependency here would be a supply-chain surface for one HTTP call.
 */
async function getAccessToken(deadline) {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60000) return cachedToken.value

  const iat = Math.floor(now / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat,
      exp: iat + 3600,
    })
  )
  const unsigned = `${header}.${claims}`
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(privateKey())
  const assertion = `${unsigned}.${b64url(signature)}`

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: timeout(4000, deadline),
  })
  const data = await resp.json().catch(() => null)
  if (!resp.ok || !data || !data.access_token) {
    throw new Error(`google token failed: ${resp.status} ${(data && data.error) || ''}`)
  }
  cachedToken = { value: data.access_token, expiresAt: now + (data.expires_in || 3600) * 1000 }
  return data.access_token
}

/*
 * Fetch the token while the CRM call is still in flight — the two are
 * independent, so the sheet write costs a round trip less. Errors are
 * swallowed here and surface again at append time.
 */
export function warmToken(deadline) {
  if (!sheetsConfigured()) return
  getAccessToken(deadline).catch(() => {})
}

/* Sheets stores a datetime as days since 1899-12-30. The team reads this
   workbook in Riyadh, and a serverless function runs in UTC, so shift
   before converting or every row reads three hours early. */
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000
function riyadhSerial(ms) {
  return (ms + RIYADH_OFFSET_MS) / 86400000 + 25569
}

/* A full user-agent is unreadable in a spreadsheet cell. Order matters:
   Edge and Opera both claim Chrome, and Chrome claims Safari. */
export function deviceLabel(ua) {
  if (!ua) return ''
  const os = /iPhone|iPad|iPod/.test(ua)
    ? 'iPhone'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X/.test(ua)
        ? 'Mac'
        : /Windows/.test(ua)
          ? 'Windows'
          : ''
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : ''
  return [os, browser].filter(Boolean).join(' · ') || ua.slice(0, 80)
}

/*
 * Builds the row exactly as the tab's header row expects it: the five
 * shared lead columns, this form's own columns, then the shared
 * technical block. The three team columns at the end are left off the
 * array entirely so an append never overwrites what the team typed.
 */
export function buildRow({ form, receivedAt, submissionId, lead, fields, meta }) {
  const own = (FORM_COLUMNS[form] || []).map((key) => fields[key] || '')
  return [
    riyadhSerial(receivedAt),
    submissionId,
    lead.name || '',
    /* a leading apostrophe would survive RAW input as a literal
       character, so phones stay plain text by virtue of RAW alone —
       "0551234567" keeps its leading zero */
    lead.phone || '',
    lead.email || '',
    ...own,
    meta.lang || '',
    meta.page || '',
    meta.referrer || '',
    meta.utmSource || '',
    meta.utmMedium || '',
    meta.utmCampaign || '',
    deviceLabel(meta.userAgent || ''),
    meta.crmStatus || '',
    meta.biginId || '',
  ]
}

/*
 * Appends one row. Returns true only when Sheets confirms the write, so
 * the caller never reports a lead as saved on this side when it wasn't.
 *
 * valueInputOption=RAW is deliberate: USER_ENTERED would parse visitor
 * text the way the formula bar does, turning "0551234567" into a number
 * without its leading zero, "1-2" into a date, and a leading "=" into a
 * live formula. RAW stores exactly what was typed. The one value that
 * must be a real number — the timestamp — is sent as a date serial, and
 * the column's date format in the workbook renders it.
 */
export async function appendLead({ form, deadline, ...row }) {
  const tab = TABS[form]
  if (!tab || !sheetsConfigured()) return false

  const token = await getAccessToken(deadline)
  const range = encodeURIComponent(`'${tab}'!A1`)
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append` +
    `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      /* explicit charset: Arabic must never be re-encoded in transit */
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ values: [buildRow({ form, ...row })] }),
    signal: timeout(5000, deadline),
  })
  if (resp.status === 401) {
    /* token revoked or clock-skewed — drop it so the next lead re-mints */
    cachedToken = null
  }
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    console.error('[lead] sheet append failed:', resp.status, detail.slice(0, 400))
    return false
  }
  return true
}

/* exported for the column-count check in scripts/check-sheet-columns.mjs */
export const SHEET_TABS = TABS
export const SHEET_FORM_COLUMNS = FORM_COLUMNS
