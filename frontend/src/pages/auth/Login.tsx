import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import Logo from '@/components/Logo'
import MonitorFrame from '@/components/MonitorFrame'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, phase, me, isPlatformAdmin } = useAuth()

  const expired = new URLSearchParams(location.search).has('expired')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // already signed in → route by real profile state
  useEffect(() => {
    if (phase !== 'authenticated' || !me) return
    const from = (location.state as { from?: string } | null)?.from
    if (isPlatformAdmin) navigate('/admin/requests', { replace: true })
    else if (me.organization) navigate(from || '/app/dashboard', { replace: true })
    else navigate(from || '/app/onboarding', { replace: true })
  }, [phase, me, isPlatformAdmin, navigate, location.state])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const profile = await login(username.trim(), password)
      if (profile?.role === 'platform_admin') navigate('/admin/requests', { replace: true })
      else if (profile?.organization) navigate('/app/dashboard', { replace: true })
      else navigate('/app/onboarding', { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? 'Invalid username or password.'
          : err instanceof ApiError
            ? err.detail
            : 'Could not sign in. Check your connection and try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-line-soft">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 md:px-8">
          <Link to="/" className="transition-opacity hover:opacity-80" aria-label="QauipSiz home">
            <Logo size={26} />
          </Link>
          <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            Authorized access only
          </span>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="max-w-md"
        >
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet-bright uppercase">
            Operator login
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.015em] text-fg md:text-4xl">
            Sign in to QauipSiz
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Access is restricted to authorized members of registered organizations.
            All access attempts are logged.
          </p>

          {expired && (
            <p className="mt-6 rounded-md border border-blue/30 bg-blue/10 px-4 py-3 font-mono text-[11px] tracking-[0.1em] text-blue-bright uppercase">
              Session expired — sign in again
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator"
                className="mt-2 w-full rounded-md border border-line bg-panel px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-2 w-full rounded-md border border-line bg-panel px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-4 py-3 text-sm text-rec">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Access system
            </Button>
            <p className="pt-1 text-center text-sm text-dim">
              No account?{' '}
              <Link
                to="/register"
                className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg"
              >
                Create one
              </Link>
            </p>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
          className="mx-auto hidden w-full max-w-md md:block"
        >
          <div className="animate-crt-flicker">
            <MonitorFrame label="SYS · AUTH" rec={false} live={false} osdBottomLeft="Awaiting credentials" osdBottomRight="SECURE">
              <div className="flex h-full flex-col items-center justify-center px-8">
                <p className="crt-wordmark relative text-center text-xl font-semibold tracking-[0.3em] uppercase select-none">
                  QauipSiz
                </p>
                <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
                  Session pending
                </p>
              </div>
            </MonitorFrame>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
