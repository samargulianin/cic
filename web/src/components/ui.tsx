import * as React from 'react'

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

// Pill eyebrow label — the reference's recurring "tag" element.
export function PillLabel({
  children,
  tone = 'brand',
}: {
  children: React.ReactNode
  tone?: 'brand' | 'muted'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase',
        tone === 'brand'
          ? 'border-red-500/30 bg-red-500/8 text-red-600'
          : 'border-border bg-subtle text-muted',
      )}
    >
      {children}
    </span>
  )
}

type ButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'light'
  className?: string
  /** Tags an #enquire CTA so the form records which button opened it. */
  source?: string
}

// Link styled as a button. Cambridge-red primary, navy/outline alternatives.
export function ButtonLink({ href, children, variant = 'primary', className, source }: ButtonProps) {
  const styles = {
    primary: 'bg-red-cta text-white shadow-sm hover:brightness-110',
    ghost: 'border border-navy-800/25 bg-white/0 text-ink hover:border-red-500 hover:text-red-600',
    light: 'bg-white text-navy-900 hover:bg-navy-50',
  }[variant]
  return (
    <a
      href={href}
      data-enquiry-source={source}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500',
        styles,
        className,
      )}
    >
      {children}
    </a>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  align?: 'center' | 'left'
}) {
  return (
    <div className={cn('flex flex-col gap-4', align === 'center' ? 'items-center text-center' : 'items-start')}>
      {eyebrow ? <PillLabel tone="muted">{eyebrow}</PillLabel> : null}
      {title ? (
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {description ? <p className="max-w-2xl text-base text-muted">{description}</p> : null}
    </div>
  )
}
