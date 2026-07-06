import type { Access } from 'payload'

// Collection-level: allow any authenticated staff member (admin or staff).
export const isStaff: Access = ({ req }) => Boolean(req.user)
