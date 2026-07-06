import type { CollectionConfig } from 'payload'
import { STUDY_LEVELS } from './Fields'
import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

// Lead capture (PRD R3). Each submission is stored here AND emails One World.
// Created via a public server action after Turnstile + honeypot checks.
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'fieldOfInterest', 'status', 'assignedTo', 'followUpDate', 'createdAt'],
    // Let staff find a lead by any of the details they'd have on hand.
    listSearchableFields: ['name', 'email', 'phone', 'message'],
    group: 'Leads',
  },
  access: {
    // Created server-side via Local API (overrideAccess); never publicly creatable via REST.
    create: () => false,
    read: isStaff,
    update: isStaff,
    // Deleting a lead is destructive and irreversible — admins only.
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'fieldOfInterest', type: 'relationship', relationTo: 'fields' },
    {
      name: 'studyLevel',
      type: 'select',
      options: [...STUDY_LEVELS],
      admin: { description: 'Study level the enquirer is interested in (if given).' },
    },
    {
      name: 'preferredContact',
      type: 'select',
      defaultValue: 'whatsapp',
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'email' },
      ],
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'consent',
      type: 'checkbox',
      required: true,
      admin: { description: 'Consent to be contacted (privacy notice).' },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Which page/CTA the enquiry came from.',
      },
    },
    {
      name: 'locale',
      type: 'text',
      admin: { readOnly: true, description: 'UI language at submission.' },
    },
    // --- Internal activity log: what staff did with this lead ---
    {
      name: 'notes',
      type: 'array',
      label: 'Notes / activity log',
      admin: {
        description: 'Internal notes — calls, follow-ups, outcomes. Not shown to the enquirer.',
      },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          admin: { readOnly: true },
        },
        { name: 'at', type: 'date', admin: { readOnly: true } },
      ],
    },
    // --- Sidebar: pipeline & ownership ---
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
        components: { Cell: '/components/admin/StatusCell' },
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Staff member handling this lead.' },
    },
    {
      name: 'followUpDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description: 'When to next contact this lead.',
      },
    },
    {
      name: 'contactedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-set when the lead first moves off "New".',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        // Stamp first-contact time the moment status leaves "new".
        if (data?.status && data.status !== 'new' && !originalDoc?.contactedAt && !data.contactedAt) {
          data.contactedAt = new Date().toISOString()
        }
        // Auto-fill author/at on newly-added note rows.
        if (Array.isArray(data?.notes)) {
          data.notes = data.notes.map((n: { note?: string; author?: unknown; at?: string }) =>
            n && !n.at ? { ...n, at: new Date().toISOString(), author: n.author ?? req.user?.id ?? null } : n,
          )
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return

        // Resolve the related field to its title (email showed a raw ID before).
        let fieldTitle = '—'
        if (doc.fieldOfInterest) {
          try {
            const field = await req.payload.findByID({
              collection: 'fields',
              id: doc.fieldOfInterest,
              locale: (doc.locale as 'ka' | 'en') || 'ka',
              depth: 0,
            })
            fieldTitle = field?.title || fieldTitle
          } catch {
            fieldTitle = String(doc.fieldOfInterest)
          }
        }

        const adminUrl = process.env.NEXT_PUBLIC_SERVER_URL
          ? `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/enquiries/${doc.id}`
          : undefined

        // 1. Notify One World staff.
        const to = process.env.ENQUIRY_NOTIFY_TO
        if (to) {
          try {
            await req.payload.sendEmail({
              to,
              from: process.env.EMAIL_FROM || 'no-reply@oneworld.ge',
              replyTo: doc.email,
              subject: `New enquiry — ${doc.name}`,
              text: [
                `Name: ${doc.name}`,
                `Email: ${doc.email}`,
                `Phone: ${doc.phone || '—'}`,
                `Preferred contact: ${doc.preferredContact}`,
                `Field of interest: ${fieldTitle}`,
                `Study level: ${doc.studyLevel || '—'}`,
                `Source: ${doc.source || '—'}`,
                `Language: ${doc.locale || '—'}`,
                '',
                `Message:`,
                doc.message || '—',
                ...(adminUrl ? ['', `Open in admin: ${adminUrl}`] : []),
              ].join('\n'),
            })
          } catch (err) {
            // Never fail the submission because email delivery hiccupped.
            req.payload.logger.error({ err }, 'Enquiry notification email failed')
          }
        }

        // 2. Acknowledge the enquirer (bilingual, by submission language).
        try {
          const ka = doc.locale !== 'en'
          await req.payload.sendEmail({
            to: doc.email,
            from: process.env.EMAIL_FROM || 'no-reply@oneworld.ge',
            subject: ka ? 'მადლობა თქვენი მოთხოვნისთვის — One World' : 'Thank you for your enquiry — One World',
            text: ka
              ? `გამარჯობა ${doc.name},\n\nმადლობა One World-თან დაკავშირებისთვის. ჩვენი გუნდი მალე დაგიკავშირდებათ.\n\nპატივისცემით,\nOne World × Cambridge International College`
              : `Hello ${doc.name},\n\nThank you for contacting One World. Our team will be in touch with you shortly.\n\nBest regards,\nOne World × Cambridge International College`,
          })
        } catch (err) {
          req.payload.logger.error({ err }, 'Enquiry acknowledgement email failed')
        }
      },
    ],
  },
}
