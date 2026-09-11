import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import Logo from '@/components/Logo'
import MonitorFrame from '@/components/MonitorFrame'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.register({ username: username.trim(), email: email.trim(), password })
      toast.success('Account created. Sign in to continue.')
      navigate('/login', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('That username or email is already registered.')
      } else if (err instanceof ApiError) {
        setError(err.detail)
      } else {
        setError('Could not create the account. Check your connection and try again.')
      }
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
            Create account
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
            Registration
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-[-0.015em] text-fg md:text-4xl">
            Create your account
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            You'll register as an individual operator first. If your organization isn't
            on the platform yet, you can request access after signing in.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator"
                className="mt-2 w-full rounded-md border border-line bg-panel px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@example.org"
                className="mt-2 w-full rounded-md border border-line bg-panel px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-md border border-line bg-panel px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-dim/60 focus:border-violet focus:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-rec/30 bg-rec/10 px-4 py-3 text-sm text-rec">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Create account
            </Button>
            <p className="pt-1 text-center text-sm text-dim">
              Already registered?{' '}
              <Link
                to="/login"
                className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg"
              >
                Sign in
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
            <MonitorFrame label="SYS · REGISTER" rec={false} live={false} osdBottomLeft="Account setup" osdBottomRight="SECURE">
              <div className="flex h-full flex-col items-center justify-center px-8">
                <p className="crt-wordmark relative text-center text-xl font-semibold tracking-[0.3em] uppercase select-none">
                  QauipSiz
                </p>
                <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
                  Awaiting credentials
                </p>
              </div>
            </MonitorFrame>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
