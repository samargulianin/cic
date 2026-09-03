import type { Block } from 'payload'

// Programs — heading/intro for the section; the programme list itself is read
// from the `programs` collection and rendered as selectable level tabs, each
// programme linking to its own detail page.
export const Programs: Block = {
  slug: 'programs',
  interfaceName: 'ProgramsBlock',
  labels: { singular: 'Programs', plural: 'Programs sections' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
  ],
}
