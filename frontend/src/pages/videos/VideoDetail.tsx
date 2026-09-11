import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { videosApi, detectionsApi } from '@/api/videos'
import { matchesApi } from '@/api/matches'
import { ApiError } from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MatchCard from '@/components/case/MatchCard'
import { cn, formatDuration } from '@/lib/utils'

export default function VideoDetail() {
  const { videoId, caseId } = useParams()
  const id = Number(videoId)
  const { orgRole } = useAuth()
  const queryClient = useQueryClient()

  const videoQuery = useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.get(id),
    enabled: Number.isFinite(id),
    // poll while processing so the status badge + process button un-freeze
    refetchInterval: (q) => (q.state.data?.status === 'processing' ? 3000 : false),
  })

  const matchesQuery = useQuery({
    queryKey: ['matches', 'video', id],
    queryFn: () => matchesApi.byVideo(id),
    enabled: videoQuery.data !== undefined,
  })

  const detectionsQuery = useQuery({
    queryKey: ['detections', id],
    queryFn: () => detectionsApi.list(id),
    enabled: videoQuery.data?.status === 'completed',
  })

  // Signed playback URL (1h validity)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    if (videoQuery.data) {
      videosApi
        .url(id)
        .then((res) => alive && setPlaybackUrl(res.url))
        .catch(() => alive && setPlaybackUrl(null))
    }
    return () => {
      alive = false
    }
  }, [id, videoQuery.data])

  const [processConfirm, setProcessConfirm] = useState(false)
  const processMutation = useMutation({
    mutationFn: () => videosApi.process(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] })
      queryClient.invalidateQueries({ queryKey: ['matches', 'video', id] })
      queryClient.invalidateQueries({ queryKey: ['detections', id] })
      queryClient.invalidateQueries({ queryKey: ['matches', 'org'] })
      toast.success('Processing completed')
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['video', id] })
      toast.error(err instanceof ApiError ? err.detail : 'Processing failed.')
    },
    onSettled: () => setProcessConfirm(false),
  })

  const video = videoQuery.data
  const matches = matchesQuery.data ?? []
  const detections = detectionsQuery.data ?? []
  const canReview = orgRole === 'admin'

  const detectionsByTime = useMemo(
    () => [...detections].sort((a, b) => a.timestamp - b.timestamp),
    [detections],
  )

  if (videoQuery.isLoading) return <LoadingState label="Loading video" />
  if (videoQuery.isError || !video) {
    return <ErrorState detail={videoQuery.error instanceof Error ? videoQuery.error.message : 'Video not found'} />
  }

  const processing = video.status === 'processing'
  const matchLabel = video.status === 'processing' ? 'Processing…' : undefined

  return (
    <>
      <PageHeader
        label={`Case #${caseId} · Video #${video.id}`}
        title="Video analysis"
        description={
          video.status === 'completed'
            ? 'Detections and potential matches below were produced by automated analysis and require human review.'
            : undefined
        }
        actions={
          <>
            <StatusBadge status={video.status} />
            {video.status === 'uploaded' && (
              <Button onClick={() => setProcessConfirm(true)}>Run processing</Button>
            )}
            {video.status === 'failed' && (
              <Button onClick={() => setProcessConfirm(true)}>Retry processing</Button>
            )}
          </>
        }
      />

      {/* ── Player ── */}
      <div className="relative overflow-hidden rounded-[10px] border border-line-soft bg-ink-deep">
        <div className="aspect-video w-full">
          {playbackUrl === null ? (
            <div className="grid h-full place-items-center">
              <p className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">
                {matchLabel ?? 'loading stream…'}
              </p>
            </div>
          ) : (
            <video controls preload="metadata" src={playbackUrl} className="h-full w-full object-contain">
              <track kind="captions" />
            </video>
          )}
        </div>
        {/* OSD row */}
        <div className="flex items-center justify-between border-t border-line-soft bg-panel px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
          <span>
            src {video.file_path.split('/').pop()?.slice(0, 24)}
          </span>
          <span className="flex items-center gap-4">
            {processing && (
              <span className="flex items-center gap-1.5 text-blue-bright">
                <span aria-hidden="true" className="animate-rec-blink inline-block h-1.5 w-1.5 rounded-full bg-blue-bright" />
                processing
              </span>
            )}
            <span>dur {formatDuration(video.duration)}</span>
            <span>
              {detections.length > 0 ? `${detections.length} detections` : 'no detections'}
            </span>
          </span>
        </div>
      </div>

      {/* ── Findings ── */}
      <div className="mt-8">
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">
              Potential matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="detections">
              Detections {video.status === 'completed' ? `(${detections.length})` : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            {matchesQuery.isLoading ? (
              <LoadingState />
            ) : matches.length === 0 ? (
              <EmptyState
                title={
                  processing
                    ? 'Processing in progress'
                    : video.status === 'completed'
                      ? 'No potential matches found'
                      : 'Not processed yet'
                }
                description={
                  processing
                    ? 'Detections are being compared against the reference photos in this case.'
                    : video.status === 'completed'
                      ? 'No detection reached the similarity threshold for any person in this case.'
                      : 'Run processing to compare footage against this case\u2019s persons of interest.'
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} canReview={canReview} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="detections">
            {video.status !== 'completed' ? (
              <EmptyState
                title="Detections appear after processing"
                description="Each row is a person detected in the footage — a bounding box at a moment in time."
              />
            ) : detectionsQuery.isLoading ? (
              <LoadingState />
            ) : detectionsByTime.length === 0 ? (
              <EmptyState title="No people detected in this footage" />
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-[10px] border border-line-soft bg-panel">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-panel-raised">
                    <tr>
                      {['Time', 'Confidence', 'Bounding box'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-dim uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detectionsByTime.map((d) => (
                      <tr key={d.id} className="border-t border-line-soft">
                        <td className="px-4 py-2 font-mono text-[12px] text-fg">{d.timestamp.toFixed(2)}s</td>
                        <td className="px-4 py-2">
                          <span
                            className={cn(
                              'font-mono text-[12px]',
                              d.confidence >= 0.8 ? 'text-status-approved' : 'text-status-pending',
                            )}
                          >
                            {(d.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-[11px] text-dim">
                          x{d.x1} y{d.y1} → x{d.x2} y{d.y2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-dim">
        Automated results are investigative leads, not identifications. Every potential match
        requires human review before it is treated as confirmed.{' '}
        <Link to={`/app/cases/${caseId}`} className="text-muted underline underline-offset-4 hover:text-fg">
          Back to case
        </Link>
      </p>

      <ConfirmDialog
        open={processConfirm}
        onOpenChange={setProcessConfirm}
        title={`Run processing on video #${video.id}?`}
        description="The footage is scanned for people and compared against reference photos in this case. This may take a while for long videos — the status badge updates when it finishes."
        confirmLabel="Run processing"
        loading={processMutation.isPending}
        onConfirm={() => processMutation.mutate()}
      />
    </>
  )
}
