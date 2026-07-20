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

Every contact carries up to three tags: `موقع الويب`, its form type
(`استشارة`, `طلب خدمة`, `مسوقين`), and the service or package chosen
(e.g. `تحسين محركات البحث SEO`). Bigin allows 5 tags per record and
caps distinct tags per module, so keep the vocabulary closed — it
should grow only when the site's own service list grows.

## Deal routing — built, deliberately OFF

**Current state (2026-07-20):** submissions create a tagged Contact and
nothing else. `PIPELINE_ROUTES` in [api/lead.js](../api/lead.js) is
empty, so no deals are created. This is a decision, not an oversight:
the org's nine team pipelines each belong to a *client* (Pin, QUbit,
Hatif, Eduba, Moasher, Lahant, يسوى, and Salesup Marketer / leads
Generation), and website inquiries are SalesUp's own new business —
filing them under a client would pollute that client's board. The
client will create a dedicated website pipeline later.

**To switch routing on** once that pipeline exists:

1. `GET /api/pipelines?key=…` ([api/pipelines.js](../api/pipelines.js),
   key-guarded probe) → returns every team pipeline with its id,
   sub-pipelines, and the stages valid inside each.
2. Add entries to `PIPELINE_ROUTES`, keyed by the site's own slug — the
   `service` slug, the `plan` slug, or `form:<name>` as the catch-all
   for a form with no selection. All three forms sharing one
   destination is just three `form:*` keys pointing at the same route:

   ```js
   const WEBSITE = {
     teamPipeline: 'موقع سيلز أب',
     teamPipelineId: '5068000000XXXXXX',
     subPipeline: '<its sub-pipeline name>',
     stage: 'New leads',
   }
   const PIPELINE_ROUTES = {
     'form:contact': WEBSITE,
     'form:service-request': WEBSITE,
     'form:marketers-apply': WEBSITE,
   }
   ```

   Names must match Bigin exactly, and a stage is only valid inside its
   own sub-pipeline. Per-service routing later is just more keys
   (`'inside-sales': {...}`), which take precedence over `form:*`.
3. Deploy, submit through a form, confirm the deal card appears.
4. Delete `api/pipelines.js` when routing is settled — it exists only
   to read the structure.

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
