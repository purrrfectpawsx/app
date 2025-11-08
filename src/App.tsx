import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { VerificationBanner } from '@/components/auth/VerificationBanner'
import { Header } from '@/components/layout/Header'
import { SignupPage } from '@/pages/SignupPage'
import { LoginPage } from '@/pages/LoginPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { EmailVerifiedPage } from '@/pages/EmailVerifiedPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { VerifiedRoute } from '@/components/auth/VerifiedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <VerificationBanner />
        <Routes>
          {/* Public routes (unrestricted) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public auth routes (redirect authenticated users to dashboard) */}
          <Route element={<PublicRoute />}>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes (require authentication + email verification) */}
          <Route element={<VerifiedRoute />}>
            <Route
              path="/dashboard"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                      Welcome to PetCare! Dashboard to be implemented in future stories.
                    </p>
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
