import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cyprus_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          raw: session.user
        }
        setUser(u)
        localStorage.setItem('cyprus_user', JSON.stringify(u))
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          raw: session.user
        }
        setUser(u)
        localStorage.setItem('cyprus_user', JSON.stringify(u))
      } else {
        setUser(null)
        localStorage.removeItem('cyprus_user')
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, extraData = {}, autoLogin = false) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: extraData
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Check if user was created or requires email confirmation
      const isConfirmed = data?.session != null
      const createdUser = data?.user
        ? {
            id: data.user.id,
            email: data.user.email,
            name: extraData.fullName || data.user.email?.split('@')?.[0] || 'User',
            raw: data.user
          }
        : null

      // Check if user already existed or identities are empty
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email already exists. Please switch to Sign In.'
        }
      }

      if (autoLogin && isConfirmed && createdUser) {
        setUser(createdUser)
        localStorage.setItem('cyprus_user', JSON.stringify(createdUser))
      } else if (!autoLogin) {
        setUser(null)
        localStorage.removeItem('cyprus_user')
      }

      return {
        success: true,
        user: createdUser,
        requiresEmailConfirmation: !isConfirmed && Boolean(data?.user?.identities?.length)
      }
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign up.' }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const signedInUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        raw: data.user
      }

      setUser(signedInUser)
      localStorage.setItem('cyprus_user', JSON.stringify(signedInUser))
      return { success: true, user: signedInUser }
    } catch (err) {
      return { success: false, error: err.message || 'Sign in failed. Please check your credentials.' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Sign out warning:', e)
    }
    setUser(null)
    localStorage.removeItem('cyprus_user')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
