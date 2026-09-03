import { getLocale, getTranslations } from 'next-intl/server'
import { Container, SectionHeading } from '@/components/ui'
import { getPrograms } from '@/lib/payload'
import { LEVELS, ONLINE_SLUGS } from '@/lib/programCatalogue'
import { ProgramsTabs } from '@/components/ProgramsTabs'

type ProgramsProps = {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
}

// Reads programmes from the collection and presents them as selectable level
// tabs; each programme links to its own detail page.
export async function Programs(props: ProgramsProps) {
  const locale = await getLocale()
  const t = await getTranslations('common')
  const ka = locale === 'ka'
  const all = await getPrograms()

  const levels = LEVELS.map((l) => {
    const progs = all.filter((p: any) => p.level === l.key)
    const groupsMap = new Map<
      string,
      { field: string; items: { slug: string; title: string; online: boolean }[] }
    >()
    for (const p of progs as any[]) {
      const field = (ka ? p.fieldKa || p.fieldEn : p.fieldEn) || 'Programs'
      if (!groupsMap.has(field)) groupsMap.set(field, { field, items: [] })
      groupsMap.get(field)!.items.push({ slug: p.slug, title: p.title, online: ONLINE_SLUGS.has(p.slug) })
    }
    return {
      key: l.key,
      name: ka ? l.ka : l.en,
      tag: l.tag,
      meta: ka ? l.metaKa : l.metaEn,
      description: ka ? l.descKa : l.descEn,
      count: progs.length,
      groups: [...groupsMap.values()],
    }
  })

  const info = ka
    ? {
        label: 'სხვა კვალიფიკაციები',
        title: 'სხვა კვალიფიკაციები და ინდივიდუალური პროგრამები',
        intro:
          'ზემოთ ჩამოთვლილი პროგრამების გარდა, კემბრიჯის საერთაშორისო კოლეჯი გასცემს უფრო მაღალ, Level 5 და Level 6 კვალიფიკაციებსაც. ისინი გაიცემა, როდესაც სტუდენტი გადის რამდენიმე მონათესავე პროგრამას Diploma ან Mastery კატეგორიაში:',
        categories: [
          { name: 'Honours (Higher) Diploma', note: 'უმაღლესი დიპლომი (Level 5)' },
          { name: 'Advanced Business Administration (ABA)' },
          { name: 'Baccalaureate', note: 'ბაკალავრიატი' },
          { name: 'Executive Business Administration (EBA)' },
          { name: 'Executive Mastery of Business Administration (EMBA)' },
          { name: 'Certificate', note: 'სასტარტო დონე' },
        ],
        ilm: 'CIC-ს ასევე შეუძლია გასცეს ერთობლივი Awards — საერთაშორისოდ აკრედიტებული კოლეჯის (CIC) და ლიდერობისა და მენეჯმენტის კვალიფიკაციების გამცემი დიდი ბრიტანეთის უმსხვილესი ორგანიზაციის, ILM (City & Guilds)-ის მიერ.',
        consult:
          'საფუძვლიანი კონსულტაციის შემდეგ, ჩვენი კონსულტანტები ააწყობენ თქვენს მოთხოვნებზე ზუსტად მორგებულ პროგრამას.',
      }
    : {
        label: 'Other qualifications',
        title: 'Other qualifications & custom programmes',
        intro:
          'Beyond the programmes listed here, Cambridge International College also awards higher Level 5 and Level 6 qualifications. These are earned by completing several related programmes within the Diploma or Mastery of Management categories:',
        categories: [
          { name: 'Honours (Higher) Diploma', note: 'Level 5' },
          { name: 'Advanced Business Administration (ABA)' },
          { name: 'Baccalaureate' },
          { name: 'Executive Business Administration (EBA)' },
          { name: 'Executive Mastery of Business Administration (EMBA)' },
          { name: 'Certificate', note: 'entry level' },
        ],
        ilm: "CIC can also grant joint Awards from an internationally accredited College (CIC) together with the UK's largest awarding organisation for leadership & management qualifications — ILM (City & Guilds).",
        consult:
          'After careful consideration, our consultants will build a programme tailored precisely to your goals.',
      }

  return (
    <section id="programs" className="scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={props.eyebrow} title={props.heading} description={props.intro} />
        <ProgramsTabs levels={levels} info={info} enquireLabel={t('enquire')} />
      </Container>
    </section>
  )
}
