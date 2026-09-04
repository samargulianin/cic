'use client'

import { useState } from 'react'
import { ButtonLink } from '@/components/ui'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type NavItem = { label?: string | null; href?: string | null }

// Mobile / tablet navigation — a hamburger that opens a full-width panel with
// the nav links, language switcher and Enquire CTA. Hidden from lg upwards,
// where the inline desktop nav takes over.
export function MobileNav({ nav, ctaLabel }: { nav: NavItem[]; ctaLabel: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-20 z-40 cursor-default bg-navy-900/20"
          />
          <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-white shadow-lg">
            <nav className="flex flex-col gap-1 p-4">
              {nav.map((item, i) => (
                <a
                  key={i}
                  href={item.href || '#'}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-navy-900 transition-colors hover:bg-navy-900/5"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-4">
                <LanguageSwitcher />
                <ButtonLink
                  href="#enquire"
                  className="flex-1 justify-center"
                  source="mobile-menu-cta"
                >
                  {ctaLabel}
                </ButtonLink>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  )
}
