import { getTranslations } from 'next-intl/server'
import { Container, ButtonLink } from '@/components/ui'

type CTABannerProps = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  ctaLabel?: string | null
}

// Closing gradient CTA banner driving the enquiry (reference footer-CTA).
export async function CTABanner(props: CTABannerProps) {
  const t = await getTranslations('common')
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="bg-hero relative overflow-hidden rounded-2xl px-8 py-14 text-center text-white sm:px-16">
          {props.eyebrow ? (
            <p className="text-xs font-semibold tracking-wide uppercase opacity-80">{props.eyebrow}</p>
          ) : null}
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-balance sm:text-4xl">
            {props.heading}
          </h2>
          {props.subheading ? (
            <p className="mx-auto mt-4 max-w-xl text-white/85">{props.subheading}</p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <ButtonLink href="#enquire" variant="light" source="cta-banner">
              {props.ctaLabel || t('enquire')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
