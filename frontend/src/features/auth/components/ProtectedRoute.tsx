import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import type { UserRole } from '../types/auth'
import { useAuthStore } from '../store/useAuthStore'

type ProtectedRouteProps = PropsWithChildren<{
  roles?: UserRole[]
}>

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

