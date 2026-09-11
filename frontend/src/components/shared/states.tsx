import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}) {
  return (
    <div className={cn('relative rounded-[10px] border border-line-soft bg-panel p-10', className)}>
      <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-violet/50" />
      <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-t border-r border-violet/50" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-violet/50" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-violet/50" />
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <span aria-hidden="true" className="mb-4 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
          no data
        </span>
        <h3 className="text-[15px] font-medium text-fg">{title}</h3>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
        {action && (
          <Button size="sm" className="mt-5" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export function ErrorState({
  detail,
  onRetry,
  className,
}: {
  detail: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('rounded-[10px] border border-rec/30 bg-rec/5 p-8 text-center', className)}>
      <span className="font-mono text-[10px] tracking-[0.22em] text-rec uppercase">error</span>
      <p className="mt-3 text-sm text-fg">{detail}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function LoadingState({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 p-10', className)}>
      <span
        aria-hidden="true"
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-bright border-t-transparent"
      />
      <span className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">{label}…</span>
    </div>
  )
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-panel-raised" />
      ))}
    </div>
  )
}
