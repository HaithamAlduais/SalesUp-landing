import { useLang } from './i18n'
import { usePageTheme } from './theme'
import { MegaLogoFx } from '../components/CardFx'
import logoFooter from '../assets/logo-footer.png'
import logoFooterDark from '../assets/logo-footer-dark.png'
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

export function Footer() {
  const { L } = useLang()
  const { dark } = usePageTheme()

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
            <div className="footer-brand-logo">
              <img className="logo-on-light" src={logoFooter} alt="SalesUp" />
              <img className="logo-on-dark" src={logoFooterDark} alt="SalesUp" />
            </div>
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
              <p>{L('حي الصحافة – الرياض', 'As Sahafah District – Riyadh')}</p>
              <p>{L('المملكة العربية السعودية', 'Saudi Arabia')}</p>
            </div>
            <div className="footer-block">
              <a className="footer-link" href="mailto:hi@salesup.sa">hi@salesup.sa</a>
              <a className="footer-link" href="tel:+966538136228" dir="ltr">+966 53 813 6228</a>
            </div>
          </div>

          <nav className="footer-col" aria-label={L('اكتشف', 'Discover')}>
            <p className="footer-head">{L('اكتشف', 'Discover')}</p>
            <a className="footer-link" href="/marketers">Marketers</a>
            <a className="footer-link" href="/platform">{L('الحلول الرقمية', 'Digital Solutions')}</a>
            <a className="footer-link" href="/jobs">{L('الوظائف', 'Careers')}</a>
            <a className="footer-link" href="/#contact">{L('استشارة مجانية', 'Free Consultation')}</a>
          </nav>
        </div>

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
      </div>

      {/* giant living-glass wordmark */}
      <div className="footer-mega" aria-hidden="true">
        <div className="footer-mega-fx">
          <MegaLogoFx dark={dark} />
        </div>
      </div>
    </footer>
  )
}
