import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Custom storage adapter that checks both localStorage and sessionStorage
class BrowserStorageAdapter {
  getItem(key: string): string | null {
    // Check sessionStorage first (for "Remember me" = false)
    const sessionValue = sessionStorage.getItem(key)
    if (sessionValue) return sessionValue

    // Fall back to localStorage (for "Remember me" = true)
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    // By default, store in localStorage (will be moved to sessionStorage if needed)
    localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    // Remove from both storages to ensure cleanup
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new BrowserStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
