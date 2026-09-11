import { cn } from '@/lib/utils'

export type StatusToken =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'uploaded'
  | 'active'
  | 'pending_review'
  | 'confirmed'
  | 'neutral'

const STATUS_MAP: Record<string, { label: string; token: StatusToken }> = {
  pending: { label: 'Pending', token: 'pending' },
  approved: { label: 'Approved', token: 'approved' },
  rejected: { label: 'Rejected', token: 'rejected' },
  processing: { label: 'Processing', token: 'processing' },
  completed: { label: 'Completed', token: 'completed' },
  failed: { label: 'Failed', token: 'failed' },
  uploaded: { label: 'Uploaded', token: 'uploaded' },
  active: { label: 'Active', token: 'active' },
  pending_review: { label: 'Review required', token: 'pending_review' },
  confirmed: { label: 'Confirmed', token: 'confirmed' },
  open: { label: 'Open', token: 'active' },
}

const TOKEN_STYLES: Record<StatusToken, string> = {
  pending: 'border-status-pending/30 bg-status-pending/10 text-status-pending',
  approved: 'border-status-approved/30 bg-status-approved/10 text-status-approved',
  rejected: 'border-status-rejected/30 bg-status-rejected/10 text-status-rejected',
  processing: 'border-status-processing/30 bg-status-processing/10 text-status-processing',
  completed: 'border-violet-bright/30 bg-violet/10 text-violet-bright',
  failed: 'border-status-rejected/30 bg-status-rejected/10 text-status-rejected',
  uploaded: 'border-blue/30 bg-blue/10 text-blue-bright',
  active: 'border-status-approved/30 bg-status-approved/10 text-status-approved',
  pending_review: 'border-status-pending/30 bg-status-pending/10 text-status-pending',
  confirmed: 'border-status-approved/30 bg-status-approved/10 text-status-approved',
  neutral: 'border-line bg-panel-raised text-muted',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const mapped = STATUS_MAP[status] ?? { label: status, token: 'neutral' as StatusToken }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase',
        TOKEN_STYLES[mapped.token],
        className,
      )}
    >
      <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-current" />
      {mapped.label}
    </span>
  )
}
