import { useLang } from './i18n'
import logoFooter from '../assets/logo-footer.png'
import logoFooterDark from '../assets/logo-footer-dark.png'
import social1 from '../assets/social-1.png'
import social2 from '../assets/social-2.png'
import social3 from '../assets/social-3.png'
import social4 from '../assets/social-4.png'
import social5 from '../assets/social-5.png'

export function Footer() {
  const { L } = useLang()
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-logo">
              <img className="logo-on-light" src={logoFooter} alt="SalesUp" />
              <img className="logo-on-dark" src={logoFooterDark} alt="SalesUp" />
            </div>
            <p>{L('تمكين المبيعات ، خطوة بخطوة', 'Sales enablement, step by step')}</p>
          </div>
          <div className="footer-col">
            <p className="footer-head">{L('روابط', 'Links')}</p>
            <p><a href="/">{L('الرئيسية', 'Home')}</a></p>
            <p><a href="/#about">{L('من نحن', 'About Us')}</a></p>
            <p><a href="/services">{L('الخدمات', 'Services')}</a></p>
            <p><a href="/#sectors">{L('القطاعات', 'Sectors')}</a></p>
            <p><a href="/#process">{L('ليش سيلز أب؟', 'Why SalesUp?')}</a></p>
            <p><a href="/blog">{L('المدونة', 'Blog')}</a></p>
          </div>
          <div className="footer-col">
            <p className="footer-head">{L('تواصل معنا', 'Contact Us')}</p>
            <div className="footer-block">
              <p>{L('حي الصحافة – الرياض', 'As Sahafah District – Riyadh')}</p>
              <p>{L('المملكة العربية السعودية', 'Saudi Arabia')}</p>
            </div>
            <div className="footer-block">
              <p><a href="mailto:hi@salesup.sa">hi@salesup.sa</a></p>
              <p><a href="tel:+966538136228" dir="ltr">+966 53 813 6228</a></p>
            </div>
          </div>
          <div className="footer-col">
            <p className="footer-head">{L('تعرف أيضا', 'Also See')}</p>
            <p><a href="#footer">{L('اتفاقية الخدمة', 'Service Agreement')}</a></p>
            <p><a href="#footer">{L('سياسة الخصوصية', 'Privacy Policy')}</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">
            {L('كافة الحقوق محفوظة © 2026 لصالح سيلز أب', '© 2026 SalesUp. All rights reserved.')}
          </p>
          <div className="socials" dir="ltr" aria-label={L('حسابات التواصل الاجتماعي', 'Social media accounts')}>
            <a href="#footer"><img src={social1} alt="" width={40} height={40} /></a>
            <a href="#footer"><img src={social2} alt="" width={40} height={40} /></a>
            <a href="#footer"><img src={social3} alt="" width={40} height={40} /></a>
            <a href="#footer"><img src={social4} alt="" width={40} height={40} /></a>
            <a href="#footer"><img src={social5} alt="" width={40} height={40} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
