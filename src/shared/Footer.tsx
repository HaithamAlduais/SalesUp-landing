import { useLang } from './i18n'
import { usePageTheme } from './theme'
import { MegaLogoFx } from '../components/CardFx'
import social1 from '../assets/social-1.png'
import social2 from '../assets/social-2.png'
import social3 from '../assets/social-3.png'
import social4 from '../assets/social-4.png'
import social5 from '../assets/social-5.png'

const SOCIALS = [
  { src: social1, label: 'Snapchat' },
  { src: social2, label: 'X' },
  { src: social3, label: 'TikTok' },
  { src: social4, label: 'Instagram' },
  { src: social5, label: 'LinkedIn' },
]

/* office location — the pin the client shared. The embed URL needs no
   API key; the wrapper link opens the place page in Google Maps. */
const OFFICE = {
  lat: 24.8224917,
  lng: 46.7907162,
  link: 'https://maps.app.goo.gl/5sCQKCrstpm5miXbA',
}

export function Footer() {
  const { L, lang } = useLang()
  const { dark } = usePageTheme()
  const mapSrc = `https://maps.google.com/maps?q=${OFFICE.lat},${OFFICE.lng}&z=16&hl=${lang}&output=embed`

  return (
    <footer className="site-footer" id="footer">
      <button
        className="to-top"
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={L('العودة إلى الأعلى', 'Back to top')}
        title={L('العودة إلى الأعلى', 'Back to top')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5m0 0-6 6m6-6 6 6" />
        </svg>
      </button>

      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            {/* the living-glass wordmark, brand-logo sized */}
            <div className="footer-logo-fx" role="img" aria-label="SalesUp">
              <div className="footer-logo-fx-inner">
                <MegaLogoFx dark={dark} />
              </div>
            </div>
          </div>

          <nav className="footer-col" aria-label={L('روابط', 'Links')}>
            <p className="footer-head">{L('روابط', 'Links')}</p>
            <a className="footer-link" href="/">{L('الرئيسية', 'Home')}</a>
            <a className="footer-link" href="/#about">{L('من نحن', 'About Us')}</a>
            <a className="footer-link" href="/services">{L('الخدمات', 'Services')}</a>
            <a className="footer-link" href="/#sectors">{L('القطاعات', 'Sectors')}</a>
            <a className="footer-link" href="/#process">{L('ليش سيلز أب؟', 'Why SalesUp?')}</a>
            <a className="footer-link" href="/blog">{L('المدونة', 'Blog')}</a>
          </nav>

          <div className="footer-col">
            <p className="footer-head">{L('تواصل معنا', 'Contact Us')}</p>
            <div className="footer-block">
              <a
                className="footer-link footer-address"
                href={OFFICE.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{L('حي الصحافة – الرياض', 'As Sahafah District – Riyadh')}</span>
                <span>{L('المملكة العربية السعودية', 'Saudi Arabia')}</span>
              </a>
            </div>
            <div className="footer-block">
              <a className="footer-link" href="mailto:hi@salesup.sa">hi@salesup.sa</a>
              <a
                className="footer-link"
                href="https://wa.me/966538136228"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
              >
                +966 53 813 6228
              </a>
            </div>
          </div>

          <nav className="footer-col" aria-label={L('اكتشف', 'Discover')}>
            <p className="footer-head">{L('اكتشف', 'Discover')}</p>
            <a className="footer-link" href="/marketers">{L('التسويق', 'Marketing')}</a>
            <a className="footer-link" href="/platform">{L('الحلول الرقمية', 'Digital Solutions')}</a>
            <a className="footer-link" href="/jobs">{L('الوظائف', 'Careers')}</a>
            <a className="footer-link" href="/#contact">{L('استشارة مجانية', 'Free Consultation')}</a>
          </nav>
        </div>

        {/* office map: the iframe stays interactive (pan/zoom), and the
            overlaid link opens the place in Google Maps. Lazy so the
            embed never costs the initial load on any page. */}
        <section className="footer-map" aria-label={L('موقع المكتب', 'Office location')}>
          <iframe
            className="footer-map-frame"
            src={mapSrc}
            title={L('موقع مكتب سيلز أب على الخريطة', 'SalesUp office location on the map')}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            className="footer-map-cta"
            href={OFFICE.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <span>{L('افتح الموقع في خرائط جوجل', 'Open in Google Maps')}</span>
          </a>
        </section>

        <div className="footer-bottom">
          <p className="copyright">
            {L('كافة الحقوق محفوظة © 2026 لصالح سيلز أب', '© 2026 SalesUp. All rights reserved.')}
          </p>
          <div className="footer-legal">
            <a href="#footer">{L('اتفاقية الخدمة', 'Service Agreement')}</a>
            <span aria-hidden="true">·</span>
            <a href="#footer">{L('سياسة الخصوصية', 'Privacy Policy')}</a>
          </div>
        </div>

        {/* closing block: tagline + socials, centered */}
        <div className="footer-end">
          <p className="footer-tagline">
            {L('تمكين المبيعات ، خطوة بخطوة', 'Sales enablement, step by step')}
          </p>
          <div className="socials" dir="ltr" aria-label={L('حسابات التواصل الاجتماعي', 'Social media accounts')}>
            {SOCIALS.map((s) => (
              <a href="#footer" key={s.label} aria-label={s.label}>
                <img src={s.src} alt="" width={22} height={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
