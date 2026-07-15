import { useEffect, useRef, useState } from 'react'
import { useLang } from './i18n'

/* Count-up number: animates 0 → target when scrolled into view */
export function CountUp({
  target,
  format = false,
  duration = 3600,
}: {
  target: number
  format?: boolean
  duration?: number
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return
        started.current = true
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setValue(Math.round(target * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{format ? value.toLocaleString('en-US') : String(value)}</span>
}

export type Bi = { ar: string; en: string }

/* interim body for screens whose session hasn't run yet; localizes its
   bilingual props internally (it renders inside the shell's provider) */
export function PagePlaceholder({ eyebrow, title, desc }: { eyebrow: Bi; title: Bi; desc: Bi }) {
  const { L } = useLang()
  return (
    <section className="placeholder-section">
      <div className="section-heading">
        <p className="eyebrow">{L(eyebrow.ar, eyebrow.en)}</p>
        <div className="heading-group">
          <h2>{L(title.ar, title.en)}</h2>
          <p className="heading-desc">{L(desc.ar, desc.en)}</p>
        </div>
      </div>
      <div className="center-action">
        <a className="button button--dark" href="/">{L('العودة للرئيسية', 'Back to Home')}</a>
      </div>
    </section>
  )
}
