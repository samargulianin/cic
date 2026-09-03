import type { Block } from 'payload'

// About CIC — who we are: the One World → CIC Georgia story, what CIC Georgia
// offers today, and the college's British accreditation credentials.
export const About: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: { singular: 'About CIC', plural: 'About CIC sections' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'lead', type: 'textarea' },
    {
      name: 'offerings',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Offering', plural: 'Offerings' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'paragraphs',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
  ],
}
