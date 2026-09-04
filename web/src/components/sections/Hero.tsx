import { getTranslations } from 'next-intl/server'
import { Container, ButtonLink } from '@/components/ui'

type HeroProps = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  ctaLabel?: string | null
  socialProof?: string | null
  image?: any
  badges?: { label?: string | null }[] | null
}

// Render a heading where text wrapped in *asterisks* is highlighted crimson —
// matches the brand lockup ("170+ *დისტანციური* პროგრამა").
function AccentHeading({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-red-500">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

// Full-bleed brand hero banner (CIC Georgia Facebook-cover design): the navy
// duotone laptop artwork as backdrop, with a live, bilingual lockup in Bézier
// Sans on the left so the design works in both languages.
export async function Hero(props: HeroProps) {
  const t = await getTranslations('common')
  return (
    <section className="bg-hero relative isolate overflow-hidden text-white">
      <Container className="flex min-h-[30rem] flex-col items-start justify-center gap-6 py-16 sm:min-h-[34rem] sm:py-20">
        {props.eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-white/45 px-4 py-1.5 text-sm font-medium tracking-wide text-white/90">
            {props.eyebrow}
          </span>
        ) : null}

        <h1 className="max-w-2xl text-3xl leading-[1.1] font-extrabold tracking-tight text-balance [overflow-wrap:anywhere] sm:text-5xl sm:leading-[1.05] lg:text-6xl">
          <AccentHeading text={props.heading || ''} />
        </h1>

        {(props.subheading || props.badges?.length) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {props.subheading ? (
              <span className="rounded-full border border-white/30 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/85">
                {props.subheading}
              </span>
            ) : null}
            {(props.badges || []).map((b, i) => (
              <span
                key={i}
                className="rounded-full border border-white/30 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/85"
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <ButtonLink href="#enquire" source="hero-cta">
            {props.ctaLabel || t('enquire')}
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="light">
            {t('learnMore')}
          </ButtonLink>
        </div>

        {props.socialProof ? (
          <p className="text-cream max-w-md text-sm font-medium">{props.socialProof}</p>
        ) : null}
      </Container>
    </section>
  )
}
