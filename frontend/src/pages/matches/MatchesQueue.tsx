import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/hooks/useAuth'
import { matchesApi } from '@/api/matches'
import type { Match } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states'
import MatchCard from '@/components/case/MatchCard'

export default function MatchesQueue() {
  const { orgId, orgRole } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['matches', 'org', orgId],
    queryFn: () => matchesApi.byOrganization(orgId!),
    enabled: orgId !== null,
  })

  const pending = data?.filter((m) => m.status === 'pending_review') ?? []

  return (
    <>
      <PageHeader
        label="Workspace"
        title="Match review"
        description={
          orgRole === 'admin'
            ? 'Potential matches across all cases, ordered by most recent. Confirm or reject each one after examining the frame.'
            : 'Potential matches across all cases. Confirming and rejecting is restricted to organization admins.'
        }
      />

      {isLoading ? (
        <LoadingState label="Loading matches" />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load matches'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['matches', 'org', orgId] })}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No potential matches yet"
          description="Matches appear here after a video is processed. Each one pairs a detected person in footage with a reference photo from a case."
        />
      ) : (
        <>
          {pending.length > 0 && (
            <p className="mb-5 font-mono text-[11px] tracking-[0.16em] text-status-pending uppercase">
              {pending.length} awaiting review
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((m: Match) => (
              <MatchCard key={m.id} match={m} canReview={orgRole === 'admin'} />
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-xs leading-relaxed text-dim">
        Similarity scores are similarity between a detection and a reference photo — they are
        never a definitive identification.
      </p>
    </>
  )
}
