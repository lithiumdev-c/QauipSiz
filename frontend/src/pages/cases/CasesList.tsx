import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { casesApi } from '@/api/cases'
import { departmentsApi } from '@/api/departments'
import type { Case } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogClose } from '@/components/ui/dialog'
import { Label, Input, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function NewCaseDialog({
  open,
  onOpenChange,
  orgId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: number
}) {
  const queryClient = useQueryClient()
  const { data: departments } = useQuery({
    queryKey: ['departments', orgId],
    queryFn: () => departmentsApi.list(orgId),
    enabled: open,
  })

  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () => casesApi.create(orgId, Number(departmentId), { title: title.trim(), description: description.trim() || null }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['cases', orgId] })
      toast.success(`Case "${created.title}" created`)
      onOpenChange(false)
      setTitle('')
      setDepartmentId(null)
      setDescription('')
      setError(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not create the case.'),
  })

  const noDepartments = departments !== undefined && departments.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="New case"
          description="Cases organize the people and videos under investigation."
        />
        {noDepartments ? (
          <div className="rounded-md border border-line-soft bg-panel p-4 text-sm leading-relaxed text-muted">
            Your organization has no departments yet. Create one first from the Organization page —
            every case belongs to a department.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!departmentId) {
                setError('Choose a department.')
                return
              }
              setError(null)
              createMutation.mutate()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="case-title">Title</Label>
              <Input
                id="case-title"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Missing person — central district"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="case-dept">Department</Label>
              <Select value={departmentId ?? undefined} onValueChange={setDepartmentId}>
                <SelectTrigger id="case-dept" className="mt-2">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="case-desc">
                Description <span className="text-dim normal-case">(optional)</span>
              </Label>
              <Textarea
                id="case-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Context for investigators…"
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
                Create case
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function CasesList() {
  const { orgId, orgRole } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cases', orgId],
    queryFn: () => casesApi.list(orgId!),
    enabled: orgId !== null,
  })

  const columns: Column<Case>[] = [
    {
      key: 'title',
      header: 'Case',
      render: (c) => (
        <div>
          <p className="font-medium text-fg">{c.title}</p>
          {c.description && <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted">{c.description}</p>}
        </div>
      ),
    },
    { key: 'id', header: 'ID', render: (c) => <span className="font-mono text-[12px] text-dim">#{c.id}</span> },
    { key: 'dept', header: 'Department', render: (c) => <span className="font-mono text-[12px] text-muted">#{c.department_id}</span> },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  ]

  const isAdmin = orgRole === 'admin'

  return (
    <>
      <PageHeader
        label="Workspace"
        title="Cases"
        description="Each case holds the persons of interest and the video footage analyzed for them."
        actions={isAdmin ? <Button onClick={() => setDialogOpen(true)}>New case</Button> : undefined}
      />
      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load cases'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['cases', orgId] })}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/app/cases/${c.id}`)}
          empty={
            <EmptyState
              title="No cases yet"
              description={
                isAdmin
                  ? 'Create your first case to start adding persons and footage.'
                  : 'Cases will appear here once an organization admin creates them.'
              }
              action={isAdmin ? { label: 'New case', onClick: () => setDialogOpen(true) } : undefined}
            />
          }
        />
      )}
      {orgId !== null && <NewCaseDialog open={dialogOpen} onOpenChange={setDialogOpen} orgId={orgId} />}
    </>
  )
}
