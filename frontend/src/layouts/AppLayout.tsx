import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  LayoutGrid,
  FolderSearch,
  Crosshair,
  Building2,
  UserCircle2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutGrid
}

/** Shared navigation column — rendered inside both the desktop rail and the mobile drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { me, logout, orgRole } = useAuth()
  const navigate = useNavigate()

  const workspace: NavItem[] = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/cases', label: 'Cases', icon: FolderSearch },
    { to: '/app/matches', label: 'Matches', icon: Crosshair },
  ]
  const org: NavItem[] = [{ to: '/app/organization', label: 'Organization', icon: Building2 }]
  const account: NavItem[] = [{ to: '/app/profile', label: 'Profile', icon: UserCircle2 }]

  function renderNav(items: NavItem[], section: string) {
    return (
      <nav aria-label={section}>
        <p className="px-3 pb-2 pt-5 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
          {section}
        </p>
        <ul className="space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-panel-raised text-fg shadow-[inset_2px_0_0_0_var(--color-violet)]'
                      : 'text-muted hover:bg-panel-raised/60 hover:text-fg',
                  )
                }
              >
                <Icon size={15} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-line-soft px-5">
        <Logo size={26} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {renderNav(workspace, 'Workspace')}
        {me?.organization && renderNav(org, 'Organization')}
        {renderNav(account, 'Account')}
      </div>

      <div className="border-t border-line-soft p-3">
        <div className="rounded-md bg-panel-raised px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-fg">{me?.username}</p>
            {orgRole && (
              <span className="shrink-0 font-mono text-[9px] tracking-[0.14em] text-violet-bright uppercase">
                {orgRole}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {me?.organization ? me.organization.name : 'No organization'}
          </p>
          <button
            type="button"
            onClick={() => {
              logout()
              toast('Signed out')
              navigate('/login', { replace: true })
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-sm px-1 py-1.5 text-[13px] text-muted transition-colors hover:text-rec focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-bright"
          >
            <LogOut size={14} strokeWidth={1.75} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

export default function AppLayout() {
  const { me } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-ink">
      {/* ── Desktop sidebar (≥ lg) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line-soft bg-panel lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar + drawer (< lg) ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line-soft bg-panel px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition-colors hover:text-fg"
        >
          <Menu size={17} strokeWidth={1.75} />
        </button>
        <Logo size={22} />
        <span className="w-9" aria-hidden="true" />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-deep/80"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line-soft bg-panel">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-3 grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:text-fg"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Content ── */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 lg:pl-60">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 lg:py-10">
          {me?.organization ? (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
              <p className="text-sm text-muted">
                <span className="text-fg">{me.organization.name}</span>
                <span className="mx-2 text-dim">·</span>
                {me.organization.country}
              </p>
              <div className="flex items-center gap-3">
                <StatusBadge status={me.membership?.status ?? 'active'} />
                <span className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
                  org #{me.organization.id}
                </span>
              </div>
            </div>
          ) : null}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
