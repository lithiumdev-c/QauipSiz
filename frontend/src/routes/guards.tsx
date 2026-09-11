import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink">
      <div className="relative border border-line-soft bg-panel px-14 py-10">
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t border-l border-violet/60" />
        <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-t border-r border-violet/60" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-violet/60" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-violet/60" />
        <p className="crt-wordmark relative text-center text-lg font-semibold tracking-[0.3em] uppercase">
          QauipSiz
        </p>
        <div className="mt-5 h-px w-40 overflow-hidden bg-line">
          <div className="animate-boot-bar h-full w-full origin-left bg-violet" />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
          Authenticating
        </p>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { phase } = useAuth()
  const location = useLocation()

  if (phase === 'boot') return <BootScreen />
  if (phase === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Requires role === 'platform_admin'. UX gating only — backend enforces the real rules. */
export function AdminRoute() {
  const { phase, me, isPlatformAdmin } = useAuth()

  if (phase === 'boot') return <BootScreen />
  if (phase === 'unauthenticated') return <Navigate to="/login" replace />
  if (!isPlatformAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6">
        <div className="max-w-md rounded-[10px] border border-rec/30 bg-rec/5 p-8 text-center">
          <span className="font-mono text-[10px] tracking-[0.22em] text-rec uppercase">access denied</span>
          <p className="mt-3 text-sm leading-relaxed text-fg">
            Platform admin access is required for this area.
          </p>
          <p className="mt-2 font-mono text-[11px] text-dim">
            signed in as {me?.username} · role: {me?.role}
          </p>
        </div>
      </div>
    )
  }
  return <Outlet />
}
