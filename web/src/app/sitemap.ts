import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getPrograms } from '@/lib/payload'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Per-locale URLs with hreflang alternates (PRD §7 SEO): the homepage plus every
// programme detail page, in both languages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeLanguages = Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}`]))

  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: new Date(),
    alternates: { languages: homeLanguages },
  }))

  let programs: MetadataRoute.Sitemap = []
  try {
    const docs = await getPrograms()
    programs = docs.flatMap((p) => {
      const slug = p.slug as string
      const languages = Object.fromEntries(
        routing.locales.map((l) => [l, `${base}/${l}/programs/${slug}`]),
      )
      return routing.locales.map((locale) => ({
        url: `${base}/${locale}/programs/${slug}`,
        lastModified: (p.updatedAt as string) ? new Date(p.updatedAt as string) : new Date(),
        alternates: { languages },
      }))
    })
  } catch {
    // If the DB is briefly unavailable, still return the homepage entries.
  }

  return [...home, ...programs]
}
