import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orgRequestsApi } from '@/api/orgRequests'
import type { OrganizationRequest } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { cn, formatDate } from '@/lib/utils'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function AdminRequests() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('pending')
  const [action, setAction] = useState<{ kind: 'approve' | 'reject'; request: OrganizationRequest } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'org-requests'],
    queryFn: orgRequestsApi.list,
  })

  const decisionMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: 'approve' | 'reject'; id: number }) =>
      kind === 'approve' ? orgRequestsApi.approve(id) : orgRequestsApi.reject(id),
    onSuccess: (updated, { kind }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-requests'] })
      toast.success(
        kind === 'approve'
          ? `Approved — "${updated.name}" organization created`
          : `Rejected — "${updated.name}"`,
      )
      setAction(null)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Action failed')
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-requests'] })
      setAction(null)
    },
  })

  const rows = useMemo(() => {
    if (!data) return []
    return filter === 'all' ? data : data.filter((r) => r.status === filter)
  }, [data, filter])

  const pendingCount = data?.filter((r) => r.status === 'pending').length ?? 0

  const columns: Column<OrganizationRequest>[] = [
    {
      key: 'name',
      header: 'Organization',
      render: (r) => (
        <div>
          <p className="font-medium text-fg">{r.name}</p>
          <p className="mt-0.5 text-xs text-muted">{r.country}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Requester',
      render: (r) => (
        <div>
          <p className="text-fg">{r.user?.username ?? `user #${r.user_id}`}</p>
          {r.user?.email && <p className="mt-0.5 font-mono text-[11px] text-dim">{r.user.email}</p>}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Submitted',
      className: 'whitespace-nowrap',
      render: (r) => <span className="font-mono text-[12px] text-muted">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => setAction({ kind: 'approve', request: r })}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setAction({ kind: 'reject', request: r })}>
              Reject
            </Button>
          </div>
        ) : (
          <span className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">processed</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        label="Platform"
        title="Organization requests"
        description="Approving a request creates the organization and grants the requester administrator access to it."
      />

      <div className="mb-5 flex items-center gap-1.5">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
              filter === key
                ? 'border-violet/50 bg-violet/10 text-violet-bright'
                : 'border-line text-muted hover:border-line hover:text-fg',
            )}
          >
            {label}
            {key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-status-pending/15 px-1 text-[10px] text-status-pending">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load requests'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin', 'org-requests'] })}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          empty={
            <EmptyState
              title={filter === 'pending' ? 'No pending requests' : 'No requests found'}
              description={
                filter === 'pending'
                  ? 'The review queue is clear. New requests will appear here.'
                  : 'Try a different filter.'
              }
            />
          }
        />
      )}

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action?.kind === 'approve' ? `Approve "${action.request.name}"?` : `Reject "${action?.request.name}"?`
        }
        description={
          action?.kind === 'approve'
            ? `This creates the organization "${action.request.name}" (${action.request.country}) and grants ${action.request.user?.username ?? 'the requester'} administrator access to it.`
            : 'The requester will be able to submit a new request. No organization will be created.'
        }
        confirmLabel={action?.kind === 'approve' ? 'Approve' : 'Reject'}
        destructive={action?.kind === 'reject'}
        loading={decisionMutation.isPending}
        onConfirm={() =>
          action && decisionMutation.mutate({ kind: action.kind, id: action.request.id })
        }
      />
    </>
  )
}
