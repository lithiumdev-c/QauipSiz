import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { departmentsApi } from '@/api/departments'
import { membersApi } from '@/api/members'
import { usersApi } from '@/api/users'
import { ApiError } from '@/api/client'
import type { Department, OrganizationMember } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogClose, ConfirmDialog } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'

function DepartmentRow({ dept, isAdmin }: { dept: Department; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => departmentsApi.remove(dept.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(`Department "${dept.name}" deleted`)
      setConfirmOpen(false)
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Could not delete the department.'),
  })

  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm text-fg">{dept.name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-dim">department #{dept.id}</p>
      </div>
      {isAdmin && (
        <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${dept.name}"?`}
        description="Cases currently assigned to this department are not removed, but new cases cannot be created for it."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </li>
  )
}

function MemberRow({ member, isAdmin }: { member: OrganizationMember; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const removeMutation = useMutation({
    mutationFn: () => membersApi.remove(member.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member removed')
      setConfirmOpen(false)
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.detail : 'Could not remove the member.'),
  })

  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm text-fg">User #{member.user_id}</p>
        <p className="mt-0.5 font-mono text-[11px] text-dim">
          {member.role} · {member.status}
          {member.department_id ? ` · dept #${member.department_id}` : ''}
        </p>
      </div>
      {isAdmin && member.status === 'active' && (
        <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
          Remove
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove member #${member.user_id}?`}
        description="The user loses access to this organization's workspace. They can be re-added later."
        confirmLabel="Remove member"
        destructive
        loading={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
      />
    </li>
  )
}

export default function OrganizationPage() {
  const { me, orgId, orgRole } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = orgRole === 'admin'

  const deptsQuery = useQuery({
    queryKey: ['departments', orgId],
    queryFn: () => departmentsApi.list(orgId!),
    enabled: orgId !== null,
  })
  const membersQuery = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => membersApi.list(orgId!),
    enabled: orgId !== null,
  })

  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [deptName, setDeptName] = useState('')
  const [deptError, setDeptError] = useState<string | null>(null)

  const createDeptMutation = useMutation({
    mutationFn: () => departmentsApi.create(orgId!, { name: deptName.trim() }),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(`Department "${d.name}" created`)
      setDeptDialogOpen(false)
      setDeptName('')
      setDeptError(null)
    },
    onError: (err) =>
      setDeptError(err instanceof ApiError ? err.detail : 'Could not create the department.'),
  })

  // add-member flow: choose from platform users (admin-only data source)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const { data: _users } = useQuery({
    queryKey: ['platform-users'],
    queryFn: usersApi.list,
    enabled: false, // fetched on demand — admin-only endpoint
  })
  const [userIdInput, setUserIdInput] = useState('')
  const [memberError, setMemberError] = useState<string | null>(null)

  const addMemberMutation = useMutation({
    mutationFn: () => membersApi.create({ user_id: Number(userIdInput), organization_id: orgId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member added')
      setMemberDialogOpen(false)
      setUserIdInput('')
      setMemberError(null)
    },
    onError: (err) =>
      setMemberError(err instanceof ApiError ? err.detail : 'Could not add the member.'),
  })

  return (
    <>
      <PageHeader
        label="Organization"
        title={me?.organization?.name ?? 'Organization'}
        description={
          me?.organization
            ? `${me.organization.country} · organization #${me.organization.id}`
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Departments ── */}
        <section className="rounded-[10px] border border-line-soft bg-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.22em] text-dim uppercase">Departments</p>
            {isAdmin && (
              <Button size="sm" variant="secondary" onClick={() => setDeptDialogOpen(true)}>
                New department
              </Button>
            )}
          </div>
          {deptsQuery.isLoading ? (
            <LoadingState />
          ) : deptsQuery.isError ? (
            <ErrorState detail="Failed to load departments" onRetry={() => deptsQuery.refetch()} />
          ) : !deptsQuery.data || deptsQuery.data.length === 0 ? (
            <EmptyState
              title="No departments"
              description={
                isAdmin
                  ? 'Departments group cases inside your organization. Create at least one to open cases.'
                  : 'An organization admin needs to create a department before cases can be opened.'
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {deptsQuery.data.map((d) => (
                <DepartmentRow key={d.id} dept={d} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </section>

        {/* ── Members ── */}
        <section className="rounded-[10px] border border-line-soft bg-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.22em] text-dim uppercase">Members</p>
            {isAdmin && (
              <Button size="sm" variant="secondary" onClick={() => setMemberDialogOpen(true)}>
                Add member
              </Button>
            )}
          </div>
          {membersQuery.isLoading ? (
            <LoadingState />
          ) : membersQuery.isError ? (
            <ErrorState detail="Failed to load members" onRetry={() => membersQuery.refetch()} />
          ) : !membersQuery.data || membersQuery.data.length === 0 ? (
            <EmptyState title="No members" description="Approved organization requests add their requester automatically." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {membersQuery.data.map((m) => (
                <MemberRow key={m.id} member={m} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── New department dialog ── */}
      <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <DialogContent>
          <DialogHeader
            title="New department"
            description="Cases belong to departments. Common examples: field operations, analytics, regional units."
          />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setDeptError(null)
              createDeptMutation.mutate()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                required
                maxLength={100}
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Field operations"
                className="mt-2"
              />
            </div>
            {deptError && (
              <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-3 py-2 text-sm text-rec">
                {deptError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" loading={createDeptMutation.isPending}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add member dialog ── */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader
            title="Add member"
            description="Enter the platform user ID of the person to add. They must already have a QauipSiz account."
          />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setMemberError(null)
              addMemberMutation.mutate()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="member-uid">User ID</Label>
              <Input
                id="member-uid"
                type="number"
                required
                min={1}
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="e.g. 5"
                className="mt-2"
              />
            </div>
            {memberError && (
              <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-3 py-2 text-sm text-rec">
                {memberError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" loading={addMemberMutation.isPending}>Add member</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
