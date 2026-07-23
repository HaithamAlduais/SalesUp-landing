<?php
/**
 * Single-template theme: every front-end URL renders the app shell.
 * WordPress (via wp_head) injects the real per-URL SEO tags (Rank
 * Math), tracking snippets, and enqueued app assets; the React app
 * takes over routing in the browser. wp-admin, wp-json and uploads are
 * untouched by any of this.
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0ecb94" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <?php wp_head(); ?>
</head>
<body>
  <div id="root"></div>
  <?php wp_footer(); ?>
</body>
</html>
