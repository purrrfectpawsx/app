import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignupForm } from '@/components/auth/SignupForm'

export function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Sign up to start managing your pet's health records"
    >
      <SignupForm />
    </AuthLayout>
  )
}
