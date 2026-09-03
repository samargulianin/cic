import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getProgram, getFields } from '@/lib/payload'
import { EnquirySection } from '@/components/EnquirySection'
import { Container } from '@/components/ui'
import { LEVELS, ONLINE_SLUGS } from '@/lib/programCatalogue'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = (await getProgram(slug)) as any
  if (!p) return {}
  return { title: p.title, description: (p.summary as string) || undefined }
}

export default async function ProgramPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const p = (await getProgram(slug)) as any
  if (!p) notFound()

  const ka = locale === 'ka'
  const t = await getTranslations('common')
  const level = LEVELS.find((l) => l.key === p.level)
  const field = ka ? p.fieldKa || p.fieldEn : p.fieldEn
  const fields = await getFields(locale)
  const topics = (p.topics as string | undefined)?.replace(/^summary of major topics:?\s*/i, '').trim()
  const career = (p.career as string | undefined)?.trim()

  // "What's included" — the last two lines vary by qualification level and by
  // study format (online programmes also get private-cabinet access).
  const online = ONLINE_SLUGS.has(p.slug)
  const qual =
    p.level === 'mastery'
      ? ka
        ? 'Level 7 დიპლომს — გამოცდის წარმატებით ჩაბარების შემთხვევაში'
        : 'a Level 7 Diploma — on passing the exam'
      : p.level === 'minimba'
        ? ka
          ? 'International Mini MBA სერტიფიკატს — კურსის წარმატებით დასრულების შემთხვევაში'
          : 'the International Mini MBA Certification — on completing the course'
        : ka
          ? 'Level 4 დიპლომს — გამოცდის წარმატებით ჩაბარების შემთხვევაში'
          : 'a Level 4 Diploma — on passing the exam'
  const postal = online
    ? ka
      ? 'საფოსტო სერვისს და ელექტრონულ (პირად) კაბინეტზე წვდომას'
      : 'postal service and access to your private online cabinet'
    : ka
      ? 'საფოსტო სერვისს'
      : 'postal service'
  const includedTitle = ka ? 'ღირებულება მოიცავს:' : 'The fee includes:'
  const included = ka
    ? [
        'კოლეჯში გაწევრიანებას, სახელმძღვანელოსა და აფილაციის დამადასტურებელ დოკუმენტს — International CIC Study & Training Materials',
        'დისტანციური სწავლების დეტალურ ინსტრუქციას საუკეთესო შედეგისთვის — Study & Training Guide',
        'მოდულების შესაბამის Self-Assessment Test-ებსა და პასუხებს, ასევე Progress Chart-ს',
        'ფინალური გამოცდის მოწყობას',
        qual,
        postal,
      ]
    : [
        'College membership, plus your study materials & certificate of affiliation — International CIC Study & Training Materials',
        'detailed distance-learning instructions for the best results — the Study & Training Guide',
        'per-module Self-Assessment Tests with answers, plus a Progress Chart',
        'arrangement of your final exam',
        qual,
        postal,
      ]

  return (
    <>
      <section className="bg-hero text-white">
        <Container className="flex flex-col gap-4 py-12 sm:py-16">
          <Link href="/#programs" className="text-sm text-white/70 transition hover:text-white">
            ← {ka ? 'ყველა პროგრამა' : 'All programmes'}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {level ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {ka ? level.ka : level.en}
                {level.tag ? ` · ${level.tag}` : ''}
              </span>
            ) : null}
            {field ? (
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white/85">
                {field}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{p.title}</h1>
          {level ? <p className="text-cream text-sm font-medium">{ka ? level.metaKa : level.metaEn}</p> : null}
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {topics ? (
              <div>
                <h2 className="text-lg font-bold text-navy-900">Summary of Major Topics &amp; Study</h2>
                <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
                  {topics
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((line, i) =>
                      /^module\b/i.test(line) ? (
                        <p key={i} className="mt-3 font-semibold text-navy-900 first:mt-0">
                          {line}
                        </p>
                      ) : (
                        <p key={i} className="flex gap-2 leading-snug">
                          <span aria-hidden className="text-red-400">
                            ·
                          </span>
                          <span>{line}</span>
                        </p>
                      ),
                    )}
                </div>
              </div>
            ) : null}

            {career ? (
              <div>
                <h2 className="text-lg font-bold text-navy-900">Study &amp; Career Development</h2>
                <div className="mt-3 flex flex-col gap-2 text-sm leading-snug text-muted sm:text-base">
                  {career
                    .split(/\n\s*\n+/)
                    .map((para) => para.replace(/\n/g, ' ').trim())
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </div>
            ) : null}

            {!topics && !career ? (
              <p className="text-sm text-muted">
                {ka
                  ? 'დეტალური აღწერა მალე დაემატება — სრული სილაბუსი იხილეთ კემბრიჯის გვერდზე.'
                  : 'A full description is coming soon — see the complete syllabus on the Cambridge page.'}
              </p>
            ) : null}

            <div className="rounded-xl border border-border bg-paper p-5">
              <p className="font-bold text-navy-900">{includedTitle}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {included.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <span aria-hidden className="mt-0.5 font-bold text-red-600">
                      ✓
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-paper p-6">
              <p className="font-bold text-navy-900">{ka ? 'დაინტერესდით?' : 'Interested?'}</p>
              <p className="mt-2 text-sm text-muted">
                {ka
                  ? 'გამოგვიგზავნეთ მოთხოვნა ამ პროგრამაზე და ჩვენი გუნდი დაგიკავშირდებათ.'
                  : 'Send an enquiry about this programme and our team will get back to you.'}
              </p>
              <a
                href="#enquire"
                data-enquiry-source={`program:${p.slug}`}
                className="bg-red-cta mt-4 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                {t('enquire')}
              </a>
            </div>
          </aside>
        </Container>
      </section>

      <EnquirySection locale={locale} fields={fields.map((f) => ({ id: String(f.id), title: f.title as string }))} />
    </>
  )
}
