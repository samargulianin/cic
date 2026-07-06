import { getTranslations } from 'next-intl/server'
import { Container, ButtonLink } from '@/components/ui'
import { MediaImage } from '@/components/MediaImage'

type HeroProps = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  ctaLabel?: string | null
  socialProof?: string | null
  image?: any
  badges?: { label?: string | null }[] | null
}

// Render a heading where text wrapped in *asterisks* is highlighted brick-red —
// matches the brand lockup ("170+ *დისტანციური* პროგრამა").
function AccentHeading({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-red-600">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

// Indigo hero with red accent word + outlined "CIC Georgia" pill (referance3 /
// Facebook cover from the brand guidelines).
export async function Hero(props: HeroProps) {
  const t = await getTranslations('common')
  return (
    <section className="bg-hero relative overflow-hidden text-white">
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10">
        <div className="flex min-w-0 flex-col items-start gap-6">
          {props.eyebrow ? (
            <span className="inline-flex items-center rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium tracking-wide text-white/90">
              {props.eyebrow}
            </span>
          ) : null}
          <h1 className="text-4xl font-extrabold tracking-tight text-balance [overflow-wrap:anywhere] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]">
            <AccentHeading text={props.heading || ''} />
          </h1>
          {props.subheading ? (
            <p className="max-w-md text-base font-medium tracking-wide text-white/70">
              {props.subheading}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <ButtonLink href="#enquire" source="hero-cta">{props.ctaLabel || t('enquire')}</ButtonLink>
            <ButtonLink href="#how-it-works" variant="light">
              {t('learnMore')}
            </ButtonLink>
          </div>
          {props.socialProof ? (
            <p className="text-sm font-medium text-cream">{props.socialProof}</p>
          ) : null}
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <MediaImage
              media={props.image}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-cover"
            />
            {!props.image ? (
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-navy-500 to-navy-900" aria-hidden />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
          </div>
          {/* Floating accreditation badges. */}
          <div className="absolute -bottom-3 left-4 flex flex-wrap gap-2">
            {(props.badges || []).map((b, i) => (
              <span
                key={i}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 shadow-md"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
