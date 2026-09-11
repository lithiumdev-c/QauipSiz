import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { matchesApi } from '@/api/matches'
import { ApiError } from '@/api/client'
import type { Match } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatSimilarity } from '@/lib/utils'

/** Signed-URL match frame with loading + error fallback. */
function FrameImage({ matchId, alt }: { matchId: number; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    matchesApi
      .frameUrl(matchId)
      .then((res) => alive && setUrl(res.url))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [matchId])

  if (failed)
    return (
      <div className="grid h-full place-items-center bg-ink-deep font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
        unavailable
      </div>
    )
  if (!url) return <div className="h-full w-full animate-pulse bg-ink-deep" />
  return <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
}

export default function MatchCard({ match, canReview }: { match: Match; canReview: boolean }) {
  const queryClient = useQueryClient()

  const reviewMutation = useMutation({
    mutationFn: (status: 'confirmed' | 'rejected') => matchesApi.updateStatus(match.id, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['matches', 'org'] })
      queryClient.invalidateQueries({ queryKey: ['matches', 'video', match.video_id] })
      toast.success(updated.status === 'confirmed' ? 'Match confirmed' : 'Match rejected')
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.detail : 'Review failed.'),
  })

  return (
    <div className="overflow-hidden rounded-[10px] border border-line-soft bg-panel">
      <div className="relative aspect-video bg-ink-deep">
        <FrameImage matchId={match.id} alt={`Match frame at ${match.timestamp.toFixed(1)}s`} />
        {/* corner brackets — the detection-reticle motif */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-violet-bright/80" />
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-t border-r border-violet-bright/80" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-violet-bright/80" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-violet-bright/80" />
        <span className="absolute bottom-2 left-2 font-mono text-[10px] tracking-[0.14em] text-white/70 uppercase">
          t+{match.timestamp.toFixed(1)}s
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg">Person #{match.person_id}</p>
          <StatusBadge status={match.status} />
        </div>
        <p className="mt-1 font-mono text-[11px] text-dim">
          video #{match.video_id} · similarity {formatSimilarity(match.similarity)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Potential match — requires human review. Similarity is not identification.
        </p>
        {canReview && match.status === 'pending_review' && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => reviewMutation.mutate('confirmed')}
              loading={reviewMutation.isPending && reviewMutation.variables === 'confirmed'}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => reviewMutation.mutate('rejected')}
              loading={reviewMutation.isPending && reviewMutation.variables === 'rejected'}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
