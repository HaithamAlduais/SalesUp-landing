/**
 * Read-only SalesUp materials list, preserving the product's FileListCard,
 * MaterialRow and FactsLine hierarchy and classes.
 * Source: apps/web/components/modules/products/materials/materials-tab.tsx
 * fileSize: apps/web/components/shared/creatives-rail.tsx
 *
 * Only supplied sample rows cross this boundary. Authoring, selection, drag,
 * upload, signed URL fetching and mutation menus do not belong in a preview.
 */
import { Fragment } from 'react'
import { FileText, Image as ImageIcon, Package, ScrollText, Video } from 'lucide-react'
import { Bidi } from './primitives'
import { p, useUiPrefs, type ProductLocale } from './locale'
import { cn } from './utils'

export interface MaterialFile {
  id: string
  fileName: string
  kind: string
  sizeBytes?: number | null
  durationSeconds?: number | null
  pageCount?: number | null
  /** Supply only a real public asset URL. No URL renders a read-only name. */
  href?: string
}

function kindIcon(kind: string) {
  if (kind === 'video') return Video
  if (kind === 'image') return ImageIcon
  if (kind === 'archive') return Package
  if (kind === 'text') return ScrollText
  return FileText
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function factsParts(locale: ProductLocale, file: MaterialFile): string[] {
  const bits: string[] = [file.kind === 'text' ? p(locale, 'script', 'نص') : file.kind]
  if (file.sizeBytes) bits.push(fileSize(file.sizeBytes))
  if (file.durationSeconds && Number.isFinite(file.durationSeconds)) {
    const mins = Math.floor(file.durationSeconds / 60)
    const secs = Math.round(file.durationSeconds % 60)
    bits.push(`${mins}:${String(secs).padStart(2, '0')}`)
  } else if (file.pageCount) {
    bits.push(p(locale, `${file.pageCount} pages`, `${file.pageCount} صفحة`))
  } else if (file.kind === 'video' || file.kind === 'pdf') {
    bits.push(p(locale, 'no length recorded', 'ما فيه طول مسجّل'))
  }
  return bits
}

function FactsLine({ locale, file }: { locale: ProductLocale; file: MaterialFile }) {
  return (
    <span className="truncate text-[0.72rem] text-muted-foreground">
      {factsParts(locale, file).map((part, i) => (
        <Fragment key={part + i}>
          {i > 0 ? <span aria-hidden> · </span> : null}
          <Bidi>{part}</Bidi>
        </Fragment>
      ))}
    </span>
  )
}

export function MaterialRow({ file, locale: suppliedLocale }: {
  file: MaterialFile
  locale?: ProductLocale
}) {
  const { locale: contextLocale } = useUiPrefs()
  const locale = suppliedLocale ?? contextLocale
  const Icon = kindIcon(file.kind)
  const href = file.href && /^(?:https?:\/\/|\/(?!\/))/.test(file.href) ? file.href : undefined

  return (
    <li className="flex min-w-0 flex-col gap-1.5 border-b py-2 last:border-b-0" data-creative-row={file.id}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-start text-[0.78rem] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bidi>{file.fileName}</Bidi>
            </a>
          ) : (
            <span className="truncate text-start text-[0.78rem]"><Bidi>{file.fileName}</Bidi></span>
          )}
          <FactsLine locale={locale} file={file} />
        </div>
      </div>
    </li>
  )
}

export function MaterialsCard({ files, className, locale }: {
  files: readonly MaterialFile[]
  className?: string
  locale?: ProductLocale
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5 rounded-xl border p-3', className)} data-file-list>
      {/* Source deliberately has no repeated list title or file count. */}
      {files.length === 0 ? null : (
        <ul className="flex min-w-0 flex-col">
          {files.map(file => <MaterialRow file={file} locale={locale} key={file.id} />)}
        </ul>
      )}
    </div>
  )
}
