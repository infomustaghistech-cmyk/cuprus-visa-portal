const STYLES = {
  Pending: 'bg-amber-500/10 text-amber-700 ring-amber-500/30',
  'Under Review': 'bg-sky-500/10 text-sky-700 ring-sky-500/30',
  Processing: 'bg-blue-500/10 text-blue-700 ring-blue-500/30',
  Approved: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30',
  Rejected: 'bg-rose-500/10 text-rose-700 ring-rose-500/30'
}

export default function StatusBadge({ status = 'Pending' }) {
  const badgeStyle = STYLES[status] || STYLES.Pending

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeStyle}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      {status}
    </span>
  )
}
