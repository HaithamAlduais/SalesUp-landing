<?php
/**
 * الوظائف — a "job" post type so the team opens and closes roles from
 * wp-admin instead of a developer editing code.
 *
 * The app reads these over the REST API (same shape as the blog), so a
 * published job appears on /jobs immediately. Each job also gets a real
 * WordPress URL under /jobs/<slug>, which means Rank Math writes its
 * SEO tags and the sitemap lists it — the theme renders the app shell
 * for that URL and the React route draws the design.
 */

defined( 'ABSPATH' ) || exit;

const SALESUP_JOB_TYPE = 'salesup_job';

/** meta key => [label, kind] — kind: text | textarea | list | select */
function salesup_job_fields() {
	return array(
		'su_track'              => array( 'المسار', 'select' ),
		'su_title_en'           => array( 'المسمى بالإنجليزي (Job title in English)', 'text' ),
		'su_category_ar'        => array( 'التصنيف (عربي)', 'text' ),
		'su_category_en'        => array( 'التصنيف (إنجليزي)', 'text' ),
		'su_location_ar'        => array( 'الموقع (عربي)', 'text' ),
		'su_location_en'        => array( 'الموقع (إنجليزي)', 'text' ),
		'su_type_ar'            => array( 'نوع الدوام (عربي)', 'text' ),
		'su_type_en'            => array( 'نوع الدوام (إنجليزي)', 'text' ),
		'su_experience_ar'      => array( 'الخبرة (عربي)', 'text' ),
		'su_experience_en'      => array( 'الخبرة (إنجليزي)', 'text' ),
		'su_education_ar'       => array( 'المؤهل (عربي)', 'text' ),
		'su_education_en'       => array( 'المؤهل (إنجليزي)', 'text' ),
		'su_summary_ar'         => array( 'الدور الوظيفي (عربي)', 'textarea' ),
		'su_summary_en'         => array( 'الدور الوظيفي (إنجليزي)', 'textarea' ),
		'su_responsibilities_ar' => array( 'المهام والمسؤوليات (عربي) — مهمة في كل سطر', 'list' ),
		'su_responsibilities_en' => array( 'المهام والمسؤوليات (إنجليزي) — one per line', 'list' ),
		'su_skills_ar'          => array( 'المهارات المطلوبة (عربي) — مهارة في كل سطر', 'list' ),
		'su_skills_en'          => array( 'المهارات المطلوبة (إنجليزي) — one per line', 'list' ),
	);
}

add_action( 'init', function () {
	register_post_type( SALESUP_JOB_TYPE, array(
		'labels'       => array(
			'name'               => 'الوظائف',
			'singular_name'      => 'وظيفة',
			'add_new'            => 'إضافة وظيفة',
			'add_new_item'       => 'إضافة وظيفة جديدة',
			'edit_item'          => 'تعديل الوظيفة',
			'new_item'           => 'وظيفة جديدة',
			'view_item'          => 'عرض الوظيفة',
			'search_items'       => 'بحث في الوظائف',
			'not_found'          => 'لا توجد وظائف',
			'not_found_in_trash' => 'لا توجد وظائف في المهملات',
			'menu_name'          => 'الوظائف',
		),
		/* public so each job has a real URL, sitemap entry and Rank Math
		   tags; the theme renders the app shell and React draws it */
		'public'       => true,
		'has_archive'  => false,
		'menu_icon'    => 'dashicons-businessperson',
		'menu_position' => 22,
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
		'rewrite'      => array( 'slug' => 'jobs', 'with_front' => false ),
		'show_in_rest' => true,
		'rest_base'    => 'jobs',
	) );

	/* every field readable/writable over REST so the app can render a
	   job without scraping HTML */
	foreach ( salesup_job_fields() as $key => $_def ) {
		register_post_meta( SALESUP_JOB_TYPE, $key, array(
			'type'          => 'string',
			'single'        => true,
			'show_in_rest'  => true,
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'sanitize_callback' => function ( $value ) {
				return is_string( $value ) ? wp_kses_post( $value ) : '';
			},
		) );
	}
} );

/* ---------- the editor box ---------- */

add_action( 'add_meta_boxes', function () {
	add_meta_box(
		'salesup_job_details',
		'تفاصيل الوظيفة',
		'salesup_job_meta_box',
		SALESUP_JOB_TYPE,
		'normal',
		'high'
	);
} );

function salesup_job_meta_box( $post ) {
	wp_nonce_field( 'salesup_job_save', 'salesup_job_nonce' );
	$fields = salesup_job_fields();
	echo '<style>
		.su-jobs-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin-top:8px}
		.su-jobs-grid label{display:block;font-weight:600;margin-bottom:4px}
		.su-jobs-grid input[type=text],.su-jobs-grid select,.su-jobs-grid textarea{width:100%}
		.su-jobs-grid textarea{min-height:120px}
		.su-jobs-full{grid-column:1 / -1}
		.su-jobs-hint{color:#666;font-weight:400;font-size:12px}
	</style>';
	echo '<p class="su-jobs-hint">عنوان المقالة أعلاه = المسمى الوظيفي بالعربي. تاريخ النشر يظهر تلقائياً في القائمة ("منذ يومين").</p>';
	echo '<div class="su-jobs-grid">';
	foreach ( $fields as $key => $def ) {
		list( $label, $kind ) = $def;
		$value = get_post_meta( $post->ID, $key, true );
		$full  = ( 'textarea' === $kind || 'list' === $kind ) ? ' su-jobs-full' : '';
		echo '<div class="' . esc_attr( trim( $full ) ) . '">';
		echo '<label for="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label>';
		if ( 'select' === $kind ) {
			echo '<select id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">';
			$tracks = array( 'graduates' => 'وظائف — خريجين', 'students' => 'تدريب تعاوني — طلاب' );
			foreach ( $tracks as $val => $text ) {
				echo '<option value="' . esc_attr( $val ) . '"' . selected( $value, $val, false ) . '>' . esc_html( $text ) . '</option>';
			}
			echo '</select>';
		} elseif ( 'textarea' === $kind || 'list' === $kind ) {
			echo '<textarea id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">' . esc_textarea( $value ) . '</textarea>';
		} else {
			echo '<input type="text" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '" />';
		}
		echo '</div>';
	}
	echo '</div>';
}

add_action( 'save_post_' . SALESUP_JOB_TYPE, function ( $post_id ) {
	if ( ! isset( $_POST['salesup_job_nonce'] ) || ! wp_verify_nonce( $_POST['salesup_job_nonce'], 'salesup_job_save' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	foreach ( salesup_job_fields() as $key => $_def ) {
		if ( ! isset( $_POST[ $key ] ) ) {
			continue;
		}
		$raw = wp_unslash( $_POST[ $key ] );
		update_post_meta( $post_id, $key, is_string( $raw ) ? wp_kses_post( $raw ) : '' );
	}
} );

/* admin list columns: track + posted date at a glance */
add_filter( 'manage_' . SALESUP_JOB_TYPE . '_posts_columns', function ( $cols ) {
	$out = array();
	foreach ( $cols as $k => $v ) {
		$out[ $k ] = $v;
		if ( 'title' === $k ) {
			$out['su_track'] = 'المسار';
		}
	}
	return $out;
} );

add_action( 'manage_' . SALESUP_JOB_TYPE . '_posts_custom_column', function ( $col, $post_id ) {
	if ( 'su_track' === $col ) {
		$t = get_post_meta( $post_id, 'su_track', true );
		echo esc_html( 'students' === $t ? 'تدريب تعاوني' : 'وظائف' );
	}
}, 10, 2 );
