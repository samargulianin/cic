import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui'
import { EnquiryForm } from '@/components/EnquiryForm'
import { contact, whatsappLink, telLink, mailLink } from '@/lib/contact'
import type { Locale } from '@/i18n/routing'

// Enquiry section — form + prominent alternative contact channels (PRD R3.4).
export async function EnquirySection({
  locale,
  fields,
  program,
}: {
  locale: Locale
  fields: { id: string; title: string }[]
  program?: { slug: string; title: string }
}) {
  const t = await getTranslations('enquiry')
  const channels = [
    contact.whatsapp && { label: t('whatsapp'), href: whatsappLink(t('whatsappPrefill')) },
    contact.phone && { label: t('phoneCall'), href: telLink() },
    contact.email && { label: t('emailContact'), href: mailLink() },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <section id="enquire" className="scroll-mt-20 bg-paper py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {t('title')}
          </h2>
          <p className="max-w-md text-muted">{t('subtitle')}</p>
          {channels.length ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{t('orReachUs')}</p>
              <ul className="flex flex-wrap gap-3">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-red-500 hover:text-red-600"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8">
          <EnquiryForm locale={locale} fields={fields} program={program} />
        </div>
      </Container>
    </section>
  )
}
