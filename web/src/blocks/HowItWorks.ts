import type { Block } from 'payload'

// How it works — the distance-learning model end to end: the two study formats
// (physical distance vs. new digital), Cambridge's remote-exam rules, key facts,
// the step-by-step process with durations, and what the fee covers.
export const HowItWorks: Block = {
  slug: 'howItWorks',
  interfaceName: 'HowItWorksBlock',
  labels: { singular: 'How it works', plural: 'How it works sections' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'formats',
      type: 'array',
      labels: { singular: 'Format', plural: 'Formats' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'tag', type: 'text', admin: { description: 'Optional badge, e.g. "New".' } },
        { name: 'description', type: 'textarea' },
        { name: 'programs', type: 'textarea', admin: { description: 'Optional highlighted note, e.g. which fields the format covers.' } },
      ],
    },
    {
      name: 'examNote',
      type: 'group',
      label: 'Exam highlight',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
    {
      name: 'facts',
      type: 'array',
      labels: { singular: 'Fact', plural: 'Facts' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'process',
      type: 'array',
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'duration', type: 'text', admin: { description: 'Shown as a badge, e.g. "3 weeks".' } },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'included',
      type: 'group',
      label: 'What the fee includes',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
      ],
    },
    { name: 'footnote', type: 'text' },
  ],
}
