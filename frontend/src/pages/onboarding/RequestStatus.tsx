import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { orgRequestsApi } from '@/api/orgRequests'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export default function RequestStatus() {
  const { refreshMe, me } = useAuth()
  const queryClient = useQueryClient()

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['org-requests', 'my'],
    queryFn: orgRequestsApi.my,
  })

  // If a request was approved since we last checked /auth/me, refresh identity.
  useEffect(() => {
    if (!me?.organization && requests?.some((r) => r.status === 'approved')) {
      void refreshMe().then(() => queryClient.invalidateQueries())
    }
  }, [requests, me, refreshMe, queryClient])

  const latest = requests?.[0] ?? null

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        label="Onboarding"
        title="Request status"
        description="Each request is reviewed by a platform administrator. You'll gain access to the organization workspace as soon as it's approved."
      />

      {isLoading ? (
        <LoadingState label="Loading" />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load your requests'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['org-requests', 'my'] })}
        />
      ) : !latest ? (
        <div className="rounded-[10px] border border-line-soft bg-panel p-8 text-center">
          <p className="text-sm text-muted">No requests yet.</p>
          <Link
            to="/app/onboarding"
            className="mt-4 inline-flex h-8 items-center rounded-md bg-violet px-3 text-[13px] font-medium text-white transition-colors hover:bg-violet-bright"
          >
            Request organization access
          </Link>
        </div>
      ) : (
        <div className="rounded-[10px] border border-line-soft bg-panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-fg">{latest.name}</p>
              <p className="mt-1 font-mono text-[11px] text-dim">
                {latest.country} · submitted {formatDateTime(latest.created_at)}
              </p>
            </div>
            <StatusBadge status={latest.status} />
          </div>

          {latest.description && (
            <p className="mt-4 rounded-md bg-panel-raised p-4 text-sm leading-relaxed text-muted">
              {latest.description}
            </p>
          )}

          <div className="mt-6 border-t border-line-soft pt-5">
            {latest.status === 'pending' && (
              <p className="text-sm leading-relaxed text-muted">
                Your request is in the review queue. This page updates automatically when the
                decision is made — you can also check back after signing in again.
              </p>
            )}
            {latest.status === 'approved' && (
              <div>
                <p className="text-sm leading-relaxed text-status-approved">
                  Approved — your organization workspace is ready.
                </p>
                {me?.organization && (
                  <Link
                    to="/app/dashboard"
                    className="mt-4 inline-flex h-9 items-center rounded-md bg-violet px-4 text-sm font-medium text-white transition-colors hover:bg-violet-bright"
                  >
                    Open workspace
                  </Link>
                )}
              </div>
            )}
            {latest.status === 'rejected' && (
              <div>
                <p className="text-sm leading-relaxed text-status-rejected">
                  This request was not approved. You can submit a revised request with more
                  detail about your organization.
                </p>
                <Link
                  to="/app/onboarding"
                  className="mt-4 inline-flex h-9 items-center rounded-md border border-line bg-panel px-4 text-sm text-fg transition-colors hover:bg-panel-raised"
                >
                  New request
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
