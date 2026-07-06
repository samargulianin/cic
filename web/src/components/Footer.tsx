import Image from 'next/image'
import { Container } from '@/components/ui'
import { getFooter } from '@/lib/payload'
import type { Locale } from '@/i18n/routing'

type Column = {
  title?: string | null
  links?: { label?: string | null; href?: string | null }[] | null
}
type Social = { platform?: string | null; href?: string | null }

// Footer — tagline, multi-column links, accreditation note, social, privacy row.
export async function Footer({ locale }: { locale: Locale }) {
  const footer = await getFooter(locale)
  const columns = (footer?.columns || []) as Column[]
  const social = (footer?.social || []) as Social[]
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-subtle">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/crest.png"
              alt="Cambridge International College"
              width={200}
              height={190}
              className="h-14 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-navy-900">
                Cambridge
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                International College
              </span>
            </div>
          </div>
          {footer?.tagline ? <p className="max-w-xs text-sm text-muted">{footer.tagline}</p> : null}
          {social.length ? (
            <ul className="flex flex-wrap gap-3 text-sm font-medium text-muted">
              {social.map((s, i) => (
                <li key={i}>
                  <a href={s.href || '#'} className="capitalize hover:text-red-600">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-3">
            <p className="text-sm font-bold">{col.title}</p>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              {(col.links || []).map((l, j) => (
                <li key={j}>
                  <a href={l.href || '#'} className="hover:text-red-600">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          {footer?.accreditationNote ? <p className="max-w-2xl">{footer.accreditationNote}</p> : <span />}
          <p>© {year} One World. Cambridge International College.</p>
        </Container>
      </div>
    </footer>
  )
}
