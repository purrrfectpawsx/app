import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function VerifiedRoute() {
  const { user, loading, isEmailVerified } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // No user logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User logged in but email not verified - redirect to verification page
  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  // User is authenticated and verified - render protected content
  return <Outlet />
}
