import type { CollectionConfig } from 'payload'
import { STUDY_LEVELS } from '../lib/studyLevels'

// The 19 professional fields — the primary organising structure (PRD R2.1).
// Skeleton here; full field/programme browse + filter is a later phase.
export { STUDY_LEVELS }

export const Fields: CollectionConfig = {
  slug: 'fields',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    group: 'Content',
  },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL segment, e.g. "business-management". Same across languages.' },
    },
    { name: 'summary', type: 'textarea', localized: true },
    {
      name: 'levels',
      type: 'select',
      hasMany: true,
      options: [...STUDY_LEVELS],
      admin: { description: 'Study levels offered in this field (taxonomy to confirm with CIC).' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Controls display order in grids.' },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'briefcase',
      options: [
        'briefcase', 'chart', 'people', 'gavel', 'cog', 'globe',
        'health', 'palette', 'cap', 'shield', 'cpu', 'leaf',
      ],
      admin: { description: 'Decorative icon shown on the field card.' },
    },
  ],
}
