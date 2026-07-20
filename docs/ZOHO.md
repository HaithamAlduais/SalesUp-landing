# Bigin by Zoho integration

The three site forms (landing contact, services request, marketers
apply) POST to `/api/lead` — a Vercel serverless function
([api/lead.js](../api/lead.js)) that creates a **Contact** in Bigin by Zoho.
The forms show a real error state (with a direct-email fallback) until
the function is configured, so nothing silently pretends to send.

The site code is done. What remains needs the SalesUp Zoho account —
follow these steps once:

## 1. Create a Self Client in the Zoho API console

1. Open the API console for your data center — check the address bar
   when logged into Bigin: `bigin.zoho.sa` → use
   `https://api-console.zoho.sa/`; `bigin.zoho.com` → use
   `https://api-console.zoho.com/`. **All URLs below must use the same
   DC.**
2. **Get Started → Self Client → Create**. Copy the **Client ID** and
   **Client Secret**.
3. In the **Generate Code** tab enter:
   - Scope (comma-separated, no spaces):
     `ZohoBigin.modules.contacts.CREATE,ZohoBigin.modules.pipelines.CREATE,ZohoBigin.settings.layouts.READ`
   - Time Duration: 10 minutes
   - Scope Description: anything (e.g. "website leads")

   Scopes are baked into the refresh token permanently — widening them
   later means minting a new token, so request all three up front.
   They cover: creating contacts (with tags, which need no scope of
   their own), creating deals in pipelines, and reading the pipeline /
   stage names the routing map is built from. None of them can read,
   edit, or delete existing records.
4. Click **Create**, pick the Bigin portal/org if asked, and copy the
   generated **code** (it expires in the duration you chose — do step 2
   promptly).

## 2. Exchange the code for a refresh token

Run this in a local terminal within the time window (fill in the three
values; keep `.sa` or swap to `.com` to match your DC):

```
curl -s -X POST "https://accounts.zoho.sa/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=PASTE_CLIENT_ID" \
  -d "client_secret=PASTE_CLIENT_SECRET" \
  -d "code=PASTE_GENERATED_CODE"
```

The JSON response contains `refresh_token` — that token never expires
and is what the site uses. (If the response has an error, regenerate
the code and retry.)

## 3. Add the environment variables in Vercel

Vercel dashboard → the `SalesUp-landing` project → **Settings →
Environment Variables** → add for **Production** (and Preview if you
want test deploys to send leads):

| Name                 | Value                                        |
| -------------------- | -------------------------------------------- |
| `ZOHO_CLIENT_ID`     | from step 1                                  |
| `ZOHO_CLIENT_SECRET` | from step 1                                  |
| `ZOHO_REFRESH_TOKEN` | from step 2                                  |
| `ZOHO_ACCOUNTS_URL`  | `https://accounts.zoho.sa` — only needed if NOT on the Saudi DC (e.g. `https://accounts.zoho.com`) |

Then **Deployments → ⋯ on the latest → Redeploy** so the function picks
the variables up.

## 4. Verify

- `curl -s -X POST https://sales-up-landing.vercel.app/api/lead -H "Content-Type: application/json" -d '{"form":"contact","name":"اختبار","phone":"0500000000"}'`
  should return `{"ok":true}` — and a Contact named "اختبار" appears in
  Bigin → Contacts with source "موقع SalesUp — استشارة مجانية".
- Submit the site's contact form; the success message should appear
  and the contact should land in Bigin.

Before the variables are set, the same curl returns
`{"ok":false,"error":"zoho-not-configured"}` (HTTP 503) — that's the
expected pre-setup state.

## Field mapping

| Site field                    | Bigin Contact field                |
| ----------------------------- | ---------------------------------- |
| name                          | Last Name (required)               |
| phone                         | Phone (required)                   |
| email                         | Email                              |
| org / message / service / plan / link / notes | Description (labeled lines; Bigin's Company is a lookup, so org stays in Description) |
| which form was used           | Lead Source (`موقع SalesUp — …`)   |

Spam: a hidden honeypot field silently drops bot submissions that fill
it. Genuine failures (Zoho down, bad token) show the form's error state
with `hi@salesup.sa` as fallback — success is never faked.

Every contact is tagged `موقع الويب` plus its form type (`استشارة`,
`طلب خدمة`, `مسوقين`). The vocabulary is kept small on purpose: Bigin
allows 5 tags per record and 10 per module on Express.

## Deal routing

`PIPELINE_ROUTES` in [api/lead.js](../api/lead.js) maps a site slug (the
chosen service or package, or `form:<name>` when a form has no
selection) to a Bigin placement: team pipeline + sub-pipeline + stage.
When a route matches, the submission also creates a deal linked to the
new contact. Names must match Bigin exactly — read the real structure
from `GET /api/pipelines?key=…` ([api/pipelines.js](../api/pipelines.js),
a temporary key-guarded probe; delete it once the map is written).

Unmapped submissions still create the contact, so routing can be filled
in incrementally without risking lost leads. A deal that fails to insert
never fails the submission — the contact is already saved and the error
is logged in the Vercel function logs.

## Arabic text

Send `Content-Type: application/json; charset=utf-8` (both API calls
do). Note that testing with `curl` from a Windows shell corrupts Arabic
before it is sent — the console rewrites UTF-8 to legacy CP1256 and
records land as `??????`. Test from a browser, or put the JSON in a
file and use `--data-binary @file.json`.
