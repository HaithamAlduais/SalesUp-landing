import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'

/*
 * The site's icon language (client, Sep 2026): thin line glyphs stroked
 * with the consultation CTA's gradient — the same treatment as the
 * platform page's feature icons. Replaces the old 3D icon renders.
 *
 * The gradient sits in the glyph's own 24×24 user space: with the
 * default bounding-box units a perfectly straight segment has a
 * zero-width box and would not paint at all.
 */
export function BrandIcon({
  icon: Glyph,
  className,
  strokeWidth = 1.6,
}: {
  icon: LucideIcon
  className?: string
  strokeWidth?: number
}) {
  const id = `brand-icon-${useId().replace(/[^\w-]/g, '')}`
  return (
    <Glyph
      className={className ? `brand-icon ${className}` : 'brand-icon'}
      color={`url(#${id})`}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#076c61" />
          <stop offset="0.55" stopColor="#0b9e79" />
          <stop offset="1" stopColor="#31c795" />
        </linearGradient>
      </defs>
    </Glyph>
  )
}
