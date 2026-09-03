import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/routing'

// Cached Payload Local API client for server components (no HTTP round-trip).
export const getPayloadClient = () => getPayload({ config })

// Fetch a page by slug for a locale, with relationships/media populated.
export async function getPage(slug: string, locale: Locale) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
}

export async function getFields(locale: Locale) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'fields',
    locale,
    sort: 'order',
    limit: 100,
    depth: 0,
  })
  return res.docs
}

export async function getPrograms() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'programs', sort: 'order', limit: 300, depth: 0 })
  return res.docs
}

export async function getProgram(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'programs', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return res.docs[0] ?? null
}

export async function getHeader(locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'header', locale, depth: 1 })
}

export async function getFooter(locale: Locale) {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'footer', locale, depth: 1 })
}
