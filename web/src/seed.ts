import { getPayloadClient } from '@/lib/payload'

// Seeds a bilingual prototype: admin user, fields, header/footer, and the homepage.
// Invoked via the dev-only /seed route (runs in the Next runtime, not tsx).
const FIELDS: { slug: string; ka: string; en: string; kaSum: string; enSum: string }[] = [
  { slug: 'business-management', ka: 'ბიზნესის მართვა', en: 'Business Management', kaSum: 'ლიდერობა, სტრატეგია და ორგანიზაციის მართვა.', enSum: 'Leadership, strategy and running an organisation.' },
  { slug: 'finance-accounting', ka: 'ფინანსები და ბუღალტერია', en: 'Finance & Accounting', kaSum: 'ფინანსური აღრიცხვა, ანალიზი და კონტროლი.', enSum: 'Financial reporting, analysis and control.' },
  { slug: 'human-resources', ka: 'ადამიანური რესურსები', en: 'Human Resources', kaSum: 'პერსონალის მართვა და ორგანიზაციული განვითარება.', enSum: 'People management and organisational development.' },
  { slug: 'marketing', ka: 'მარკეტინგი', en: 'Marketing', kaSum: 'ბრენდინგი, ციფრული და სტრატეგიული მარკეტინგი.', enSum: 'Branding, digital and strategic marketing.' },
  { slug: 'project-management', ka: 'პროექტების მართვა', en: 'Project Management', kaSum: 'პროექტების დაგეგმვა, შესრულება და მიწოდება.', enSum: 'Planning, executing and delivering projects.' },
  { slug: 'information-technology', ka: 'საინფორმაციო ტექნოლოგიები', en: 'Information Technology', kaSum: 'IT მენეჯმენტი და ციფრული სისტემები.', enSum: 'IT management and digital systems.' },
  { slug: 'hospitality-tourism', ka: 'სტუმართმასპინძლობა და ტურიზმი', en: 'Hospitality & Tourism', kaSum: 'სასტუმრო, ტურიზმი და მომსახურების მართვა.', enSum: 'Hotel, travel and service management.' },
  { slug: 'business-law', ka: 'ბიზნეს სამართალი', en: 'Business Law', kaSum: 'სამართლებრივი საფუძვლები ბიზნესისთვის.', enSum: 'Legal foundations for business.' },
]

export async function seed() {
  const payload = await getPayloadClient()

  // 1. Admin user
  const existing = await payload.find({ collection: 'users', limit: 1 })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@oneworld.ge', password: 'changeme123', name: 'One World Admin', role: 'admin' },
    })
  } else if (!existing.docs[0]?.role) {
    // Backfill: a user created before the `role` field existed has no role and
    // would otherwise lose admin powers. Promote the first account to admin.
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { role: 'admin' },
    })
  }

  // 2. Fields (bilingual)
  const fieldIds: (string | number)[] = []
  for (let i = 0; i < FIELDS.length; i++) {
    const f = FIELDS[i]
    const found = await payload.find({ collection: 'fields', where: { slug: { equals: f.slug } }, limit: 1 })
    let id: string | number
    if (found.totalDocs > 0) {
      id = found.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'fields',
        locale: 'ka',
        data: { slug: f.slug, title: f.ka, summary: f.kaSum, order: i, levels: ['level-4', 'level-5', 'level-7'] },
      })
      id = created.id
    }
    await payload.update({ collection: 'fields', id, locale: 'en', data: { title: f.en, summary: f.enSum } })
    fieldIds.push(id)
  }

  // 3. Header / Footer globals
  // The nav array rows are NOT localized (only the `label` subfield is). So we
  // create the rows once in `ka`, then update the SAME rows by id for `en` —
  // otherwise the second update would recreate rows and clobber the ka labels.
  const navItems = [
    { ka: 'მიმართულებები', en: 'Fields', href: '#fields' },
    { ka: 'როგორ მუშაობს', en: 'How it works', href: '#how-it-works' },
    { ka: 'CIC-ის შესახებ', en: 'About CIC', href: '#about' },
  ]
  const seededHeader = await payload.updateGlobal({
    slug: 'header',
    locale: 'ka',
    data: {
      ctaLabel: 'გაიგეთ მეტი',
      nav: navItems.map((n) => ({ label: n.ka, href: n.href })),
    },
  })
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: {
      ctaLabel: 'Enquire',
      nav: (seededHeader.nav || []).map((row, i) => ({
        id: row.id,
        label: navItems[i].en,
        href: navItems[i].href,
      })),
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'ka',
    data: {
      tagline: 'One World — Cambridge International College-ის ოფიციალური წარმომადგენელი საქართველოში.',
      accreditationNote: 'CIC — ბრიტანული აკრედიტებული დისტანციური კოლეჯი, დაარსებული 1935 წელს.',
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      tagline: 'One World — the official Georgian representative of Cambridge International College.',
      accreditationNote: 'CIC is a British accredited distance-learning college, established in 1935.',
    },
  })

  // 4. Homepage (bilingual, block-based)
  const featured = fieldIds.slice(0, 6)
  const kaLayout = [
    {
      blockType: 'hero',
      eyebrow: 'CIC Georgia',
      heading: '170+ *დისტანციური* პროგრამა მომუშავე პროფესიონალებისთვის',
      subheading: 'მოქნილი გრაფიკი · კემბრიჯის დიპლომი',
      ctaLabel: 'გაიგეთ მეტი',
      socialProof: 'კემბრიჯის საერთაშორისო კოლეჯის ოფიციალური პარტნიორი საქართველოში 2005 წლიდან',
      badges: [{ label: 'ბრიტანული აკრედიტაცია' }, { label: 'დაარსდა 1935' }],
    },
    {
      blockType: 'trustStrip',
      heading: 'აღიარებული და აკრედიტებული',
      items: [{ label: 'Cambridge International College' }, { label: 'British NQF Level 4/5/7' }, { label: 'დაარსდა 1935' }],
    },
    {
      blockType: 'statsCallout',
      eyebrow: 'მასშტაბი',
      heading: 'რატომ CIC',
      stats: [
        { value: '170+', label: 'დიპლომის პროგრამა' },
        { value: '19', label: 'პროფესიული მიმართულება' },
        { value: '1935', label: 'დაარსების წელი' },
      ],
    },
    {
      blockType: 'fieldsGrid',
      eyebrow: 'მიმართულებები',
      heading: 'იპოვეთ თქვენი სფერო',
      description: '19 პროფესიული მიმართულება — აირჩიეთ თქვენთვის შესაფერისი.',
      fields: featured,
      viewAllLabel: 'ყველა მიმართულება',
    },
    {
      blockType: 'narrative',
      eyebrow: 'როგორ მუშაობს',
      heading: 'ისწავლეთ თქვენი ტემპით, ნებისმიერი ადგილიდან',
      body: 'CIC-ის დისტანციური მოდელი საშუალებას გაძლევთ ისწავლოთ სამსახურის პარალელურად.',
      steps: [
        { title: 'დარეგისტრირდით', text: 'შეარჩიეთ მიმართულება და გამოგვიგზავნეთ მოთხოვნა.' },
        { title: 'ისწავლეთ', text: 'მიიღეთ მასალები და ისწავლეთ თქვენი ტემპით.' },
        { title: 'მიიღეთ დიპლომი', text: 'დაასრულეთ და მიიღეთ ბრიტანული აკრედიტებული დიპლომი.' },
      ],
    },
    {
      blockType: 'ctaBanner',
      heading: 'მზად ხართ დასაწყებად?',
      subheading: 'გამოგვიგზავნეთ მოთხოვნა და ჩვენი გუნდი დაგიკავშირდებათ.',
      ctaLabel: 'გაიგზავნე მოთხოვნა',
    },
  ]

  const enLayout = [
    {
      blockType: 'hero',
      eyebrow: 'CIC Georgia',
      heading: '170+ *distance* programmes for working professionals',
      subheading: 'Flexible schedule · a Cambridge diploma',
      ctaLabel: 'Enquire',
      socialProof: 'Official Cambridge International College partner in Georgia since 2005',
      badges: [{ label: 'British accredited' }, { label: 'Since 1935' }],
    },
    {
      blockType: 'trustStrip',
      heading: 'Recognised & accredited',
      items: [{ label: 'Cambridge International College' }, { label: 'British NQF Level 4/5/7' }, { label: 'Established 1935' }],
    },
    {
      blockType: 'statsCallout',
      eyebrow: 'Breadth',
      heading: 'Why CIC',
      stats: [
        { value: '170+', label: 'diploma programmes' },
        { value: '19', label: 'professional fields' },
        { value: '1935', label: 'year established' },
      ],
    },
    {
      blockType: 'fieldsGrid',
      eyebrow: 'Fields',
      heading: 'Find your field',
      description: '19 professional fields — choose the one that fits your career.',
      fields: featured,
      viewAllLabel: 'All fields',
    },
    {
      blockType: 'narrative',
      eyebrow: 'How it works',
      heading: 'Study at your own pace, from anywhere',
      body: "CIC's distance model lets you study alongside your job.",
      steps: [
        { title: 'Enquire', text: 'Pick a field and send us your enquiry.' },
        { title: 'Study', text: 'Receive your materials and study at your own pace.' },
        { title: 'Graduate', text: 'Complete and earn a British accredited diploma.' },
      ],
    },
    {
      blockType: 'ctaBanner',
      heading: 'Ready to begin?',
      subheading: 'Send an enquiry and our team will get back to you.',
      ctaLabel: 'Send enquiry',
    },
  ]

  const home = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1 })
  if (home.totalDocs > 0) {
    await payload.update({ collection: 'pages', id: home.docs[0].id, locale: 'ka', data: { title: 'მთავარი', layout: kaLayout as any } })
    await payload.update({ collection: 'pages', id: home.docs[0].id, locale: 'en', data: { title: 'Home', layout: enLayout as any } })
  } else {
    const created = await payload.create({
      collection: 'pages',
      locale: 'ka',
      data: {
        slug: 'home',
        title: 'მთავარი',
        layout: kaLayout as any,
        meta: { title: 'One World × Cambridge International College', description: 'ბრიტანული აკრედიტებული დისტანციური დიპლომები საქართველოში.' },
      },
    })
    await payload.update({
      collection: 'pages',
      id: created.id,
      locale: 'en',
      data: {
        title: 'Home',
        layout: enLayout as any,
        meta: { title: 'One World × Cambridge International College', description: 'British accredited distance-learning diplomas in Georgia.' },
      },
    })
  }

  return { fields: fieldIds.length, home: true, admin: 'admin@oneworld.ge / changeme123' }
}
