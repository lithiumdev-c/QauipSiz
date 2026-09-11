import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { getToken, setToken } from '@/lib/token'
import type { Me } from '@/types'

type AuthPhase = 'boot' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  phase: AuthPhase
  me: Me | null
  isPlatformAdmin: boolean
  orgId: number | null
  orgRole: string | null
  login: (username: string, password: string) => Promise<Me | null>
  logout: () => void
  refreshMe: () => Promise<Me | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>('boot')
  const [me, setMe] = useState<Me | null>(null)
  const queryClient = useQueryClient()

  const loadMe = useCallback(async (): Promise<Me | null> => {
    if (!getToken()) {
      setPhase('unauthenticated')
      setMe(null)
      return null
    }
    try {
      const profile = await authApi.me()
      setMe(profile)
      setPhase('authenticated')
      return profile
    } catch {
      setToken(null)
      setMe(null)
      setPhase('unauthenticated')
      return null
    }
  }, [])

  useEffect(() => {
    void loadMe()
  }, [loadMe])

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await authApi.login(username, password)
      setToken(res.access_token)
      const profile = await authApi.me().catch(() => null)
      if (profile) {
        setMe(profile)
        setPhase('authenticated')
        return profile
      }
      // token invalid immediately — treat as failure
      setToken(null)
      throw new Error('Session could not be established.')
    },
    [],
  )

  const logout = useCallback(() => {
    queryClient.cancelQueries()
    queryClient.clear()
    setToken(null)
    setMe(null)
    setPhase('unauthenticated')
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      phase,
      me,
      isPlatformAdmin: me?.role === 'platform_admin',
      orgId: me?.organization?.id ?? null,
      orgRole: me?.membership?.role ?? null,
      login,
      logout,
      refreshMe: loadMe,
    }),
    [phase, me, login, logout, loadMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
