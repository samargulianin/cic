import type { CollectionConfig } from 'payload'

// One document per CIC programme. Metadata (title, level, field, source URL) is
// seeded from the catalogue; the `description` + `modules` are pulled from the
// Cambridge course page and are editable by staff. Each doc renders a branded
// detail page at /[locale]/programs/[slug].
export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'fieldEn'],
    group: 'Content',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL segment: /programs/<slug>' },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'Diploma', value: 'diploma' },
        { label: 'Mastery of Management Graduate Diploma', value: 'mastery' },
        { label: 'Executive Mini MBA', value: 'minimba' },
        { label: 'Executive MBA (EMBA)', value: 'emba' },
      ],
    },
    { name: 'fieldEn', type: 'text', label: 'Field (EN)' },
    { name: 'fieldKa', type: 'text', label: 'Field (KA)' },
    { name: 'order', type: 'number', defaultValue: 0 },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'Optional one-line overview.' },
    },
    // NOTE: `description` + `modules` are retained (unused) purely to keep the
    // schema change additive — removing them makes drizzle push prompt for a
    // rename it can't auto-resolve. Safe to prune later via a real migration.
    { name: 'description', type: 'textarea', admin: { hidden: true } },
    {
      name: 'modules',
      type: 'array',
      admin: { hidden: true },
      labels: { singular: 'Module', plural: 'Modules' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'topics',
      type: 'textarea',
      label: 'Summary of Major Topics & Study',
      admin: { description: 'Pulled verbatim from the Cambridge course page.' },
    },
    {
      name: 'career',
      type: 'textarea',
      label: 'Study & Career Development',
      admin: { description: 'Pulled verbatim from the Cambridge course page.' },
    },
    { name: 'sourceUrl', type: 'text', admin: { description: 'Cambridge course page (full syllabus).' } },
  ],
}
