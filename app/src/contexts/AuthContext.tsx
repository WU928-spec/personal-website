import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  username: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  updateAvatar: (avatar: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEFAULT_USER = { username: 'WU928-spec', avatar: '/avatar.jpg' }
const LOGIN_PASSWORD = 'vibecoding2025'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('vibecoding_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('vibecoding_user')
      }
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username === DEFAULT_USER.username && password === LOGIN_PASSWORD) {
      const savedAvatar = localStorage.getItem('vibecoding_avatar') || DEFAULT_USER.avatar
      const newUser = { username, avatar: savedAvatar }
      setUser(newUser)
      localStorage.setItem('vibecoding_user', JSON.stringify(newUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vibecoding_user')
  }

  const updateAvatar = (avatar: string) => {
    if (user) {
      const updated = { ...user, avatar }
      setUser(updated)
      localStorage.setItem('vibecoding_user', JSON.stringify(updated))
      localStorage.setItem('vibecoding_avatar', avatar)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
