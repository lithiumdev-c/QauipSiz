import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { orgRequestsApi } from '@/api/orgRequests'
import { formatDate } from '@/lib/utils'

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line-soft py-3 last:border-b-0">
      <dt className="font-mono text-[11px] tracking-[0.16em] text-dim uppercase">{label}</dt>
      <dd className={`text-sm text-fg ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</dd>
    </div>
  )
}

export default function Profile() {
  const { me } = useAuth()

  const { data: myRequests, isLoading, isError, error } = useQuery({
    queryKey: ['org-requests', 'my'],
    queryFn: orgRequestsApi.my,
  })

  const latestRequest = myRequests?.[0] ?? null

  return (
    <>
      <PageHeader
        label="Account"
        title="Profile"
        description="Your identity on the platform. Organization membership is granted after a platform admin approves a request."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── User identity ── */}
        <section className="rounded-[10px] border border-line-soft bg-panel p-6">
          <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">User</p>
          <dl>
            <Field label="Username" value={me?.username} mono />
            <Field label="Email" value={me?.email} />
            <Field
              label="Platform role"
              value={
                <span className={me?.role === 'platform_admin' ? 'text-blue-bright' : undefined}>
                  {me?.role}
                </span>
              }
              mono
            />
            <Field label="Member since" value={formatDate(me?.created_at)} mono />
          </dl>
        </section>

        {/* ── Organization membership ── */}
        <section className="rounded-[10px] border border-line-soft bg-panel p-6">
          <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
            Organization
          </p>

          {me?.organization && me.membership ? (
            <dl>
              <Field label="Name" value={me.organization.name} />
              <Field label="Country" value={me.organization.country} />
              <Field label="Org role" value={me.membership.role} mono />
              <Field
                label="Department"
                value={me.membership.department ? me.membership.department.name : '—'}
              />
              <Field label="Status" value={<StatusBadge status={me.membership.status} />} />
            </dl>
          ) : (
            <div className="rounded-md border border-line-soft bg-panel-raised p-5">
              <p className="text-sm text-fg">No organization yet</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                You don't belong to an organization. Request access to create one for your team,
                or wait to be added by an organization admin.
              </p>
              <div className="mt-4">
                {latestRequest && latestRequest.status === 'pending' ? (
                  <Link
                    to="/app/onboarding/status"
                    className="inline-flex h-8 items-center rounded-md border border-line bg-panel px-3 text-[13px] text-fg transition-colors hover:bg-panel-raised"
                  >
                    View request status
                  </Link>
                ) : (
                  <Link
                    to="/app/onboarding"
                    className="inline-flex h-8 items-center rounded-md bg-violet px-3 text-[13px] font-medium text-white transition-colors hover:bg-violet-bright"
                  >
                    Request organization access
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Request history ── */}
      <section className="mt-6 rounded-[10px] border border-line-soft bg-panel p-6">
        <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
          Organization requests
        </p>
        {isLoading ? (
          <LoadingState label="Loading requests" />
        ) : isError ? (
          <ErrorState detail={error instanceof Error ? error.message : 'Failed to load requests'} />
        ) : !myRequests || myRequests.length === 0 ? (
          <p className="py-2 text-sm text-muted">No requests submitted.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {myRequests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-fg">{r.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-dim">
                    {r.country} · {formatDate(r.created_at)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
