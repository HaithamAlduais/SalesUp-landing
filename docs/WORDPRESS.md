# Go-live: the new interface as the salesup.sa WordPress theme

WordPress stays the brain — wp-admin, Rank Math SEO, tracking plugins,
and blog authoring all keep working untouched. The React app ships as a
**theme**: WordPress serves the shell (with Rank Math's per-URL meta
and every tracking snippet injected server-side), the app renders the
interface, and blog content flows from wp-admin through the REST API
into the new design. The Zoho lead pipeline keeps running on the Vercel
function (the theme posts to it cross-origin; CORS is already open for
salesup.sa).

## Build the theme zip

```
npm run build:wp
```

Produces `dist-wp/salesup-theme.zip` (PHP shell from `wp-theme/salesup`
plus the app built with the theme's asset base URL and the Vercel lead
endpoint baked in). Rebuild + re-upload this zip for every future site
update.

## Install — staging first

1. **Backup**: in the host panel, take a full backup (files + database).
2. **Staging**: create a staging copy of the site if the host offers it
   (most do: "Staging" / "Clone"). Do steps 3–6 there first, review,
   then repeat on production — or push staging → live if the host
   supports it.
3. **Upload the theme**: wp-admin → المظهر (Appearance) → Themes →
   Add New → Upload Theme → choose `salesup-theme.zip` → Install →
   **Activate**.
4. **Permalinks**: Settings → Permalinks → Custom Structure:
   `/blog/%postname%/` → Save. This puts every post at `/blog/<slug>`
   (the app's article route), updates Rank Math's sitemap to match, and
   WordPress 301-redirects the old post URLs automatically (the theme
   double-guards this).
5. **Reading settings**: Settings → Reading — "Your homepage displays"
   should be **latest posts or any page; it doesn't matter** (the theme
   renders the app shell for every front-end URL), but do NOT set a
   static front page that Rank Math treats specially if it's currently
   configured — leave as is unless something looks off.
6. **Verify** (checklist below).

## Verify after activation

- Home, /services, /marketers, /sectors/fintech, /blog, /platform,
  /jobs all load the new interface (refresh with Ctrl+F5).
- A blog post opens at /blog/<slug> with content; an OLD post URL
  (from Google) 301-redirects to its /blog/<slug> home.
- Old page URLs redirect: /internal-sales → /services/inside-sales,
  /our-services → /services, /contact-us → /#contact, /affiliate →
  /marketers, etc. (full map in wp-theme/salesup/functions.php).
- Submit the contact form → success message → contact appears in Bigin.
- View source of any page: Rank Math's meta/OG tags and the tracking
  scripts are present in <head>.
- wp-admin works exactly as before; authors can publish a post and see
  it appear on /blog immediately.
- Google Search Console: submit the sitemap again
  (salesup.sa/sitemap_index.xml) after the permalink change.

## Rollback

Appearance → Themes → activate the previous theme. Everything is back
instantly — the new theme changes nothing outside its own rendering.

## Notes & follow-ups

- **Privacy policy / service agreement** pages currently redirect to
  the home page; follow-up: render those WP pages inside the app design
  (REST `pages` endpoint) and point the footer legal links at them.
- The admin bar shows for logged-in admins and may overlap the floating
  header — cosmetic, admins only.
- Vercel (sales-up-landing.vercel.app) stays alive: it hosts the Zoho
  lead function the theme posts to, and doubles as a preview of master.
- Future site changes: edit the repo → `npm run build:wp` → upload the
  new zip (WordPress replaces the theme in place; or bump Version in
  wp-theme/salesup/style.css and use "Add New → Upload → Replace").
