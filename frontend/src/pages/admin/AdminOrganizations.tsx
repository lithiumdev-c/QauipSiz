import { useQuery, useQueryClient } from '@tanstack/react-query'

import { organizationsApi } from '@/api/organizations'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/shared/states'
import type { Organization } from '@/types'

export default function AdminOrganizations() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: organizationsApi.list,
  })

  const columns: Column<Organization>[] = [
    {
      key: 'name',
      header: 'Organization',
      render: (o) => <span className="font-medium text-fg">{o.name}</span>,
    },
    { key: 'country', header: 'Country', render: (o) => <span className="text-muted">{o.country}</span> },
    {
      key: 'id',
      header: 'ID',
      render: (o) => <span className="font-mono text-[12px] text-dim">#{o.id}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        label="Platform"
        title="Organizations"
        description="All organizations registered on the platform. Organizations are created through the request-approval workflow."
      />
      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : isError ? (
        <ErrorState
          detail={error instanceof Error ? error.message : 'Failed to load organizations'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] })}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(o) => o.id}
          empty={<EmptyState title="No organizations yet" description="Approved requests will create organizations." />}
        />
      )}
    </>
  )
}
