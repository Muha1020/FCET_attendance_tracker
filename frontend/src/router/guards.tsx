import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <Outlet />
}

export function RoleGuard({ role }: { role: 'student' | 'lecturer' }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}

export function GuestGuard() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated || !user) return <Outlet />
  return <Navigate to={`/${user.role}`} replace />
}
