import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getPage, getFields } from '@/lib/payload'
import { RenderBlocks } from '@/components/sections/RenderBlocks'
import { EnquirySection } from '@/components/EnquirySection'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

// ISR: serve a cached homepage and refresh it at most every 5 minutes, so admin
// edits appear without a redeploy while pages stay fast.
export const revalidate = 300

// Per-locale metadata with hreflang alternates (PRD R1.4 / §7 SEO).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const page = await getPage('home', locale)
  const meta = (page?.meta || {}) as { title?: string | null; description?: string | null }
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]))
  return {
    title: meta.title || undefined,
    description: meta.description || undefined,
    alternates: { canonical: `/${locale}`, languages },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [page, fields] = await Promise.all([getPage('home', locale), getFields(locale)])

  return (
    <>
      <RenderBlocks blocks={page?.layout} />
      <EnquirySection
        locale={locale}
        fields={fields.map((f) => ({ id: String(f.id), title: f.title as string }))}
      />
    </>
  )
}
