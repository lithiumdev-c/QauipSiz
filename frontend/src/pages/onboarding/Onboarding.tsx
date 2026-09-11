import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orgRequestsApi } from '@/api/orgRequests'
import { ApiError } from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'

const COUNTRIES = [
  'Kazakhstan',
  'Uzbekistan',
  'Kyrgyzstan',
  'Tajikistan',
  'Turkmenistan',
  'Russia',
  'Turkey',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Other',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: myRequests } = useQuery({
    queryKey: ['org-requests', 'my'],
    queryFn: orgRequestsApi.my,
  })

  const latest = myRequests?.[0] ?? null

  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      orgRequestsApi.create({
        name: name.trim(),
        country,
        description: description.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-requests'] })
      toast.success('Request submitted for review')
      navigate('/app/onboarding/status')
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.detail : 'Could not submit the request.')
    },
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    createMutation.mutate()
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        label="Onboarding"
        title="Request organization access"
        description="Organizations are reviewed by the platform before workspaces are created. Approval typically creates a new organization with you as its administrator."
      />

      {latest && latest.status === 'pending' && (
        <div className="mb-6 rounded-md border border-status-pending/30 bg-status-pending/5 px-4 py-3 text-sm text-status-pending">
          You already have a pending request.{' '}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => navigate('/app/onboarding/status')}
          >
            View its status
          </button>
          .
        </div>
      )}
      {latest && latest.status === 'rejected' && (
        <div className="mb-6 rounded-md border border-status-rejected/30 bg-status-rejected/5 px-4 py-3 text-sm text-status-rejected">
          Your previous request was rejected. You can submit a revised request below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[10px] border border-line-soft bg-panel p-6">
        <div>
          <Label htmlFor="org-name">Organization name</Label>
          <input
            id="org-name"
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Regional Investigation Bureau"
            className="mt-2 w-full rounded-md border border-line bg-panel-raised px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
          />
        </div>

        <div>
          <Label htmlFor="org-country">Country</Label>
          <select
            id="org-country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-2 w-full appearance-none rounded-md border border-line bg-panel-raised px-4 py-3 text-[15px] text-fg transition-colors focus:border-violet focus:outline-none"
          >
            <option value="" disabled>
              Select a country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="org-desc">
            Description <span className="normal-case text-dim">(optional)</span>
          </Label>
          <Textarea
            id="org-desc"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the organization and its intended use of the system…"
            className="mt-2 bg-panel-raised"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-4 py-3 text-sm text-rec">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
            reviewed by platform admins
          </p>
          <Button type="submit" loading={createMutation.isPending}>
            Submit request
          </Button>
        </div>
      </form>

      {latest && (
        <div className="mt-6 flex items-center justify-between rounded-[10px] border border-line-soft bg-panel px-5 py-4">
          <p className="text-sm text-muted">Latest request — {latest.name}</p>
          <StatusBadge status={latest.status} />
        </div>
      )}
    </div>
  )
}
