import type { Access, FieldAccess } from 'payload'

// Collection-level: allow when the logged-in user has the `admin` role.
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

// Field-level variant (e.g. lock the `role` field so only admins can change it).
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'
