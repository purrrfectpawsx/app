import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { VerificationBanner } from '@/components/auth/VerificationBanner'
import { SignupPage } from '@/pages/SignupPage'
import { LoginPage } from '@/pages/LoginPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { EmailVerifiedPage } from '@/pages/EmailVerifiedPage'
import { AuthCallback } from '@/pages/AuthCallback'
import { VerifiedRoute } from '@/components/auth/VerifiedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VerificationBanner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes - require email verification */}
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
