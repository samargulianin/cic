'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/components/ui'

type Item = { slug: string; title: string; online?: boolean }
type Group = { field: string; items: Item[] }
type Level = {
  key: string
  name: string
  tag?: string
  meta?: string
  description?: string
  count: number
  groups: Group[]
}
type InfoChip = {
  label: string
  title: string
  intro: string
  categories: { name: string; note?: string }[]
  ilm: string
  consult: string
}

// Selectable level tabs + a final "other qualifications" info tab.
export function ProgramsTabs({
  levels,
  info,
  enquireLabel,
}: {
  levels: Level[]
  info: InfoChip
  enquireLabel: string
}) {
  const [active, setActive] = useState(levels[0]?.key)
  const current = levels.find((l) => l.key === active)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setActive(l.key)}
            aria-pressed={l.key === active}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition',
              l.key === active
                ? 'bg-navy-700 border-navy-700 text-white'
                : 'border-border hover:border-navy-500 bg-white text-navy-900',
            )}
          >
            {l.name} <span className="opacity-70">· {l.count}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActive('info')}
          aria-pressed={active === 'info'}
          className={cn(
            'rounded-full border px-4 py-2 text-sm font-semibold transition',
            active === 'info'
              ? 'bg-navy-700 border-navy-700 text-white'
              : 'border-border hover:border-navy-500 bg-white text-navy-900',
          )}
        >
          {info.label}
        </button>
      </div>

      {current ? (
        <div className="rounded-2xl border border-border bg-paper p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-border pb-4">
            <h3 className="text-xl font-bold text-navy-900">{current.name}</h3>
            {current.tag ? (
              <span className="bg-navy-700 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                {current.tag}
              </span>
            ) : null}
            {current.meta ? <span className="text-sm font-medium text-muted">{current.meta}</span> : null}
          </div>

          {current.description ? (
            <p className="mt-4 max-w-3xl text-sm text-muted">{current.description}</p>
          ) : null}

          <div className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {current.groups.map((g, j) => (
              <div key={j}>
                <p className="text-xs font-bold tracking-wide text-red-600 uppercase">{g.field}</p>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {g.items.map((it) => (
                    <li key={it.slug} className="leading-snug">
                      <Link
                        href={`/programs/${it.slug}`}
                        className="hover:text-red-600 text-sm text-ink hover:underline"
                      >
                        {it.title}
                      </Link>
                      {it.online ? (
                        <span className="text-navy-700 ml-1.5 inline-block rounded bg-navy-700/10 px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-wide uppercase">
                          online
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-paper p-6 sm:p-8">
          <h3 className="text-xl font-bold text-navy-900">{info.title}</h3>
          <p className="mt-4 max-w-3xl text-sm text-muted sm:text-base">{info.intro}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {info.categories.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span aria-hidden className="mt-0.5 font-bold text-red-600">
                  ✓
                </span>
                <span className="text-ink">
                  {c.name}
                  {c.note ? <span className="text-muted"> — {c.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-3xl text-sm text-muted sm:text-base">{info.ilm}</p>
          <p className="mt-3 max-w-3xl text-sm font-medium text-navy-900 sm:text-base">{info.consult}</p>
          <a
            href="#enquire"
            data-enquiry-source="programs-custom"
            className="bg-red-cta mt-6 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            {enquireLabel}
          </a>
        </div>
      )}

      {current ? (
        <div className="flex justify-center">
          <a
            href="#enquire"
            data-enquiry-source="programs"
            className="bg-red-cta inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            {enquireLabel}
          </a>
        </div>
      ) : null}
    </div>
  )
}
