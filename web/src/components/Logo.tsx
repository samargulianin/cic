import { cn } from '@/components/ui'

// CIC Georgia wordmark (direction C1): navy "CIC", slate "Georgia", crimson accent
// line + affiliate subline. Live text in the brand font — sharp at any size, no image.
// Sits on light grounds (header white, footer bg-subtle).
export function Logo({
  className,
  nameClassName = 'text-[1.4rem] sm:text-2xl',
  subline = true,
  sublineClassName,
}: {
  className?: string
  nameClassName?: string
  subline?: boolean
  sublineClassName?: string
}) {
  return (
    <span className={cn('flex flex-col leading-none', className)}>
      <span className={cn('font-extrabold tracking-tight text-navy-700', nameClassName)}>
        CIC<span className="font-semibold text-navy-500"> Georgia</span>
      </span>
      {subline ? (
        <span className={cn('mt-2 flex items-center gap-2', sublineClassName)}>
          <span className="h-0.5 w-6 shrink-0 rounded-full bg-red-600" aria-hidden />
          <span className="text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Official Affiliate · Cambridge International College
          </span>
        </span>
      ) : null}
    </span>
  )
}
