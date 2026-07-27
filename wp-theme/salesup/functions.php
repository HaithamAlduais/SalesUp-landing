<?php
/**
 * SalesUp theme wiring: enqueue the built app, keep SEO/tracking
 * plugins in charge of <head>, serve SPA routes with correct status
 * codes, and 301 the old site's URLs onto the new structure so Google
 * rankings transfer.
 */

/* الوظائف post type — the team manages roles from wp-admin */
require_once __DIR__ . '/inc/jobs-cpt.php';

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

	/* tell the app where WordPress lives ('/' in production, '/test/'
	   on a subdirectory staging clone) so routes and links adapt —
	   one theme zip works in both places */
	$home_path = (string) parse_url( home_url( '/' ), PHP_URL_PATH );
	wp_add_inline_script(
		'salesup-app',
		'window.__SALESUP_BASE__ = ' . wp_json_encode( $home_path ) . ';',
		'before'
	);
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

	/* subdirectory installs (staging clones): match paths relative to
	   the WordPress home, not the domain root */
	$home_path = trim( (string) parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( '' !== $home_path ) {
		if ( $decoded === $home_path ) {
			$decoded = '';
		} elseif ( 0 === strpos( $decoded, $home_path . '/' ) ) {
			$decoded = substr( $decoded, strlen( $home_path ) + 1 );
		}
	}

	/* 1. explicit old→new map */
	$map = salesup_redirect_map();
	if ( isset( $map[ $decoded ] ) ) {
		wp_redirect( home_url( $map[ $decoded ] ), 301 );
		exit;
	}

	/* 2. posts still reached at a non-/blog permalink (old structure)
	      → their canonical /blog/<slug> home */
	if ( is_single() && ! is_admin() && 0 !== strpos( $decoded, 'blog/' ) ) {
		$name = get_post_field( 'post_name', get_queried_object_id() );
		if ( $name ) {
			wp_redirect( home_url( '/blog/' . $name . '/' ), 301 );
			exit;
		}
	}

	/* 2b. OLD post URLs at the domain root (salesup.sa/<slug>/) match
	      no rewrite rule after the permalink change, so they arrive as
	      plain 404s — is_single() never fires for them. Google has 35
	      of them indexed: find the post by slug and 301 it (and every
	      visitor from search) to its new /blog/ home. Arabic slugs are
	      stored percent-encoded, so try both encodings. */
	if ( is_404() && '' !== $decoded && false === strpos( $decoded, '/' ) ) {
		foreach ( array_unique( array( rawurlencode( $decoded ), $decoded ) ) as $name ) {
			$ids = get_posts( array(
				'name'        => $name,
				'post_type'   => 'post',
				'post_status' => 'publish',
				'numberposts' => 1,
				'fields'      => 'ids',
			) );
			if ( $ids ) {
				wp_redirect( home_url( '/blog/' . get_post_field( 'post_name', $ids[0] ) . '/' ), 301 );
				exit;
			}
		}
	}

	/* 3. app-owned routes that WordPress would 404 (they have no WP
	      object behind them) must still serve the shell with a 200 —
	      AND stop looking like an error page. Flipping only the status
	      header left $wp_query->is_404 true, so Rank Math titled every
	      one of them "Page Not Found" and stamped them noindex; Google
	      would have refused to index /services, /marketers, /jobs … */
	if ( is_404() ) {
		$first      = explode( '/', $decoded )[0];
		$app_routes = array( 'services', 'marketers', 'sectors', 'blog', 'platform', 'jobs' );
		if ( '' === $decoded || in_array( $first, $app_routes, true ) ) {
			global $wp_query;
			$wp_query->is_404 = false;
			status_header( 200 );
			$GLOBALS['salesup_app_route'] = $decoded;
		}
	}
} );

/**
 * Titles for the app-owned routes (they have no WP post to inherit
 * one from). Longest match wins, so /services/inside-sales gets its
 * own title and an unmapped /services/<x> still falls back to الخدمات.
 */
function salesup_route_titles() {
	return array(
		'services'                   => 'الخدمات',
		'services/inside-sales'      => 'المبيعات الداخلية',
		'services/outside-sales'     => 'المبيعات الخارجية',
		'services/sales-development' => 'تطوير المبيعات',
		'services/lead-generation'   => 'توليد العملاء المحتملين',
		'services/ai-sales'          => 'أدوات الذكاء الاصطناعي',
		'marketers'                  => 'التسويق',
		'sectors'                    => 'القطاعات',
		'sectors/technology'         => 'تقنية المعلومات',
		'sectors/fintech'            => 'تقنية مالية',
		'sectors/saas'               => 'SaaS',
		'sectors/agencies'           => 'الوكالات الإعلانية',
		'blog'                       => 'المدونة',
		'platform'                   => 'الحلول الرقمية',
		'jobs'                       => 'انضم لنا',
		'jobs/students'              => 'التدريب التعاوني',
		'jobs/graduates'             => 'وظائف الخريجين',
		'jobs/apply'                 => 'التقديم على وظيفة',
	);
}

function salesup_current_route_title() {
	$route = $GLOBALS['salesup_app_route'] ?? '';
	if ( '' === $route ) {
		return null;
	}
	$titles = salesup_route_titles();
	if ( isset( $titles[ $route ] ) ) {
		return $titles[ $route ];
	}
	$first = explode( '/', $route )[0];
	return $titles[ $first ] ?? null;
}

/* both filters: Rank Math owns the title when active, WordPress core
   when it isn't */
function salesup_filter_title( $title ) {
	$name = salesup_current_route_title();
	return $name ? $name . ' - ' . get_bloginfo( 'name' ) : $title;
}
add_filter( 'pre_get_document_title', 'salesup_filter_title', 999 );
add_filter( 'rank_math/frontend/title', 'salesup_filter_title', 999 );

/* these routes are real pages — never noindex them */
add_filter( 'rank_math/frontend/robots', function ( $robots ) {
	if ( salesup_current_route_title() ) {
		unset( $robots['noindex'] );
		$robots['index'] = 'index';
	}
	return $robots;
}, 999 );

add_filter( 'rank_math/frontend/canonical', function ( $canonical ) {
	$route = $GLOBALS['salesup_app_route'] ?? '';
	return $route ? home_url( '/' . $route ) : $canonical;
}, 999 );

/* The app is the only renderer — page/post content reaches it over the
   REST API, so nothing else needs template parts. Keep REST and
   feeds untouched. */
