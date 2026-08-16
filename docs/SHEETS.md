# Google Sheets integration

Every form submission goes to two places: a Contact in Bigin by Zoho
(see [ZOHO.md](ZOHO.md)) and a row in the SalesUp leads workbook. The two
are independent — whichever one accepts the submission is enough for the
visitor to see success, and the sheet row records how the CRM write went
in its "حالة CRM" column.

**Workbook:** [SalesUp Leads](https://docs.google.com/spreadsheets/d/1Mk0ixESjj3_BSExngUeIOlwBqpaOc1xOW8Sfp84ZHuM/edit)
(id `1Mk0ixESjj3_BSExngUeIOlwBqpaOc1xOW8Sfp84ZHuM`, built from
[SalesUp-Leads.xlsx](SalesUp-Leads.xlsx))

| Form | Tab | Where on the site |
| --- | --- | --- |
| `contact` | الاستشارات · Contact | landing page contact panel (`/`) |
| `service-request` | طلبات الخدمة · Service | `/services`, `/services/:slug` |
| `marketers-apply` | المسوقين · Marketers | `/marketers?type=…&pick=…` |
| `job-apply` | التوظيف · Jobs | `/jobs?job=…` |

The **الحقول · Fields** tab inside the workbook documents every column
and the payload field behind it. The **ملخص · Summary** tab counts
submissions per form and per service with live formulas.

The code is done ([lib/sheets.js](../lib/sheets.js), wired into
[api/lead.js](../api/lead.js)). What remains needs the SalesUp Google
account — follow these steps once.

## 1. Create a service account

The site is a serverless function with no Google identity of its own, so
it needs one to write. A service account is a robot Google account whose
key the function signs requests with.

1. Open <https://console.cloud.google.com/> with the SalesUp Google
   account. Create a project (name it e.g. `salesup-website`) or pick an
   existing one. No billing is required — the Sheets API is free.
2. Enable the API: <https://console.cloud.google.com/apis/library/sheets.googleapis.com>
   → **Enable** (make sure the project selector at the top says your
   project).
3. Go to **IAM & Admin → Service Accounts** → **Create service account**.
   - Name: `salesup-leads`
   - Skip the optional "grant access" steps → **Done**.
4. Open the new account → **Keys** tab → **Add key → Create new key →
   JSON** → **Create**. A `.json` file downloads. It contains a private
   key — treat it like a password and don't commit it.

If you have the `gcloud` CLI, steps 1–4 are:

```bash
gcloud projects create salesup-website --set-as-default && gcloud services enable sheets.googleapis.com && gcloud iam service-accounts create salesup-leads --display-name="SalesUp leads" && gcloud iam service-accounts keys create salesup-leads.json --iam-account="salesup-leads@salesup-website.iam.gserviceaccount.com"
```

## 2. Share the workbook with it

Open the downloaded JSON and copy the `client_email` value — it looks
like `salesup-leads@salesup-website.iam.gserviceaccount.com`.

In the workbook: **Share** → paste that address → give it **Editor** →
uncheck "Notify people" → **Share**.

Without this the function authenticates fine and then gets a 403 — the
robot has an identity but no access to this particular file.

## 3. Add the environment variables in Vercel

Vercel dashboard → the `SalesUp-landing` project → **Settings →
Environment Variables** → add for **Production** (and Preview if you want
test deploys to write rows):

| Name | Value |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | the `client_email` from the JSON |
| `GOOGLE_PRIVATE_KEY` | the `private_key` from the JSON — the whole block, `-----BEGIN PRIVATE KEY-----` through `-----END PRIVATE KEY-----` |
| `GOOGLE_SHEETS_ID` | *optional* — only if the workbook is ever replaced; the current id is the default in the code |

Paste the private key with its real line breaks; if your copy arrives as
one line with literal `\n`, that works too — the code handles both.

Then **Deployments → ⋯ on the latest → Redeploy** so the function picks
the variables up.

## 4. Lock the workbook down

The sheet is currently readable by anyone with the link. It is about to
hold customer names, phone numbers and emails, and the function no longer
needs link access — it authenticates as the service account.

**Share → General access → Restricted**, then add your team by name.

(One consequence: `npm run check:sheet` reads the header row through the
public CSV export, so it stops working once sharing is restricted. It is
a schema guard, not part of the request path — run it before locking
down, or temporarily re-share when you change columns.)

## 5. Verify

Submit the landing page's contact form on the live site. Within a second
or two a row appears at the top of **الاستشارات · Contact** with the
timestamp, a submission id like `SU-3F9A2C41`, the values you typed, and
`ok` in the CRM-status column.

Check the timestamp column shows a date (`2026-08-07 14:32`) and not a
bare number like `46241.6`. If it shows a number, the date format didn't
survive the xlsx import: select column A → **Format → Number → Date
time**. It only needs doing once, per tab.

If no row appears, **Vercel → the deployment → Functions → `api/lead`**
logs the reason with a `[lead] sheet append failed:` prefix. The usual
causes are a workbook not shared with the service account (403), a tab
renamed since (400), or a key pasted without its `BEGIN`/`END` lines
(the token request fails).

## What gets written

Each row is the five shared lead columns, then the form's own fields,
then a technical block: language, page, referrer, `utm_source` /
`utm_medium` / `utm_campaign`, device, CRM status, Bigin contact id.

Campaign tags are captured from the URL on first page load and kept in
`sessionStorage` ([src/components/leads.ts](../src/components/leads.ts)),
so a visitor who lands on `/?utm_source=google` and submits three pages
later is still credited to that campaign.

The last three columns — حالة المتابعة / المسؤول / ملاحظات الفريق — are
the team's. An append writes only up to the Bigin id, so nothing typed
there is ever overwritten.

Values are written with `valueInputOption=RAW`, which stores exactly what
the visitor typed. This is deliberate: the alternative parses text the
way the formula bar does, which would drop the leading zero from
`0551234567`, read `1-2` as a date, and execute a message that starts
with `=`.

## Changing columns

Column order is the contract — [lib/sheets.js](../lib/sheets.js) builds
each row positionally, and Sheets accepts any row you hand it, so a
mismatch files phone numbers under "Email" without erroring anywhere.

After any change to a form's fields or the workbook's headers, update
`FORM_COLUMNS` in `lib/sheets.js` and the header lists in
[scripts/check-sheet-columns.mjs](../scripts/check-sheet-columns.mjs),
then run:

```bash
npm run check:sheet
```

It reads the live header rows and fails loudly on any drift.
