import type { ServerProps } from 'payload'

// Admin dashboard widget (beforeDashboard): quick pulse on the lead pipeline.
export default async function RecentLeads({ payload }: ServerProps) {
  if (!payload) return null

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [newLeads, weekLeads, overdue, recent] = await Promise.all([
    payload.count({ collection: 'enquiries', where: { status: { equals: 'new' } } }),
    payload.count({ collection: 'enquiries', where: { createdAt: { greater_than: weekAgo } } }),
    payload.count({
      collection: 'enquiries',
      where: {
        and: [
          { followUpDate: { less_than_equal: todayEnd.toISOString() } },
          { status: { not_in: ['enrolled', 'closed'] } },
        ],
      },
    }),
    payload.find({
      collection: 'enquiries',
      limit: 5,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const tile = (label: string, value: number, color: string) => (
    <div
      key={label}
      style={{
        flex: '1 1 120px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-100)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>{label}</div>
    </div>
  )

  return (
    <div style={{ margin: '0 0 24px' }}>
      <h3 style={{ margin: '0 0 12px' }}>Leads</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        {tile('New (unactioned)', newLeads.totalDocs, '#1e40af')}
        {tile('New this week', weekLeads.totalDocs, '#166534')}
        {tile('Follow-up due', overdue.totalDocs, '#92400e')}
      </div>
      {recent.docs.length > 0 && (
        <div
          style={{
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {recent.docs.map((d) => (
            <a
              key={d.id}
              href={`${serverUrl}/admin/collections/enquiries/${d.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 14px',
                borderTop: '1px solid var(--theme-elevation-100)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontWeight: 600 }}>{d.name || '—'}</span>
              <span style={{ color: 'var(--theme-elevation-600)' }}>{d.email}</span>
              <span style={{ textTransform: 'capitalize' }}>{d.status}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
