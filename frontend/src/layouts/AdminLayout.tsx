import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Inbox, Building2, Users, LogOut, Menu, X } from 'lucide-react'

import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin/requests', label: 'Requests', icon: Inbox },
  { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { me, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-line-soft px-5">
        <Logo size={26} />
      </div>

      <p className="px-3 pb-2 pt-5 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
        Platform
      </p>
      <nav aria-label="Platform admin" className="px-3">
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
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
                <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-line-soft p-3">
        <div className="rounded-md bg-panel-raised px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-fg">{me?.username}</p>
            <span className="shrink-0 font-mono text-[9px] tracking-[0.14em] text-blue-bright uppercase">
              admin
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">Platform administration</p>
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

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line-soft bg-panel lg:flex">
        <SidebarContent />
      </aside>

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

      <main className="min-w-0 flex-1 pt-14 lg:pt-0 lg:pl-60">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 lg:py-10">
          <div className="mb-8 flex items-center justify-between border-b border-line-soft pb-4">
            <p className="font-mono text-[10px] tracking-[0.22em] text-blue-bright uppercase">
              Platform administration
            </p>
            <span className="font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
              restricted area
            </span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
