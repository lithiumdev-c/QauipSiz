import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/useAuth'
import { casesApi } from '@/api/cases'
import { matchesApi } from '@/api/matches'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatSimilarity } from '@/lib/utils'

interface Metric {
  label: string
  value: number | null
  hint?: string
  to?: string
}

function MetricCard({ label, value, hint, to }: Metric) {
  const body = (
    <>
      <p className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">{label}</p>
      <p className="mt-3 text-3xl font-medium tracking-tight text-fg">
        {value === null ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded bg-panel-raised" />
        ) : (
          value
        )}
      </p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </>
  )

  return to ? (
    <Link
      to={to}
      className="block rounded-[10px] border border-line-soft bg-panel p-5 transition-colors hover:border-violet/40 hover:bg-panel-raised"
    >
      {body}
    </Link>
  ) : (
    <div className="rounded-[10px] border border-line-soft bg-panel p-5">{body}</div>
  )
}

export default function Dashboard() {
  const { me, orgId, orgRole } = useAuth()

  const casesQuery = useQuery({
    queryKey: ['cases', orgId],
    queryFn: () => casesApi.list(orgId!),
    enabled: orgId !== null,
  })
  const matchesQuery = useQuery({
    queryKey: ['matches', 'org', orgId],
    queryFn: () => matchesApi.byOrganization(orgId!),
    enabled: orgId !== null,
  })

  const openCases = casesQuery.data?.filter((c) => c.status === 'open') ?? null
  const pendingMatches = matchesQuery.data?.filter((m) => m.status === 'pending_review') ?? null
  const recentCases = [...(casesQuery.data ?? [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
  const topMatches = [...(matchesQuery.data ?? [])]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)

  const loading = casesQuery.isLoading || matchesQuery.isLoading

  return (
    <>
      <PageHeader
        label="Workspace"
        title={`Welcome, ${me?.username}`}
        description={`Overview of ${me?.organization?.name ?? 'your organization'}.`}
      />

      {loading ? (
        <LoadingState label="Loading workspace" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Open cases"
              value={openCases ? openCases.length : null}
              to="/app/cases"
              hint={`${casesQuery.data?.length ?? 0} total`}
            />
            <MetricCard
              label="Matches to review"
              value={pendingMatches ? pendingMatches.length : null}
              to="/app/matches"
              hint={pendingMatches?.length ? 'human review required' : 'queue clear'}
            />
            <MetricCard
              label="Potential matches"
              value={matchesQuery.data ? matchesQuery.data.length : null}
              hint="all time"
            />
            <MetricCard
              label="Your role"
              value={null}
              hint={orgRole ?? undefined}
            />
          </div>

          {/* role card replaced by text — handled above via hint */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* ── Recent cases ── */}
            <section className="rounded-[10px] border border-line-soft bg-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
                  Recent cases
                </p>
                <Link to="/app/cases" className="text-xs text-violet-bright hover:underline">
                  View all
                </Link>
              </div>
              {recentCases.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  No cases yet.{' '}
                  {orgRole === 'admin' ? 'Create the first one from Cases.' : 'Cases will appear here once created.'}
                </p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {recentCases.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/app/cases/${c.id}`}
                        className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-violet-bright"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-fg">{c.title}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-dim">
                            case #{c.id} · dept #{c.department_id}
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── Strongest potential matches ── */}
            <section className="rounded-[10px] border border-line-soft bg-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
                  Strongest potential matches
                </p>
                <Link to="/app/matches" className="text-xs text-violet-bright hover:underline">
                  Review queue
                </Link>
              </div>
              {topMatches.length === 0 ? (
                <p className="py-6 text-center text-sm leading-relaxed text-muted">
                  No potential matches yet. Upload a video to a case and run processing to
                  generate detections and matches.
                </p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {topMatches.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-fg">
                          Person #{m.person_id} · video #{m.video_id}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-dim">
                          similarity {formatSimilarity(m.similarity)} · {m.timestamp.toFixed(1)}s
                        </p>
                      </div>
                      <StatusBadge status={m.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  )
}
