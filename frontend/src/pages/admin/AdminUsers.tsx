import { useQuery, useQueryClient } from '@tanstack/react-query'

import { usersApi } from '@/api/users'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/shared/states'
import { formatDate } from '@/lib/utils'
import type { AdminUser } from '@/types'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.list,
  })

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      header: 'User',
      render: (u) => (
        <div>
          <p className="font-medium text-fg">{u.username}</p>
          <p className="mt-0.5 font-mono text-[11px] text-dim">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span className={u.role === 'platform_admin' ? 'font-mono text-[12px] text-blue-bright' : 'font-mono text-[12px] text-muted'}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Registered',
      render: (u) => <span className="font-mono text-[12px] text-muted">{formatDate(u.created_at)}</span>,
    },
    { key: 'id', header: 'ID', render: (u) => <span className="font-mono text-[12px] text-dim">#{u.id}</span> },
  ]

  return (
    <>
      <PageHeader
        label="Platform"
        title="Users"
        description="All registered accounts. Platform roles are managed at the database level."
      />
      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load users'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(u) => u.id}
          empty={<EmptyState title="No users" />}
        />
      )}
    </>
  )
}
