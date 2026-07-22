import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface AuthUser {
  id: number
  email: string
  name: string | null
  tier: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJWT(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return { id: Number(payload.sub), email: payload.email, name: payload.name ?? null, tier: payload.tier ?? 'free' }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('auth_token')
    if (!stored) return null
    // Validate stored token isn't expired
    const user = parseJWT(stored)
    return user ? stored : null
  })

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_token')
    return stored ? parseJWT(stored) : null
  })

  const login = useCallback((newToken: string) => {
    const parsed = parseJWT(newToken)
    if (!parsed) return
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
    setUser(parsed)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
