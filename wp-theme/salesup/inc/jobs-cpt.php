<?php
/**
 * الوظائف — a "job" post type so the team opens and closes roles from
 * wp-admin instead of a developer editing code.
 *
 * The editor mirrors the Figma job page one-for-one (frame 208:838):
 * every field below is something that frame actually renders, in the
 * order it appears there, using its own example values as placeholders.
 * Nothing extra is asked for. The posted date ("أمس") and the "جديد"
 * badge are derived from the publish date, so they are not fields.
 *
 * Each job also gets a real WordPress URL under /jobs/<slug>, which
 * means Rank Math writes its SEO tags and the sitemap lists it — the
 * theme serves the app shell and the React route draws the design.
 */

defined( 'ABSPATH' ) || exit;

const SALESUP_JOB_TYPE = 'salesup_job';

/**
 * Field groups, mirroring the Figma page top-to-bottom.
 * kind: select | text | textarea | list
 */
function salesup_job_groups() {
	return array(
		array(
			'title'  => 'أساسيات الوظيفة',
			'note'   => 'تظهر في أعلى صفحة الوظيفة (الشارات والبيانات السريعة).',
			'fields' => array(
				'su_track'         => array( 'المسار', 'select', '' ),
				'su_category_ar'   => array( 'التصنيف', 'text', 'التسويق' ),
				'su_location_ar'   => array( 'الموقع', 'text', 'الرياض' ),
				'su_type_ar'       => array( 'نوع الدوام', 'text', 'دوام كامل' ),
				'su_experience_ar' => array( 'الخبرة', 'text', '+3 خبرة' ),
				'su_education_ar'  => array( 'المؤهل', 'text', 'بكالوريوس' ),
				'su_title_en'      => array( 'المسمى بالإنجليزي', 'text', 'Marketing Specialist' ),
			),
		),
		array(
			'title'  => 'محتوى الوظيفة',
			'note'   => 'نفس أقسام التصميم: الدور الوظيفي، المهام والمسؤوليات، المهارات المطلوبة.',
			'fields' => array(
				'su_summary_ar'          => array( 'الدور الوظيفي', 'textarea', 'يتولى أخصائي التسويق تخطيط وتنفيذ الأنشطة والحملات التسويقية…' ),
				'su_responsibilities_ar' => array( 'المهام والمسؤوليات — مهمة في كل سطر', 'list', "إعداد وتنفيذ الخطط والحملات التسويقية الرقمية والتقليدية.\nدراسة السوق والمنافسين وتحليل احتياجات وسلوك العملاء." ),
				'su_skills_ar'           => array( 'المهارات المطلوبة — مهارة في كل سطر', 'list', "إدارة الحملات التسويقية\nالتسويق الرقمي\nتحليل السوق" ),
			),
		),
		array(
			'title'  => 'النسخة الإنجليزية (اختيارية)',
			'note'   => 'الموقع ثنائي اللغة. أي حقل تتركه فارغاً هنا يعرض النص العربي كما هو للزائر الإنجليزي.',
			'fields' => array(
				'su_category_en'         => array( 'Category', 'text', 'Marketing' ),
				'su_location_en'         => array( 'Location', 'text', 'Riyadh' ),
				'su_type_en'             => array( 'Employment type', 'text', 'Full-time' ),
				'su_experience_en'       => array( 'Experience', 'text', '3+ years' ),
				'su_education_en'        => array( 'Education', 'text', "Bachelor's" ),
				'su_summary_en'          => array( 'The role', 'textarea', 'The Marketing Specialist plans and runs…' ),
				'su_responsibilities_en' => array( 'Responsibilities — one per line', 'list', "Build and run digital and traditional campaigns.\nStudy the market and competitors." ),
				'su_skills_en'           => array( 'Skills required — one per line', 'list', "Campaign management\nDigital marketing" ),
			),
		),
	);
}

/** flat map of every meta key */
function salesup_job_fields() {
	$out = array();
	foreach ( salesup_job_groups() as $group ) {
		foreach ( $group['fields'] as $key => $def ) {
			$out[ $key ] = $def;
		}
	}
	return $out;
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
		'public'        => true,
		'has_archive'   => false,
		'menu_icon'     => 'dashicons-businessperson',
		'menu_position' => 22,
		/* The design has no free-form body or image — everything a job
		   shows is a field below, so the editor stays focused.
		   'custom-fields' is REQUIRED even though we render our own box:
		   WP_REST_Posts_Controller only adds `meta` to the REST schema
		   for post types that support it, and without it every job would
		   reach the app with empty fields. */
		'supports'      => array( 'title', 'custom-fields' ),
		'rewrite'       => array( 'slug' => 'jobs', 'with_front' => false ),
		'show_in_rest'  => true,
		'rest_base'     => 'jobs',
	) );

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
				return is_string( $value ) ? sanitize_textarea_field( $value ) : '';
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
	/* 'custom-fields' support (needed for REST) also prints WordPress's
	   raw key/value box — our own box above is the editing surface */
	remove_meta_box( 'postcustom', SALESUP_JOB_TYPE, 'normal' );
} );

function salesup_job_meta_box( $post ) {
	wp_nonce_field( 'salesup_job_save', 'salesup_job_nonce' );
	?>
	<style>
		.su-jobs-group{border:1px solid #dcdcde;border-radius:6px;padding:14px 16px;margin:14px 0;background:#fff}
		.su-jobs-group > h3{margin:0 0 2px;font-size:14px}
		.su-jobs-note{color:#666;font-size:12px;margin:0 0 12px}
		.su-jobs-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px}
		.su-jobs-grid label{display:block;font-weight:600;margin-bottom:4px}
		.su-jobs-grid input[type=text],.su-jobs-grid select,.su-jobs-grid textarea{width:100%}
		.su-jobs-grid textarea{min-height:110px;line-height:1.8}
		.su-jobs-full{grid-column:1 / -1}
		.su-jobs-top{background:#f6f7f7;border-inline-start:4px solid #2271b1;padding:10px 14px;margin-bottom:4px}
		.su-jobs-top p{margin:4px 0}
	</style>
	<div class="su-jobs-top">
		<p><strong>العنوان في الأعلى = المسمى الوظيفي بالعربي</strong> (مثال: أخصائي تسويق).</p>
		<p>تاريخ النشر يظهر تلقائياً في القائمة («أمس»، «منذ يومين»)، وشارة <strong>«جديد»</strong> تظهر تلقائياً أول ١٤ يوم.</p>
		<p>لإخفاء وظيفة: غيّر حالتها إلى <strong>مسودة</strong>، أو انقلها إلى <strong>المهملات</strong> — تختفي من الموقع فوراً.</p>
	</div>
	<?php
	foreach ( salesup_job_groups() as $group ) {
		echo '<div class="su-jobs-group">';
		echo '<h3>' . esc_html( $group['title'] ) . '</h3>';
		echo '<p class="su-jobs-note">' . esc_html( $group['note'] ) . '</p>';
		echo '<div class="su-jobs-grid">';
		foreach ( $group['fields'] as $key => $def ) {
			list( $label, $kind, $placeholder ) = $def;
			$value = get_post_meta( $post->ID, $key, true );
			$full  = ( 'textarea' === $kind || 'list' === $kind ) ? ' class="su-jobs-full"' : '';
			echo '<div' . $full . '>';
			echo '<label for="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label>';
			if ( 'select' === $kind ) {
				echo '<select id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">';
				$tracks = array(
					'graduates' => 'وظائف — للخريجين',
					'students'  => 'تدريب تعاوني — للطلاب',
				);
				foreach ( $tracks as $val => $text ) {
					echo '<option value="' . esc_attr( $val ) . '"' . selected( $value, $val, false ) . '>' . esc_html( $text ) . '</option>';
				}
				echo '</select>';
			} elseif ( 'textarea' === $kind || 'list' === $kind ) {
				echo '<textarea id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" placeholder="' . esc_attr( $placeholder ) . '">' . esc_textarea( $value ) . '</textarea>';
			} else {
				echo '<input type="text" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '" placeholder="' . esc_attr( $placeholder ) . '" />';
			}
			echo '</div>';
		}
		echo '</div></div>';
	}
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
		update_post_meta( $post_id, $key, is_string( $raw ) ? sanitize_textarea_field( $raw ) : '' );
	}
} );

/* admin list: track + the same relative date the site shows */
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
