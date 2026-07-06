'use client'

import type { DefaultCellComponentProps } from 'payload'

const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  new: { bg: '#e0edff', fg: '#1e40af', label: 'New' },
  contacted: { bg: '#fef3c7', fg: '#92400e', label: 'Contacted' },
  enrolled: { bg: '#dcfce7', fg: '#166534', label: 'Enrolled' },
  closed: { bg: '#e5e7eb', fg: '#4b5563', label: 'Closed' },
}

// List-view cell: renders the enquiry status as a colored pill.
export default function StatusCell({ cellData }: DefaultCellComponentProps) {
  const key = typeof cellData === 'string' ? cellData : 'new'
  const s = STYLES[key] ?? STYLES.new
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.6,
        backgroundColor: s.bg,
        color: s.fg,
      }}
    >
      {s.label}
    </span>
  )
}
