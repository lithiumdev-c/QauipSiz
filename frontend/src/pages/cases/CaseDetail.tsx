import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { casesApi } from '@/api/cases'
import { peopleApi } from '@/api/people'
import { videosApi } from '@/api/videos'
import { ApiError } from '@/api/client'
import type { Person, Video } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogClose, ConfirmDialog } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatDuration } from '@/lib/utils'

function NewPersonDialog({
  open,
  onOpenChange,
  caseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: number
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      peopleApi.create(caseId, {
        name: name.trim(),
        date_of_birth: dob || null,
        description: description.trim() || null,
      }),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ['people', caseId] })
      toast.success(`Person "${person.name}" added`)
      onOpenChange(false)
      setName('')
      setDob('')
      setDescription('')
      setError(null)
    },
    onError: (err) => setError(err instanceof ApiError ? err.detail : 'Could not add the person.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Add person"
          description="Persons of interest are matched against detections during video processing."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            createMutation.mutate()
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="person-name">Name</Label>
            <Input
              id="person-name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="person-dob">
              Date of birth <span className="text-dim normal-case">(optional)</span>
            </Label>
            <Input id="person-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="person-desc">
              Description <span className="text-dim normal-case">(optional)</span>
            </Label>
            <Textarea
              id="person-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Physical description, last known location…"
              className="mt-2"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-3 py-2 text-sm text-rec">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={createMutation.isPending}>
              Add person
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PersonRow({ person, isAdmin }: { person: Person; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photoMutation = useMutation({
    mutationFn: (file: File) => peopleApi.uploadPhoto(person.id, file),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['people', person.case_id] })
      toast.success(updated.photo_url ? 'Reference photo updated' : 'Reference photo uploaded')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Photo upload failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => peopleApi.remove(person.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people', person.case_id] })
      toast.success(`Person "${person.name}" removed`)
      setConfirmOpen(false)
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Could not remove the person.'),
  })

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-medium text-fg">{person.name}</p>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase ${
              person.photo_url
                ? 'border-status-approved/30 bg-status-approved/10 text-status-approved'
                : 'border-status-pending/30 bg-status-pending/10 text-status-pending'
            }`}
          >
            {person.photo_url ? 'photo on file' : 'no photo'}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-dim">
          person #{person.id}
          {person.date_of_birth ? ` · born ${formatDate(person.date_of_birth)}` : ''}
        </p>
        {person.description && (
          <p className="mt-1 line-clamp-1 max-w-lg text-xs leading-relaxed text-muted">{person.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) photoMutation.mutate(file)
            e.target.value = ''
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          loading={photoMutation.isPending}
        >
          {person.photo_url ? 'Replace photo' : 'Upload photo'}
        </Button>
        {isAdmin && (
          <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
            Remove
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove ${person.name}?`}
        description="Videos already processed with this person's reference photo are not affected, but future processing runs will skip them."
        confirmLabel="Remove person"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </li>
  )
}

function UploadVideoButton({ caseId }: { caseId: number }) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => videosApi.upload(caseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', caseId] })
      toast.success('Video uploaded')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Upload failed.'),
  })

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadMutation.mutate(file)
          e.target.value = ''
        }}
      />
      <Button onClick={() => fileInputRef.current?.click()} loading={uploadMutation.isPending}>
        Upload video
      </Button>
    </>
  )
}

function VideoRow({ video, isAdmin }: { video: Video; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => videosApi.remove(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', video.case_id] })
      toast.success('Video deleted')
      setConfirmOpen(false)
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Could not delete the video.'),
  })

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <button
        type="button"
        onClick={() => navigate(`/app/cases/${video.case_id}/videos/${video.id}`)}
        className="min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-bright"
      >
        <p className="text-sm font-medium text-fg transition-colors hover:text-violet-bright">
          <span className="font-mono text-[11px] text-dim">video #{video.id}</span>{' '}
          {video.file_path.split('/').pop()}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-dim">
          {formatDuration(video.duration)} · uploaded by user #{video.uploaded_by}
        </p>
      </button>

      <div className="flex items-center gap-3">
        <StatusBadge status={video.status} />
        {isAdmin && (
          <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete video #${video.id}?`}
        description="Detections and matches generated from this video will be removed from the database. This cannot be undone."
        confirmLabel="Delete video"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </li>
  )
}

export default function CaseDetail() {
  const { caseId } = useParams()
  const { orgRole } = useAuth()
  const id = Number(caseId)

  const { data: caseData, isLoading, isError, error } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesApi.get(id),
    enabled: Number.isFinite(id),
  })

  const peopleQuery = useQuery({
    queryKey: ['people', id],
    queryFn: () => peopleApi.list(id),
    enabled: caseData !== undefined,
  })

  const videosQuery = useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosApi.list(id),
    enabled: caseData !== undefined,
  })

  const [personDialogOpen, setPersonDialogOpen] = useState(false)
  const isAdmin = orgRole === 'admin'

  if (isLoading) return <LoadingState label="Loading case" />
  if (isError || !caseData) {
    return (
      <ErrorState
        detail={error instanceof Error ? error.message : 'Case not found'}
      />
    )
  }

  const people = peopleQuery.data ?? []
  const videos = videosQuery.data ?? []

  return (
    <>
      <PageHeader
        label={`Case #${caseData.id}`}
        title={caseData.title}
        description={caseData.description ?? undefined}
        actions={<StatusBadge status={caseData.status} />}
      />

      <Tabs defaultValue="people">
        <TabsList>
          <TabsTrigger value="people">People ({people.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          {peopleQuery.isLoading ? (
            <LoadingState />
          ) : peopleQuery.isError ? (
            <ErrorState detail="Failed to load people" onRetry={() => peopleQuery.refetch()} />
          ) : people.length === 0 ? (
            <EmptyState
              title="No persons in this case"
              description="Add the persons you're looking for, then upload a reference photo for each — processing matches detections against these photos."
              action={{ label: 'Add person', onClick: () => setPersonDialogOpen(true) }}
            />
          ) : (
            <ul className="divide-y divide-line-soft rounded-[10px] border border-line-soft bg-panel px-5">
              {people.map((p) => (
                <PersonRow key={p.id} person={p} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {videosQuery.isLoading ? (
            <LoadingState />
          ) : videosQuery.isError ? (
            <ErrorState detail="Failed to load videos" onRetry={() => videosQuery.refetch()} />
          ) : videos.length === 0 ? (
            <EmptyState
              title="No footage in this case"
              description="Upload camera footage (MP4, WebM, or QuickTime). After processing, potential matches appear for human review."
            />
          ) : (
            <ul className="divide-y divide-line-soft rounded-[10px] border border-line-soft bg-panel px-5">
              {videos.map((v) => (
                <VideoRow key={v.id} video={v} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <NewPersonDialog open={personDialogOpen} onOpenChange={setPersonDialogOpen} caseId={id} />

      {/* Upload action lives with the videos tab context — placed here for MVP simplicity */}
      <div className="mt-6 flex justify-end">
        <UploadVideoButton caseId={id} />
      </div>
    </>
  )
}
