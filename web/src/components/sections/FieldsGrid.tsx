import { getTranslations } from 'next-intl/server'
import { Container, SectionHeading } from '@/components/ui'

type Field = {
  id: string | number
  title?: string | null
  summary?: string | null
  slug?: string | null
}

type FieldsGridProps = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  viewAllLabel?: string | null
  fields?: (Field | string | number)[] | null
}

// Cards with large index numbers + Explore link — the reference's "Services" grid,
// surfacing the professional fields (PRD R2.1).
export async function FieldsGrid(props: FieldsGridProps) {
  const t = await getTranslations('common')
  const fields = (props.fields || []).filter(
    (f): f is Field => typeof f === 'object' && f !== null,
  )

  return (
    <section id="fields" className="scroll-mt-20 bg-paper py-16 sm:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={props.eyebrow}
          title={props.heading}
          description={props.description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field, i) => (
            <article
              key={field.id}
              className="group flex flex-col rounded-xl border border-border bg-white p-7 transition hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-lg"
            >
              <span className="text-3xl font-extrabold text-navy-300 transition group-hover:text-red-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-navy-900">{field.title}</h3>
              {field.summary ? (
                <p className="mt-2 flex-1 text-sm text-muted">{field.summary}</p>
              ) : (
                <div className="flex-1" />
              )}
              <a
                href={`#enquire`}
                data-enquiry-source={field.slug ? `field:${field.slug}` : 'fields-grid'}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:gap-2.5"
              >
                {t('explore')} <span aria-hidden>↗</span>
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
