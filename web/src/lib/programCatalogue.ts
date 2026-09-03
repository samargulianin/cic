// The CIC programme catalogue, filtered to the three levels One World offers —
// Diploma (Level 4), Mastery of Management Diploma (Level 7) and Executive MBA
// (EMBA, Level 7). Titles + source URLs are the authoritative ones crawled from
// cambridgecollege.co.uk; each maps to a branded detail page on this site whose
// description + modules are pulled from the Cambridge course page (sourceUrl).

export type ProgramLevel = 'diploma' | 'mastery' | 'minimba'

export type ProgramEntry = {
  slug: string
  title: string
  level: ProgramLevel
  fieldEn: string
  fieldKa: string
  sourceUrl: string
}

const BASE = 'https://www.cambridgecollege.co.uk'

// Each category: field labels + course [title, cambridge-path-slug] per level.
type Cat = {
  fEn: string
  fKa: string
  path: string
  diploma?: [string, string][]
  mastery?: [string, string][]
  minimba?: [string, string][]
  emba?: [string, string][] // retained but no longer surfaced as its own level
}

const CATS: Cat[] = [
  {
    fEn: 'Accounting, Finance & Banking',
    fKa: 'ბუღალტერია, ფინანსები და საბანკო საქმე',
    path: '/courses/accounting,-finance,-banking/',
    diploma: [
      ['Accounting & Finance in Business & Management', 'accounting-finance-in-management'],
      ['Banking & Bank Operations', 'banking-bank-operations'],
      ['Business Bookkeeping & Accounting', 'business-bookkeeping-accounts'],
      ['Cost & Management Accounting', 'cost-accounting'],
      ['Credit Management & Control', 'credit-management'],
      ['Financial Management', 'financial-management'],
      ['Auditing: Audit & Assurance', 'audit-assurance'],
    ],
    mastery: [
      ['Business Finance & Investment', 'business-finance-investment'],
      ['Financial Strategy & Decisions', 'financial-strategy-decisions'],
      ['Money, Banking & Financial Systems', 'money,-banking-financial-systems'],
    ],
    emba: [
      ['Accounting & Management (EMBA)', 'accounting-management-(emba)'],
      ['Financial Management (EMBA)', 'financial-management-(emba)'],
    ],
  },
  {
    fEn: 'Business, Insurance & Law',
    fKa: 'ბიზნესი, დაზღვევა და სამართალი',
    path: '/courses/business-studies,-insurance,-law/',
    diploma: [
      ['Business Entrepreneurship & Organisation', 'business-entrepreneurship-organisation'],
      ['Business Management & Administration', 'business-management-administration'],
      ['Commercial Practice & Law', 'commercial-practice-law'],
      ['Computers & IT in Business & Management', 'computers-it-in-business-management'],
      ['Insurance Management', 'insurance-principles-practice'],
      ['International Business & Trade', 'international-business-trade'],
    ],
    mastery: [
      ['Business Law', 'business-law'],
      ['Corporate Strategy, Policy & Planning', 'corporate-strategy-planning'],
    ],
    minimba: [['Executive Mini MBA', 'executive-mini-mba']],
  },
  {
    fEn: 'Economics, Commerce & Trade',
    fKa: 'ეკონომიკა, კომერცია და ვაჭრობა',
    path: '/courses/economics,-commerce,-trade/',
    diploma: [['Business Economics & Commerce', 'business-economics-commerce']],
    mastery: [['Managerial Economics', 'managerial-economics']],
  },
  {
    fEn: 'Management, Administration & Leadership',
    fKa: 'მენეჯმენტი, ადმინისტრირება და ლიდერობა',
    path: '/courses/management,-administration,-leadership/',
    diploma: [
      ['Advanced Management & Administration Theory & Practice', 'advanced-management-administration-theory-practice'],
      ['Leadership & Team Management', 'leadership-team-management'],
      ['Management & Administration', 'modern-management-administration'],
      ['Project Leadership & Management', 'project-leadership-management'],
      ['Public Management & Administration', 'public-administration'],
      ['Supervisory Management', 'supervisory-management'],
      ['International Relations & Global Politics', 'international-relations-global-politics'],
      ['Health & Safety in the Workplace', 'health-safety-in-the-workplace'],
    ],
    mastery: [
      ['Advanced Project Management', 'advanced-project-management'],
      ['International Relations', 'international-relations'],
      ['Management & Leadership', 'management-leadership'],
      ['Operations & Quality Management', 'operations-quality-management'],
      ['Real Estate (Property) Management', 'real-estate-(property)-management'],
    ],
    emba: [
      ['Leadership & Management (EMBA)', 'leadership-management-(emba)'],
      ['Project Management (EMBA)', 'project-management-(emba)'],
    ],
  },
  {
    fEn: 'Marketing, Sales & Advertising',
    fKa: 'მარკეტინგი, გაყიდვები და რეკლამა',
    path: '/courses/marketing,-sales,-advertising/',
    diploma: [
      ['Advertising & Public Relations', 'advertising-public-relations'],
      ['Mass Media & Communication', 'mass-media-communication'],
      ['Marketing & Sales Management', 'sales-management-marketing'],
      ['Retail Management & Customer Relations', 'retail-management-customer-relations'],
      ['Digital & Online Marketing', 'digital-online-marketing'],
    ],
    mastery: [
      ['International Marketing', 'international-marketing'],
      ['Marketing Strategy', 'marketing-strategy'],
    ],
    emba: [['Marketing Management (EMBA)', 'marketing-management-(emba)']],
  },
  {
    fEn: 'HR, Organisation & Teaching',
    fKa: 'HR, ორგანიზაცია და სწავლება',
    path: '/courses/hr,-organisation,-education-teaching/',
    diploma: [
      ['Human Resource & Personnel Management', 'human-resource-personnel-management'],
      ['Organisational Behaviour', 'organisational-behaviour'],
      ['Training Management & Employee Development', 'training-development'],
      ['Classroom Management & Psychology for Teachers', 'classroom-management-psychology-for-teachers'],
      ['Educational Psychology & Administration', 'educational-psychology-administration'],
    ],
    mastery: [
      ['Management of Human Resources', 'management-of-human-resources'],
      ['Organisational Understanding & Development', 'organisational-understanding-development'],
      ['Organisational Design & Behaviour', 'organisational-design-behaviour'],
    ],
    emba: [
      ['Human Resource Management (EMBA)', 'human-resource-management-(emba)'],
      ['Organisational Management (EMBA)', 'organisational-management-(emba)'],
    ],
  },
  {
    fEn: 'Tourism & Hospitality',
    fKa: 'ტურიზმი და სტუმართმასპინძლობა',
    path: '/courses/hotel,-tourism,-travel,-hospitality,-events/',
    diploma: [
      ['Events Management', 'events-management'],
      ['Hospitality Industry & Administration', 'hospitality-industry-administration'],
      ['Hotel Operations & Management', 'hotel-operations-management'],
      ['Tourism & Travel Management', 'tourism-travel-management'],
    ],
    mastery: [['Events Management: for Tourism, Business, Sport', 'events-management-for-tourism,-business,-sport']],
    emba: [['Hospitality Management (EMBA)', 'hospitality-management-(emba)']],
  },
  {
    fEn: 'English, Secretarial & Communication',
    fKa: 'ინგლისური, მდივნობა და კომუნიკაცია',
    path: '/courses/english,-secretarial,-communication/',
    diploma: [
      ['Administrative, Personal Assistant & Secretarial Duties', 'administrative,-personal-assistant-secretarial-duties'],
      ['Business English & Letter Writing', 'business-english-letter-writing'],
      ['Communication in Business & Management', 'communication-in-business-management'],
    ],
  },
  {
    fEn: 'Stores, Logistics & Materials',
    fKa: 'საწყობი, ლოჯისტიკა და მასალები',
    path: '/courses/stores,-logistics,-purchasing,-materials/',
    diploma: [
      ['Logistics, Materials & Supply Chain Management', 'logistics,-materials-supply-chain-management'],
      ['Purchasing & Resourcing Management', 'purchasing-resourcing-management'],
      ['Stores, Inventory & Warehouse Management', 'stores,-inventory-warehouse-management'],
      ['Supply Chain Strategy & Organisation', 'supply-chain-strategy-organisation'],
    ],
    emba: [['Logistics & Supply Chain Management (EMBA)', 'logistics-supply-chain-management-(emba)']],
  },
]

// Internal slug: derive from the Cambridge path slug, stripped of commas/parens.
function toSlug(pathSlug: string): string {
  return pathSlug
    .replace(/[(),]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
}

function build(): ProgramEntry[] {
  const out: ProgramEntry[] = []
  const seen = new Set<string>()
  const levels: ProgramLevel[] = ['diploma', 'mastery', 'minimba']
  for (const cat of CATS) {
    for (const level of levels) {
      for (const [title, pathSlug] of cat[level] || []) {
        const slug = toSlug(pathSlug)
        if (seen.has(slug)) continue
        seen.add(slug)
        out.push({
          slug,
          title,
          level,
          fieldEn: cat.fEn,
          fieldKa: cat.fKa,
          sourceUrl: BASE + cat.path + pathSlug + '/',
        })
      }
    }
  }
  return out
}

export const PROGRAM_CATALOGUE: ProgramEntry[] = build()

// Programmes available via CIC's on-line platform (in addition to hard/soft copy).
// These get an "online" badge and their fee includes private-cabinet access.
export const ONLINE_SLUGS = new Set<string>([
  'accounting-finance-in-management',
  'advanced-management-administration-theory-practice',
  'business-management-administration',
  'commercial-practice-law',
  'health-safety-in-the-workplace',
  'logistics-materials-supply-chain-management',
  'modern-management-administration',
  'project-leadership-management',
])

export const LEVELS: { key: ProgramLevel; en: string; ka: string; tag: string; metaEn: string; metaKa: string; descEn: string; descKa: string }[] = [
  {
    key: 'diploma', en: 'Diploma', ka: 'სადიპლომო პროგრამა', tag: 'Level 4',
    metaEn: 'Level 4 · ₾1690 · exam in 3–12 months', metaKa: 'Level 4 · 1690₾ · გამოცდა 3–12 თვეში',
    descEn: 'Level 4 of the British education framework — managerial & supervisory competence. One programme equals one new profession.',
    descKa: 'ბრიტანეთის განათლების სისტემის მე-4 პროფესიული დონე — მენეჯერული და საზედამხედველო კომპეტენცია. ერთი პროგრამა უდრის ერთ ახალ პროფესიას.',
  },
  {
    key: 'mastery', en: 'Mastery of Management Graduate Diploma', ka: 'Mastery of Management Graduate Diploma', tag: 'Level 7',
    metaEn: 'Level 7 · ₾1990 · exam in 3–12 months', metaKa: 'Level 7 · 1990₾ · გამოცდა 3–12 თვეში',
    descEn: "Level 7 (Master's / graduate level) — advanced, strategic management knowledge.",
    descKa: 'მე-7 (სამაგისტრო) პროფესიული დონე — მართვის სიღრმისეული, სტრატეგიული ცოდნა.',
  },
  {
    key: 'minimba', en: 'Executive Mini MBA', ka: 'Executive Mini MBA', tag: '12 months',
    metaEn: 'International Mini MBA Certification · ₾2900 · 3–12 months',
    metaKa: 'International Mini MBA Certification · 2900₾ · 3–12 თვე',
    descEn: 'A unique, fast-track distance programme covering everything a standard MBA does, across 12 modules — with a personal tutor and weekly online sessions. Ideal for a comprehensive grounding in business administration, or as a refresher for those who already hold an MBA.',
    descKa: 'უნიკალური, დაჩქარებული დისტანციური პროგრამა, რომელიც 12 მოდულში მოიცავს ყველაფერს, რასაც სტანდარტული MBA — პირადი ტუტორითა და ყოველკვირეული ონლაინ შეხვედრებით. იდეალურია ბიზნესის ადმინისტრირების სრული საფუძვლისთვის, ან MBA-ს მფლობელებისთვის ცოდნის განახლებისთვის.',
  },
]
