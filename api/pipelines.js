/*
 * GET /api/pipelines?key=… — TEMPORARY diagnostic endpoint.
 *
 * Returns the org's Bigin pipeline structure (team pipelines →
 * sub-pipelines → stages) so the service→pipeline routing map in
 * lead.js can be written against the real configuration instead of
 * guessed names. Structure only: no contact or deal data is read (the
 * token has no permission to read records anyway).
 *
 * Guarded by a fixed key so the org's sales-process layout isn't world
 * readable. DELETE THIS FILE once the routing map in lead.js is filled
 * in — it has served its purpose at that point.
 *
 * Requires the refresh token to carry ZohoBigin.settings.layouts.READ.
 */

const PROBE_KEY = '9b07609cd4a8bebef3f7bb85'

function json(status, body) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function getAccessToken() {
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
    throw new Error(`token refresh failed: ${resp.status} ${data.error || ''}`)
  }
  return {
    token: data.access_token,
    apiDomain: process.env.ZOHO_API_DOMAIN || data.api_domain || 'https://www.zohoapis.sa',
    scope: data.scope,
  }
}

export async function GET(request) {
  const url = new URL(request.url)
  if (url.searchParams.get('key') !== PROBE_KEY) {
    return json(404, { error: 'not-found' })
  }
  if (!process.env.ZOHO_REFRESH_TOKEN) {
    return json(503, { error: 'zoho-not-configured' })
  }

  try {
    const { token, apiDomain, scope } = await getAccessToken()
    const resp = await fetch(`${apiDomain}/bigin/v2/settings/layouts?module=Pipelines`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      signal: AbortSignal.timeout(8000),
    })
    const raw = await resp.json().catch(() => null)
    if (!resp.ok) {
      return json(502, { error: 'layouts-failed', status: resp.status, scope, detail: raw })
    }

    /* flatten to just what the routing map needs: each team pipeline
       with its sub-pipelines and the stages valid within each */
    const pipelines = (raw.layouts || []).map((layout) => {
      const subField = (layout.sections || [])
        .flatMap((s) => s.fields || [])
        .find((f) => f.api_name === 'Sub_Pipeline')
      const subs = ((subField && subField.pick_list_values) || []).map((sub) => {
        const stageMap = (sub.maps || []).find((m) => m.api_name === 'Stage')
        return {
          subPipeline: sub.actual_value || sub.display_value,
          stages: ((stageMap && stageMap.pick_list_values) || []).map(
            (st) => st.actual_value || st.display_value
          ),
        }
      })
      return {
        teamPipeline: layout.display_label || layout.name,
        id: layout.id,
        status: layout.status,
        subPipelines: subs,
      }
    })

    return json(200, { scope, count: pipelines.length, pipelines })
  } catch (err) {
    return json(500, { error: 'probe-failed', detail: String(err) })
  }
}
