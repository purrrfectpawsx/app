import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

/**
 * Header component - Navigation header with logout functionality
 *
 * Displays a header with app branding and logout button for authenticated users.
 * Logout button is only visible when user is authenticated.
 */
export function Header() {
  const { user, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      // No need to redirect - ProtectedRoute will handle redirect to /login
    } catch (error) {
      console.error('Logout error:', error)
      // Show error to user if needed
      setIsLoggingOut(false)
    }
  }

  // Only show header if user is authenticated
  if (!user) {
    return null
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">PetCare</h1>
        </div>

        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </nav>
      </div>
    </header>
  )
}
