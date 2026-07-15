import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

export type SelectOption = { value: string; label: string }

/*
 * Design-system dropdown for ALL forms (replaces native <select>, whose
 * options list uses unstylable browser chrome). Trigger looks like a
 * `.field`; the list is a glass panel with brand hover/selected states.
 * Keyboard: arrows navigate, Enter/Space select, Escape closes, Tab
 * closes and moves on. A visually-hidden required input carries the
 * value for form submission and native validation.
 */
export function Select({
  name,
  options,
  placeholder,
  ariaLabel,
  required = false,
  defaultValue = '',
}: {
  name: string
  options: SelectOption[]
  placeholder: string
  ariaLabel: string
  required?: boolean
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const openList = () => {
    setOpen(true)
    setHi(Math.max(0, options.findIndex((o) => o.value === value)))
  }
  const choose = (v: string) => {
    setValue(v)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (open) setHi((h) => Math.min(options.length - 1, h + 1))
        else openList()
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) setHi((h) => Math.max(0, h - 1))
        else openList()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open && hi >= 0) choose(options[hi].value)
        else openList()
        break
      case 'Escape':
        setOpen(false)
        break
      case 'Home':
        if (open) {
          e.preventDefault()
          setHi(0)
        }
        break
      case 'End':
        if (open) {
          e.preventDefault()
          setHi(options.length - 1)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className={`su-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className={`field su-select-trigger${selected ? '' : ' is-placeholder'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="su-select-label">{selected ? selected.label : placeholder}</span>
        <svg className="su-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul className="su-select-list" role="listbox" id={listId} aria-label={ariaLabel}>
        {options.map((o, i) => (
          <li
            key={o.value}
            role="option"
            aria-selected={o.value === value}
            className={`su-select-option${i === hi ? ' is-hi' : ''}${o.value === value ? ' is-selected' : ''}`}
            onPointerEnter={() => setHi(i)}
            onClick={() => choose(o.value)}
          >
            <span>{o.label}</span>
            {o.value === value ? (
              <svg className="su-select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 13 4 4 10-10" />
              </svg>
            ) : null}
          </li>
        ))}
      </ul>
      {/* value carrier: visually hidden, keeps native `required` validation */}
      <input
        className="su-select-value"
        type="text"
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        onChange={() => {}}
      />
    </div>
  )
}
