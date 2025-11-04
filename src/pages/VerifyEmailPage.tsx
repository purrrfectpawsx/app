import { AuthLayout } from '@/components/auth/AuthLayout'
import { VerificationPending } from '@/components/auth/VerificationPending'

export function VerifyEmailPage() {
  return (
    <AuthLayout title="" description="">
      <VerificationPending />
    </AuthLayout>
  )
}
