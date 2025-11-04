import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isEmailVerified: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signOut: () => Promise<void>
  resendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  useEffect(() => {
    // Get initial session - check both localStorage and sessionStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsEmailVerified(session?.user?.email_confirmed_at !== null && session?.user?.email_confirmed_at !== undefined)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsEmailVerified(session?.user?.email_confirmed_at !== null && session?.user?.email_confirmed_at !== undefined)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Step 1: Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        throw new Error('User creation failed')
      }

      // Step 2: Create profile entry
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        name: name,
        subscription_tier: 'free',
      })

      if (profileError) {
        // Profile creation failed - this breaks the data model
        // Log the error for debugging
        console.error('Profile creation error:', profileError)

        // Throw error to prevent silent failure
        // Note: Auth user was created but profile failed. User should contact support.
        // For production: implement backend cleanup or use database triggers
        throw new Error(
          'Account creation incomplete. Please contact support or try again later.'
        )
      }
    } catch (error) {
      const authError = error as AuthError

      // Handle duplicate email error
      if (authError.message?.includes('already registered')) {
        throw new Error('An account with this email already exists')
      }

      throw error
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Handle "Remember me" functionality
    // rememberMe = true: session persists across browser restarts (localStorage)
    // rememberMe = false: session cleared when browser closes (sessionStorage)
    if (data.session && !rememberMe) {
      // Move session from localStorage to sessionStorage for session-only persistence
      const authKey = Object.keys(localStorage).find(key =>
        key.includes('auth-token') && key.includes('sb-')
      )

      if (authKey) {
        const sessionData = localStorage.getItem(authKey)
        if (sessionData) {
          // Copy to sessionStorage
          sessionStorage.setItem(authKey, sessionData)
          // Remove from localStorage
          localStorage.removeItem(authKey)
        }
      }
    }
    // If rememberMe = true, session stays in localStorage (Supabase default)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('No user email found')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })

    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    resendVerificationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
