import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

