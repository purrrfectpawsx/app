import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">PetCare</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your pet's health with ease</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-600 space-x-4">
          <a href="#" className="hover:underline">
            Terms
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </footer>
      </div>
    </div>
  )
}
