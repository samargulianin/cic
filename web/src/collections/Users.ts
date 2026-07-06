import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from '../access/isAdmin'

// Admin staff accounts (One World). Auth-enabled.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Admin', defaultColumns: ['name', 'email', 'role'] },
  auth: true,
  access: {
    // Only admins manage the roster; everyone can read the list (needed for the
    // Enquiries "assigned to" relationship picker). Users can update themselves.
    create: isAdmin,
    delete: isAdmin,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Admins can delete leads and manage users. Staff can read and work leads.',
      },
      // Only admins can change roles (a staffer can't promote themselves).
      access: { update: isAdminField, create: isAdminField },
    },
  ],
}
