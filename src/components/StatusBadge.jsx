const STYLES = {
  Processing: 'bg-sea-500/10 text-sea-600 ring-sea-500/20',
  Approved: 'bg-ok/10 text-ok ring-ok/20',
  Rejected: 'bg-warn/10 text-warn ring-warn/20'
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STYLES[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  )
}
