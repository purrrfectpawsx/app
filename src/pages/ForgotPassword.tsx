import { AuthLayout } from '@/components/auth/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export function ForgotPassword() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email address and we'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
