<?php
/**
 * SalesUp theme wiring: enqueue the built app, keep SEO/tracking
 * plugins in charge of <head>, serve SPA routes with correct status
 * codes, and 301 the old site's URLs onto the new structure so Google
 * rankings transfer.
 */

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );        /* Rank Math owns titles */
	add_theme_support( 'post-thumbnails' );  /* featured images, used by the app via REST */
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
} );

/**
 * Enqueue the Vite build. The manifest maps the entry to its hashed
 * files; assets live in this theme's /assets directory (built by
 * `npm run build:wp` in the app repo — never edited by hand).
 */
add_action( 'wp_enqueue_scripts', function () {
	$manifest_path = get_theme_file_path( 'manifest.json' );
	if ( ! file_exists( $manifest_path ) ) {
		return;
	}
	$manifest = json_decode( file_get_contents( $manifest_path ), true );
	$entry    = $manifest['index.html'] ?? null;
	if ( ! $entry ) {
		return;
	}
	$ver = wp_get_theme()->get( 'Version' );
	foreach ( $entry['css'] ?? array() as $i => $css ) {
		wp_enqueue_style( 'salesup-app-' . $i, get_theme_file_uri( $css ), array(), $ver );
	}
	wp_enqueue_script( 'salesup-app', get_theme_file_uri( $entry['file'] ), array(), $ver, true );
} );

/* Vite output is an ES module */
add_filter( 'script_loader_tag', function ( $tag, $handle, $src ) {
	if ( 'salesup-app' === $handle ) {
		return '<script type="module" crossorigin src="' . esc_url( $src ) . '"></script>' . "\n";
	}
	return $tag;
}, 10, 3 );

/**
 * Old-site URLs → new routes (301, so search rankings transfer).
 * Keys are DECODED paths without slashes.
 */
function salesup_redirect_map() {
	return array(
		'internal-sales'          => '/services/inside-sales',
		'external-sales'          => '/services/outside-sales',
		'sales-development'       => '/services/sales-development',
		'leads-generation'        => '/services/lead-generation',
		'artificial-intelligence' => '/services/ai-sales',
		'training-development'    => '/services',
		'our-services'            => '/services',
		'why-us'                  => '/',
		'contact-us'              => '/#contact',
		'affiliate'               => '/marketers',
		'برنامج-التسويق-بالعمولة-المطور' => '/marketers',
		'انضم-لنا'                => '/jobs',
		'تدريب-تعاوني'            => '/jobs',
		/* retired/utility pages */
		'shaya-alqahtani'         => '/',
		'elementor-731'           => '/',
		'test'                    => '/',
		/* legal pages: app placeholders for now (follow-up: render the
		   WP page content inside the app design) */
		'privacy-policy'          => '/',
		'service-agreement'       => '/',
	);
}

add_action( 'template_redirect', function () {
	if ( is_admin() ) {
		return;
	}

	$path    = trim( (string) parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ), '/' );
	$decoded = rawurldecode( $path );

	/* 1. explicit old→new map */
	$map = salesup_redirect_map();
	if ( isset( $map[ $decoded ] ) ) {
		wp_redirect( home_url( $map[ $decoded ] ), 301 );
		exit;
	}

	/* 2. posts still reached at a non-/blog permalink (old structure)
	      → their canonical /blog/<slug> home */
	if ( is_single() && 0 !== strpos( $decoded, 'blog/' ) ) {
		$name = get_post_field( 'post_name', get_queried_object_id() );
		if ( $name ) {
			wp_redirect( home_url( '/blog/' . $name . '/' ), 301 );
			exit;
		}
	}

	/* 3. app-owned routes that WordPress would 404 (they have no WP
	      object behind them) must still serve the shell with a 200 */
	if ( is_404() ) {
		$first = explode( '/', $decoded )[0];
		$app_routes = array( 'services', 'marketers', 'sectors', 'blog', 'platform', 'jobs' );
		if ( '' === $decoded || in_array( $first, $app_routes, true ) ) {
			status_header( 200 );
		}
	}
} );

/* The app is the only renderer — page/post content reaches it over the
   REST API, so nothing else needs template parts. Keep REST and
   feeds untouched. */
