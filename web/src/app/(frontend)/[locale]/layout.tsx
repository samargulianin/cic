import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Noto_Sans_Georgian } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Analytics } from '@/components/Analytics'
import '../globals.css'

// Single sans — display + body. Full Georgian (Mkhedruli) + Latin coverage.
const notoSans = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-georgian',
  display: 'swap',
})

const SITE_DESCRIPTION =
  'British accredited distance-learning diplomas in Georgia. CIC Georgia — official representative of Cambridge International College since 1935.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: { default: 'CIC Georgia — Cambridge International College', template: '%s — CIC Georgia' },
  description: SITE_DESCRIPTION,
  // Rich preview when links are shared (Facebook, WhatsApp, LinkedIn, etc.).
  openGraph: {
    type: 'website',
    siteName: 'CIC Georgia',
    title: 'CIC Georgia — Cambridge International College',
    description: SITE_DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CIC Georgia — Cambridge International College' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIC Georgia — Cambridge International College',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()

  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'CIC Georgia',
    alternateName: 'Cambridge International College Georgia',
    url: base,
    logo: `${base}/brand/cic-affiliate.png`,
    description: SITE_DESCRIPTION,
    foundingDate: '1935',
    sameAs: ['https://www.facebook.com/CICbyOneWorld/'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+995 593 11 69 46',
      email: 'info@cicgeorgia.ge',
      contactType: 'admissions',
      areaServed: 'GE',
      availableLanguage: ['ka', 'en'],
    },
  }

  return (
    <html lang={locale} className={notoSans.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
