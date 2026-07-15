import { PageShell } from '../shared/PageShell'
import { usePageTheme } from '../shared/theme'
import { useLang } from '../shared/i18n'
import { HeroFx } from '../components/CardFx'
import starShape from '../assets/star.svg'

/*
 * اضافه المنصه — digital platform "coming soon" page (Figma 5:3414).
 * Figma content: «قريباً» + «العودة للصفحة الرئيسية» button. Elevated
 * with the site's shader atmosphere, an eyebrow, one supporting line
 * and a secondary contact CTA (additions flagged in the handback).
 */
function PlatformBody() {
  const { dark } = usePageTheme()
  const { lang, L } = useLang()
  return (
    <section className="platform-hero">
      <div className="platform-fx" aria-hidden="true">
        <HeroFx dark={dark} />
      </div>
      <img className="platform-star platform-star--a" src={starShape} alt="" aria-hidden="true" />
      <img className="platform-star platform-star--b" src={starShape} alt="" aria-hidden="true" />
      <div className="platform-copy">
        <p className="platform-eyebrow">{L('الحلول الرقمية', 'Digital Solutions')}</p>
        <h1>{L('قريبــاً', 'Coming Soon')}</h1>
        <p className="platform-desc">
          {L(
            'منصة سيلز أب الرقمية قيد التجهيز — حلول تساعدك تقيس وتحسّن أداء مبيعاتك',
            'The SalesUp digital platform is in the works — tools that help you measure and improve your sales performance'
          )}
        </p>
        <div className="platform-actions">
          <a className="button button--dark" href="/">
            {L('العودة للصفحة الرئيسية', 'Back to the Home Page')}
          </a>
          <a className="platform-ghost" href="/#contact" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {L('تواصل معنا الآن', 'Contact Us Now')}
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default function PlatformPage() {
  return (
    <PageShell active="platform">
      <PlatformBody />
    </PageShell>
  )
}
