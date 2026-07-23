<?php
/* Unknown URLs render the same app shell (functions.php upgrades known
   app routes to 200; genuinely unknown paths stay 404 and the app
   shows its own not-found/home state). */
require __DIR__ . '/index.php';
