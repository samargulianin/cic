import { getPayloadClient } from '@/lib/payload'
import { PROGRAM_CATALOGUE } from '@/lib/programCatalogue'
import PROGRAM_CONTENT from '@/lib/programContent.json'

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

function programsBlock(locale: 'ka' | 'en') {
  const ka = locale === 'ka'
  return {
    blockType: 'programs',
    eyebrow: ka ? 'პროგრამები' : 'Programs',
    heading: ka ? 'აირჩიეთ თქვენი პროგრამა' : 'Choose your programme',
    intro: ka
      ? '170+ საერთაშორისო პროფესიული პროგრამა სამ საფეხურზე — დააწკაპუნეთ ნებისმიერ პროგრამაზე სრული აღწერისთვის.'
      : '170+ international professional programmes across three levels — click any programme for the full description.',
  }
}

export async function seed() {
  const payload = await getPayloadClient()

  // 1. Admin user
  const existing = await payload.find({ collection: 'users', limit: 1 })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: 'info@cicgeorgia.ge', password: 'changeme123', name: 'CIC Georgia Admin', role: 'admin' },
    })
  } else {
    // Keep the single admin account's login email + role in sync.
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { email: 'info@cicgeorgia.ge', role: 'admin' },
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

  // 2b. Programs — one doc per course, with the verbatim Cambridge topics/career
  // text pulled into src/lib/programContent.json.
  const CONTENT = PROGRAM_CONTENT as Record<string, { topics?: string; career?: string }>
  for (let i = 0; i < PROGRAM_CATALOGUE.length; i++) {
    const c = PROGRAM_CATALOGUE[i]
    const found = await payload.find({ collection: 'programs', where: { slug: { equals: c.slug } }, limit: 1 })
    const con = CONTENT[c.slug] || {}
    const data = {
      title: c.title, slug: c.slug, level: c.level, fieldEn: c.fieldEn, fieldKa: c.fieldKa,
      sourceUrl: c.sourceUrl, order: i, topics: con.topics || '', career: con.career || '',
    }
    if (found.totalDocs > 0) {
      await payload.update({ collection: 'programs', id: found.docs[0].id, data })
    } else {
      await payload.create({ collection: 'programs', data })
    }
  }

  // Remove programmes no longer in the catalogue (e.g. the retired EMBA tier).
  const validSlugs = new Set(PROGRAM_CATALOGUE.map((c) => c.slug))
  const allPrograms = await payload.find({ collection: 'programs', limit: 500, depth: 0 })
  for (const doc of allPrograms.docs) {
    if (!validSlugs.has((doc as any).slug)) {
      await payload.delete({ collection: 'programs', id: doc.id })
    }
  }

  // 3. Header / Footer globals
  // The nav array rows are NOT localized (only the `label` subfield is). So we
  // create the rows once in `ka`, then update the SAME rows by id for `en` —
  // otherwise the second update would recreate rows and clobber the ka labels.
  const navItems = [
    { ka: 'პროგრამები', en: 'Programs', href: '#programs' },
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

  // Footer link columns. Like the nav, array rows are NOT localized as a whole
  // (only `title` / `label` subfields are, and `href` not at all) — so seed `ka`
  // first, then update the SAME rows/links by id for `en` to avoid clobbering.
  const footerColumns = [
    {
      title: { ka: 'ნავიგაცია', en: 'Explore' },
      links: [
        { ka: 'პროგრამები', en: 'Programs', href: '#programs' },
        { ka: 'როგორ მუშაობს', en: 'How it works', href: '#how-it-works' },
        { ka: 'CIC-ის შესახებ', en: 'About CIC', href: '#about' },
      ],
    },
    {
      title: { ka: 'კონტაქტი', en: 'Contact' },
      links: [
        { ka: 'WhatsApp', en: 'WhatsApp', href: 'https://wa.me/995593116946' },
        { ka: 'info@cicgeorgia.ge', en: 'info@cicgeorgia.ge', href: 'mailto:info@cicgeorgia.ge' },
        { ka: '+995 593 11 69 46', en: '+995 593 11 69 46', href: 'tel:+995593116946' },
      ],
    },
  ]

  const seededFooter = await payload.updateGlobal({
    slug: 'footer',
    locale: 'ka',
    data: {
      tagline: '',
      accreditationNote: 'CIC — Cambridge International College ბრიტანული დისტანციური კოლეჯი, დაარსებული 1935 წელს.',
      columns: footerColumns.map((c) => ({
        title: c.title.ka,
        links: c.links.map((l) => ({ label: l.ka, href: l.href })),
      })),
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      tagline: '',
      accreditationNote: 'CIC is a British accredited distance-learning college, established in 1935.',
      columns: (seededFooter.columns || []).map((col, ci) => ({
        id: col.id,
        title: footerColumns[ci].title.en,
        links: (col.links || []).map((lnk, li) => ({
          id: lnk.id,
          label: footerColumns[ci].links[li].en,
          href: footerColumns[ci].links[li].href,
        })),
      })),
    },
  })

  // 4. Homepage (bilingual, block-based)
  const kaLayout = [
    {
      blockType: 'hero',
      eyebrow: 'CIC Georgia',
      heading: '170+ *დისტანციური* პროგრამა',
      subheading: 'მოქნილი გრაფიკი · კემბრიჯის დიპლომი',
      ctaLabel: 'გაიგეთ მეტი',
      socialProof: 'კემბრიჯის საერთაშორისო კოლეჯის ოფიციალური პარტნიორი საქართველოში 2005 წლიდან',
      badges: [{ label: 'ბრიტანული აკრედიტაცია' }, { label: '1935 წლიდან' }],
    },
    {
      blockType: 'statsCallout',
      eyebrow: 'One World-ის გამოცდილება',
      heading: 'რატომ CIC Georgia',
      stats: [
        { value: '170+', label: 'სადიპლომო პროგრამა' },
        { value: '2005', label: 'წლიდან საქართველოში' },
        { value: '1935', label: 'წლიდან ბრიტანეთში' },
      ],
    },
    programsBlock('ka'),
    {
      blockType: 'howItWorks',
      eyebrow: 'როგორ მუშაობს',
      heading: 'ორი ფორმატი, ერთი ბრიტანული დიპლომი',
      intro:
        'სწავლება სრულად დისტანციურია — ლექციები არ ტარდება. აირჩიეთ კლასიკური დისტანციური ან ახალი ციფრული ფორმატი და ისწავლეთ თქვენი ტემპით.',
      formats: [
        {
          name: 'დისტანციური',
          description: 'სახელმძღვანელო ფიზიკურად ჩამოდის ბრიტანეთიდან. ხელმისაწვდომია ყველა პროგრამაზე.',
          programs: '📄 ბევრ პროგრამაზე სახელმძღვანელო ხელმისაწვდომია სოფტქოფის (ელექტრონული ვერსიის) სახითაც.',
        },
        {
          name: 'ონლაინ (ციფრული)',
          tag: 'ახალი',
          description: 'სრულად ციფრული ფორმატი — მასალები ხელმისაწვდომია მომენტალურად.',
          programs:
            '💻 ონლაინ ხელმისაწვდომია 8 პროგრამა: Accounting & Finance in Business & Management, Advanced Management & Administration, Business Management & Administration, Commercial Practice & Law, Health & Safety in the Workplace, Logistics, Materials & Supply Chain Management, Management & Administration, Project Leadership & Management.',
        },
      ],
      examNote: {
        heading: 'კემბრიჯის ახალი საგამოცდო წესები',
        body:
          'საგამოცდო მასალები ხელმისაწვდომია მომენტალურად, პაროლით დაცული უსაფრთხო ბმულით (password-protected link). გამოცდა ჩააბარეთ დისტანციურად, თქვენთვის ხელსაყრელ დროს.',
      },
      facts: [
        { text: 'ლექციები არ ტარდება — სწავლება სრულად დისტანციურია' },
        { text: 'სახელმძღვანელო ჩამოდის ბრიტანეთიდან' },
        { text: 'სწავლის პერიოდი — მაქსიმუმ 1 წელი' },
        { text: 'გამოცდა — სწავლის დაწყებიდან 3 თვის შემდეგ' },
        { text: 'საგამოცდო საკითხებს მიიღებთ მეილზე' },
      ],
      process: [
        { title: 'რეგისტრაცია და გადახდა', duration: '1 სამუშაო დღე' },
        { title: 'სახელმძღვანელოს ჩამოტანა', duration: '3 კვირა' },
        { title: 'სწავლის პროცესი', duration: 'მაქსიმუმ 1 წელი', text: 'აპლიკანტის სურვილის მიხედვით.' },
        { title: 'გამოცდის ჩაბარება', duration: 'დაწყებიდან 3–12 თვეში' },
        { title: 'დიპლომის მიღება ბრიტანეთიდან', duration: '3 კვირა' },
      ],
      included: {
        heading: 'ღირებულება მოიცავს',
        items: [
          { text: 'კოლეჯში გაწევრიანება' },
          { text: 'საფოსტო სერვისი' },
          { text: 'სახელმძღვანელოები' },
          { text: 'გამოცდის ჩამოტანა' },
          { text: 'გამოცდის მოწყობა' },
          { text: 'საგამოცდო ნაშრომის კოლეჯში გაგზავნა' },
          { text: 'სერტიფიკატის ჩამოტანა და გადაცემა (წარმატებული სტუდენტებისთვის)' },
        ],
      },
      footnote: 'ორივე ფორმატში დიპლომი ფიზიკურად ჩამოდის ბრიტანეთიდან.',
    },
    {
      blockType: 'about',
      eyebrow: 'CIC-ის შესახებ',
      heading: 'კემბრიჯის საერთაშორისო კოლეჯი საქართველოში',
      lead: 'კემბრიჯის საერთაშორისო კოლეჯს საქართველოში 2005 წლიდან საგანმანათლებლო ცენტრი One World წარმოადგენდა. ამ ხნის განმავლობაში ათასობით ადამიანს დავეხმარეთ კარიერულ წინსვლაში, კვალიფიკაციის ამაღლებასა და ახალი პროფესიის დაუფლებაში. გარკვეული პაუზის შემდეგ, დავბრუნდით განახლებული ენერგიითა და უამრავი სიახლით! ამიერიდან, კოლეჯს ახალი ბრენდი — CIC Georgia წარადგენს.',
      offerings: {
        heading: 'დღეს CIC Georgia გთავაზობთ:',
        items: [
          { text: '170-ზე მეტ საერთაშორისო პროფესიულ პროგრამას' },
          { text: 'სრულად თქვენზე მორგებულ სასწავლო გრაფიკს' },
          { text: 'მუდმივ ტექნიკურ მხარდაჭერას სასწავლო პროცესის განმავლობაში' },
          { text: 'ბრიტანული აკრედიტაციის მქონე დიპლომს' },
        ],
      },
      paragraphs: [
        { text: 'Cambridge International College-ს აქვს ყველა პრესტიჟული საერთაშორისო აკრედიტაცია და აღიარება, მათ შორის მსოფლიოში ყველაზე დიდი აკრედიტაციის მიმნიჭებელი ორგანოს, ASIC-ის აკრედიტაცია. კოლეჯის პროგრამები უნიკალურია საქართველოს ბაზარზე — ერთი პროგრამა უდრის ერთ ახალ პროფესიას და საერთაშორისო კვალიფიკაციას ბიზნეს ადმინისტრირების ნებისმიერ დარგში.' },
        { text: 'კემბრიჯის საერთაშორისო კოლეჯის საერთაშორისო დიპლომებს კატეგორიები მინიჭებული აქვთ დიდი ბრიტანეთის მთავრობის განათლებისა და პროფესიული მომზადების დეპარტამენტის მიერ და უტოლდება დიდ ბრიტანეთში აკრედიტირებულ კოლეჯებსა და უნივერსიტეტებში გაცემულ პროფესიული კვალიფიკაციის დამადასტურებელ დიპლომებს. დიპლომები შეესაბამება ბრიტანეთის განათლების სისტემის British National Framework დონეებს — Level 4, Level 5, Level 6, Level 7, Higher National Diploma (HND) და National Vocational Qualification (NVQ).' },
      ],
    },
    {
      blockType: 'ctaBanner',
      heading: 'მზად ხართ დასაწყებად?',
      subheading: 'გამოგვიგზავნეთ მოთხოვნა და ჩვენი გუნდი დაგიკავშირდებათ.',
      ctaLabel: 'გააგზავნე მოთხოვნა',
    },
  ]

  const enLayout = [
    {
      blockType: 'hero',
      eyebrow: 'CIC Georgia',
      heading: '170+ *distance* programmes',
      subheading: 'Flexible schedule · a Cambridge diploma',
      ctaLabel: 'Enquire',
      socialProof: 'Official Cambridge International College partner in Georgia since 2005',
      badges: [{ label: 'British accredited' }, { label: 'Since 1935' }],
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
    programsBlock('en'),
    {
      blockType: 'howItWorks',
      eyebrow: 'How it works',
      heading: 'Two formats, one British diploma',
      intro:
        'Study is fully distance — no lectures are held. Choose the classic distance format or the new digital one, and study at your own pace.',
      formats: [
        {
          name: 'Distance',
          description: 'Your textbook is shipped physically from Britain. Available for every programme.',
          programs: '📄 For many programmes the study materials are also available in softcopy — a digital version.',
        },
        {
          name: 'Online (Digital)',
          tag: 'New',
          description: 'A fully digital format — materials are available instantly.',
          programs:
            '💻 Available online for 8 programmes: Accounting & Finance in Business & Management, Advanced Management & Administration, Business Management & Administration, Commercial Practice & Law, Health & Safety in the Workplace, Logistics, Materials & Supply Chain Management, Management & Administration, Project Leadership & Management.',
        },
      ],
      examNote: {
        heading: "Cambridge's new exam rules",
        body:
          'Exam materials are available instantly via a password-protected secure link. Sit the exam remotely, at a time that suits you.',
      },
      facts: [
        { text: 'No lectures — study is fully distance' },
        { text: 'Textbook shipped from Britain' },
        { text: 'Study period — up to 1 year' },
        { text: 'Exam — from 3 months after you start' },
        { text: 'Exam questions delivered by email' },
      ],
      process: [
        { title: 'Registration & payment', duration: '1 working day' },
        { title: 'Textbook delivery', duration: '3 weeks' },
        { title: 'Study', duration: 'up to 1 year', text: "At the applicant's own pace." },
        { title: 'Sit the exam', duration: '3–12 months from start' },
        { title: 'Diploma from Britain', duration: '3 weeks' },
      ],
      included: {
        heading: 'The fee includes',
        items: [
          { text: 'College membership' },
          { text: 'Postal service' },
          { text: 'Textbooks' },
          { text: 'Exam delivery' },
          { text: 'Exam arrangement' },
          { text: 'Sending your exam paper to the college' },
          { text: 'Certificate delivery & handover (for successful students)' },
        ],
      },
      footnote: 'In both formats, the diploma is delivered physically from Britain.',
    },
    {
      blockType: 'about',
      eyebrow: 'About CIC',
      heading: 'Cambridge International College in Georgia',
      lead: 'Since 2005, the educational centre One World has represented Cambridge International College in Georgia. Over these years we have helped thousands of people advance their careers, raise their qualifications and master new professions. After a pause, we are back — with renewed energy and plenty of new things. From now on, the college is represented by a new brand: CIC Georgia.',
      offerings: {
        heading: 'Today CIC Georgia offers:',
        items: [
          { text: '170+ international professional programmes' },
          { text: 'a study schedule fully tailored to you' },
          { text: 'ongoing technical support throughout your studies' },
          { text: 'a British-accredited diploma' },
        ],
      },
      paragraphs: [
        { text: "Cambridge International College holds every prestigious international accreditation and recognition — including accreditation from ASIC, the world's largest accreditation body. Its programmes are unique in the Georgian market: one programme equals one new profession and an international qualification in any field of business administration." },
        { text: "Cambridge International College's international diplomas are categorised by the UK Government's Department for Education and vocational training, and are equivalent to the professional-qualification diplomas awarded by accredited colleges and universities in the UK. They correspond to the British National Framework levels — Level 4, Level 5, Level 6, Level 7, Higher National Diploma (HND) and National Vocational Qualification (NVQ)." },
      ],
    },
    {
      blockType: 'ctaBanner',
      heading: 'Ready to begin?',
      subheading: 'Send an enquiry and our team will get back to you.',
      ctaLabel: 'Send enquiry',
    },
  ]

  const kaMeta = { title: 'CIC Georgia — Cambridge International College', description: 'ბრიტანული აკრედიტებული დისტანციური დიპლომები საქართველოში.' }
  const enMeta = { title: 'CIC Georgia — Cambridge International College', description: 'British accredited distance-learning diplomas in Georgia.' }

  const home = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1 })
  if (home.totalDocs > 0) {
    await payload.update({ collection: 'pages', id: home.docs[0].id, locale: 'ka', data: { title: 'მთავარი', layout: kaLayout as any, meta: kaMeta } })
    await payload.update({ collection: 'pages', id: home.docs[0].id, locale: 'en', data: { title: 'Home', layout: enLayout as any, meta: enMeta } })
  } else {
    const created = await payload.create({
      collection: 'pages',
      locale: 'ka',
      data: {
        slug: 'home',
        title: 'მთავარი',
        layout: kaLayout as any,
        meta: { title: 'CIC Georgia — Cambridge International College', description: 'ბრიტანული აკრედიტებული დისტანციური დიპლომები საქართველოში.' },
      },
    })
    await payload.update({
      collection: 'pages',
      id: created.id,
      locale: 'en',
      data: {
        title: 'Home',
        layout: enLayout as any,
        meta: { title: 'CIC Georgia — Cambridge International College', description: 'British accredited distance-learning diplomas in Georgia.' },
      },
    })
  }

  return { fields: fieldIds.length, home: true, admin: 'info@cicgeorgia.ge / changeme123' }
}
