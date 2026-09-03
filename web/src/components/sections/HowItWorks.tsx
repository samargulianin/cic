import { Container, SectionHeading } from '@/components/ui'

type Item = { text?: string | null }

type HowItWorksProps = {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  formats?:
    | { name?: string | null; tag?: string | null; description?: string | null; programs?: string | null }[]
    | null
  examNote?: { heading?: string | null; body?: string | null } | null
  facts?: Item[] | null
  process?: { title?: string | null; duration?: string | null; text?: string | null }[] | null
  included?: { heading?: string | null; items?: Item[] | null } | null
  footnote?: string | null
}

// The full distance-learning story: two formats, remote-exam rules, key facts,
// the step-by-step process, and what the fee covers.
export function HowItWorks(props: HowItWorksProps) {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-14">
        {(props.eyebrow || props.heading || props.intro) && (
          <SectionHeading eyebrow={props.eyebrow} title={props.heading} description={props.intro} />
        )}

        {/* Two study formats */}
        {props.formats?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {props.formats.map((f, i) => (
              <article key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-paper p-7">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-navy-900">{f.name}</h3>
                  {f.tag ? (
                    <span className="bg-red-cta rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                      {f.tag}
                    </span>
                  ) : null}
                </div>
                {f.description ? <p className="text-sm text-muted">{f.description}</p> : null}
                {f.programs ? (
                  <p className="mt-auto rounded-lg bg-subtle px-4 py-3 text-sm text-ink">{f.programs}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {/* Cambridge's new remote-exam rules */}
        {props.examNote?.heading || props.examNote?.body ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-7 sm:p-9">
            {props.examNote?.heading ? (
              <h3 className="text-lg font-bold text-navy-900">🔐 {props.examNote.heading}</h3>
            ) : null}
            {props.examNote?.body ? (
              <p className="mt-2 text-sm text-muted sm:text-base">{props.examNote.body}</p>
            ) : null}
          </div>
        ) : null}

        {/* Key facts */}
        {props.facts?.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.facts.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-paper px-4 py-3 text-sm"
              >
                <span aria-hidden className="mt-0.5 font-bold text-red-600">
                  ✓
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Step-by-step process */}
        {props.process?.length ? (
          <ol className="flex flex-col gap-3">
            {props.process.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-xl border border-border bg-paper p-5">
                <span className="bg-red-cta flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">{step.title}</p>
                    {step.text ? <p className="mt-1 text-sm text-muted">{step.text}</p> : null}
                  </div>
                  {step.duration ? (
                    <span className="shrink-0 rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-muted">
                      {step.duration}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        {/* What the fee includes */}
        {props.included?.items?.length ? (
          <div className="rounded-2xl border border-border bg-paper p-7 sm:p-9">
            {props.included?.heading ? (
              <h3 className="text-lg font-bold text-navy-900">{props.included.heading}</h3>
            ) : null}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {props.included.items.map((it, i) => (
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

        {props.footnote ? (
          <p className="text-center text-sm font-medium text-muted">{props.footnote}</p>
        ) : null}
      </Container>
    </section>
  )
}
