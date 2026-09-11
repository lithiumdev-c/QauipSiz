import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import App from './App'
import { AuthProvider } from '@/hooks/useAuth'
import { setUnauthorizedHandler } from '@/api/client'
import { setToken } from '@/lib/token'
import './styles/tokens.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

// Any 401 outside login → clear session; guards redirect to /login.
setUnauthorizedHandler(() => {
  const onLogin = window.location.pathname.startsWith('/login')
  if (!onLogin) {
    setToken(null)
    queryClient.cancelQueries()
    queryClient.clear()
    window.location.href = '/login?expired=1'
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#10131a',
              border: '1px solid #22242e',
              color: '#f5f6f8',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
