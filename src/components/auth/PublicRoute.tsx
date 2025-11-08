import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * PublicRoute component - Prevents authenticated users from accessing auth pages
 *
 * Redirects authenticated users away from /login and /signup to /dashboard.
 * Allows unauthenticated users to access these pages.
 *
 * Usage:
 * <Route element={<PublicRoute />}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/signup" element={<SignupPage />} />
 * </Route>
 */
export function PublicRoute() {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // User is authenticated - redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // User is not authenticated - allow access to public auth pages
  return <Outlet />
}
