# Zoho CRM integration

The three site forms (landing contact, services request, marketers
apply) POST to `/api/lead` — a Vercel serverless function
([api/lead.ts](../api/lead.ts)) that creates a **Lead** in Zoho CRM.
The forms show a real error state (with a direct-email fallback) until
the function is configured, so nothing silently pretends to send.

The site code is done. What remains needs the SalesUp Zoho account —
follow these steps once:

## 1. Create a Self Client in the Zoho API console

1. Open the API console for your data center — `https://api-console.zoho.sa/`
   if the account is on the Saudi DC (`crm.zoho.sa`), or
   `https://api-console.zoho.com/` for the global DC. **All URLs below
   must use the same DC.**
2. **Get Started → Self Client → Create**. Copy the **Client ID** and
   **Client Secret**.
3. In the **Generate Code** tab enter:
   - Scope: `ZohoCRM.modules.leads.CREATE`
   - Time Duration: 10 minutes
   - Scope Description: anything (e.g. "website leads")
4. Click **Create**, pick the CRM org if asked, and copy the generated
   **code** (it expires in the duration you chose — do step 2 promptly).

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
  should return `{"ok":true}` — and a Lead named "اختبار" appears in
  CRM → Leads with source "SalesUp Website — استشارة مجانية".
- Submit the site's contact form; the success message should appear
  and the lead should land in CRM.

Before the variables are set, the same curl returns
`{"ok":false,"error":"zoho-not-configured"}` (HTTP 503) — that's the
expected pre-setup state.

## Field mapping

| Site field                    | Zoho Lead field                    |
| ----------------------------- | ---------------------------------- |
| name                          | Last Name (required)               |
| phone                         | Phone (required)                   |
| email                         | Email                              |
| org (services form)           | Company (default "غير محدد")       |
| message / service / plan / link / notes | Description (labeled lines) |
| which form was used           | Lead Source (`SalesUp Website — …`) |

Spam: a hidden honeypot field silently drops bot submissions that fill
it. Genuine failures (Zoho down, bad token) show the form's error state
with `hi@salesup.sa` as fallback — success is never faked.
