import type { CollectionConfig } from 'payload'
import { Hero } from '../blocks/Hero'
import { TrustStrip } from '../blocks/TrustStrip'
import { StatsCallout } from '../blocks/StatsCallout'
import { FieldsGrid } from '../blocks/FieldsGrid'
import { Programs } from '../blocks/Programs'
import { Narrative } from '../blocks/Narrative'
import { HowItWorks } from '../blocks/HowItWorks'
import { About } from '../blocks/About'
import { CTABanner } from '../blocks/CTABanner'

// Block-based pages. The homepage (slug "home") is composed from section blocks,
// proving the editing model non-technical staff will use site-wide (PRD R5.1).
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Content',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL segment. Use "home" for the homepage.' },
    },
    {
      // The whole layout is localized: each language composes its own page
      // (avoids shared block rows clobbering per-locale content). Block subfields
      // therefore must NOT be individually localized.
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [Hero, TrustStrip, StatsCallout, FieldsGrid, Programs, Narrative, HowItWorks, About, CTABanner],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
