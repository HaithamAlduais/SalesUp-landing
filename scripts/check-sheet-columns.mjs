/*
 * Guards the one thing that can silently corrupt the leads sheet: column
 * order. lib/sheets.js builds each row positionally, so a header renamed
 * or moved in Google Sheets would file phone numbers under "Email" with
 * no error anywhere — Sheets accepts any row you hand it.
 *
 * Reads the live header rows and checks them against what the code
 * builds. Needs no credentials (the header row is read through the
 * public CSV export), so it runs anywhere:
 *
 *   node scripts/check-sheet-columns.mjs
 *
 * If the workbook is set to Restricted sharing — which it should be once
 * it holds real leads — this can't read it; pass a CSV export of each
 * tab instead, or just re-run it after any deliberate column change.
 */

import { buildRow, SHEET_TABS, SHEET_FORM_COLUMNS } from '../lib/sheets.js'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1Mk0ixESjj3_BSExngUeIOlwBqpaOc1xOW8Sfp84ZHuM'

/* the shared blocks every tab carries, in order */
const LEAD_HEADS = ['التاريخ والوقت', 'رقم الطلب', 'الاسم', 'رقم الجوال', 'الايميل']
const META_HEADS = [
  'اللغة',
  'الصفحة',
  'المصدر المُحيل',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'الجهاز والمتصفح',
  'حالة CRM',
  'معرّف Bigin',
]
const TEAM_HEADS = ['حالة المتابعة', 'المسؤول', 'ملاحظات الفريق']

/* per-form columns, by the header prefix each one should sit under */
const FORM_HEADS = {
  contact: ['الرسالة'],
  'service-request': ['الخدمة', 'رمز الخدمة', 'اسم الجهة', 'ملاحظات العميل'],
  'marketers-apply': ['النوع', 'الباقة أو الخدمة', 'رمز الاختيار', 'رابط المنتج', 'ملاحظات العميل'],
  'job-apply': ['الوظيفة', 'رمز الوظيفة', 'لينكدإن', 'السيرة الذاتية', 'ملف الأعمال', 'نبذة عن المتقدم'],
}

function parseCsvLine(line) {
  const out = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      out.push(cell)
      cell = ''
    } else cell += ch
  }
  out.push(cell)
  return out
}

async function headersFor(tab) {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:csv&sheet=${encodeURIComponent(tab)}`
  const resp = await fetch(url, { redirect: 'follow' })
  if (!resp.ok) throw new Error(`cannot read "${tab}" (HTTP ${resp.status})`)
  const text = await resp.text()
  if (text.startsWith('<')) throw new Error(`cannot read "${tab}" — sharing is restricted`)
  return parseCsvLine(text.split('\n')[0].trim())
}

const sample = {
  receivedAt: Date.UTC(2026, 7, 7, 11, 32),
  submissionId: 'SU-TEST0001',
  lead: { name: 'اختبار', phone: '0550000000', email: 'test@example.com' },
  fields: Object.fromEntries(
    Object.values(SHEET_FORM_COLUMNS)
      .flat()
      .map((key) => [key, `<${key}>`])
  ),
  meta: { lang: 'ar', crmStatus: 'ok', biginId: '1', userAgent: 'x' },
}

let failures = 0
const fail = (msg) => {
  failures++
  console.error('  ✗', msg)
}

for (const [form, tab] of Object.entries(SHEET_TABS)) {
  console.log(`\n${form} → ${tab}`)
  let headers
  try {
    headers = await headersFor(tab)
  } catch (err) {
    fail(String(err.message))
    continue
  }
  const row = buildRow({ form, ...sample })
  const expected = [...LEAD_HEADS, ...FORM_HEADS[form], ...META_HEADS, ...TEAM_HEADS]

  if (headers.length !== expected.length) {
    fail(`sheet has ${headers.length} columns, code expects ${expected.length}`)
  }
  if (row.length !== expected.length - TEAM_HEADS.length) {
    fail(`row writes ${row.length} values, should write ${expected.length - TEAM_HEADS.length}`)
  }
  expected.forEach((want, i) => {
    const got = headers[i] || ''
    if (!got.startsWith(want)) fail(`column ${i + 1}: sheet says "${got}", code writes "${want}"`)
  })
  /* the team's columns must stay past the end of what an append writes */
  if (row.length > expected.length - TEAM_HEADS.length) {
    fail('an append would overwrite the team columns')
  }
  if (!failures) console.log(`  ✓ ${headers.length} columns aligned, ${row.length} written by the app`)
  if (form === 'contact') console.log('  row 1 sample:', JSON.stringify(row.slice(0, 6)))
}

console.log(failures ? `\n${failures} problem(s) found` : '\nAll tabs match the code.')
process.exit(failures ? 1 : 0)
