import { Container, SectionHeading } from '@/components/ui'

type Item = { text?: string | null }

type AboutProps = {
  eyebrow?: string | null
  heading?: string | null
  lead?: string | null
  offerings?: { heading?: string | null; items?: Item[] | null } | null
  paragraphs?: Item[] | null
}

// About CIC — the One World → CIC Georgia story, what we offer, and the
// college's British accreditation credentials.
export function About(props: AboutProps) {
  return (
    <section id="about" className="bg-paper scroll-mt-24 py-16 sm:py-24">
      <Container className="flex max-w-4xl flex-col gap-8">
        <SectionHeading eyebrow={props.eyebrow} title={props.heading} align="left" />

        {props.lead ? (
          <p className="text-lg leading-relaxed text-ink">{props.lead}</p>
        ) : null}

        {props.offerings?.items?.length ? (
          <div className="rounded-2xl border border-border bg-white p-7 sm:p-9">
            {props.offerings?.heading ? (
              <h3 className="text-lg font-bold text-navy-900">{props.offerings.heading}</h3>
            ) : null}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {props.offerings.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span aria-hidden className="mt-0.5 font-bold text-red-600">
                    ✓
                  </span>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {props.paragraphs?.length ? (
          <div className="flex flex-col gap-5">
            {props.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted sm:text-base">
                {p.text}
              </p>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  )
}
