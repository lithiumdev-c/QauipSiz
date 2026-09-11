import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { AdminRoute, ProtectedRoute } from '@/routes/guards'

import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

import AppLayout from '@/layouts/AppLayout'
import Dashboard from '@/pages/dashboard/Dashboard'
import Profile from '@/pages/profile/Profile'
import Onboarding from '@/pages/onboarding/Onboarding'
import RequestStatus from '@/pages/onboarding/RequestStatus'
import OrganizationPage from '@/pages/organization/OrganizationPage'
import CasesList from '@/pages/cases/CasesList'
import CaseDetail from '@/pages/cases/CaseDetail'
import VideoDetail from '@/pages/videos/VideoDetail'
import MatchesQueue from '@/pages/matches/MatchesQueue'

import AdminLayout from '@/layouts/AdminLayout'
import AdminRequests from '@/pages/admin/AdminRequests'
import AdminOrganizations from '@/pages/admin/AdminOrganizations'
import AdminUsers from '@/pages/admin/AdminUsers'

/** Routes by the real /auth/me state — never by optimistic guesses. */
function AppIndex() {
  const { me, isPlatformAdmin } = useAuth()
  const location = useLocation()

  if (isPlatformAdmin) return <Navigate to="/admin/requests" replace />
  if (me?.organization) return <Navigate to="/app/dashboard" replace />
  return <Navigate to="/app/onboarding" replace state={{ from: location.pathname }} />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppIndex />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="onboarding/status" element={<RequestStatus />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="cases/:caseId" element={<CaseDetail />} />
          <Route path="cases/:caseId/videos/:videoId" element={<VideoDetail />} />
          <Route path="matches" element={<MatchesQueue />} />
        </Route>
      </Route>

      {/* Platform admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/requests" replace />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="organizations" element={<AdminOrganizations />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
