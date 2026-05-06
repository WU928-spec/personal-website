import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  userId: string   // 邮箱，唯一且不可变
  username: string // 昵称，可修改，仅用于显示
  avatar: string
}

export interface UserInfo {
  username: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  userId: string
  isLoggedIn: boolean
  isEditMode: boolean
  setEditMode: (v: boolean) => void
  login: (email: string, password: string) => boolean
  logout: () => void
  updateAvatar: (avatar: string) => void
  updateUsername: (username: string) => void
  getUserDisplay: (userId: string | undefined) => UserInfo
}

const AuthContext = createContext<AuthContextType | null>(null)

// 邮箱作为唯一身份标识，不可修改
const DEFAULT_USER: User = {
  userId: '15258743752@163.com',
  username: 'WU928-spec',
  avatar: '/avatar.jpg',
}
const LOGIN_PASSWORD = 'vibecoding2025'

const REGISTRY_KEY = 'vibecoding_user_registry'
const VISITOR_KEY = 'vibecoding_visitor_id'

function loadRegistry(): Record<string, UserInfo> {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (raw) return JSON.parse(raw) as Record<string, UserInfo>
  } catch {
    // ignore
  }
  return {}
}

function saveRegistry(registry: Record<string, UserInfo>) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
}

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = 'visitor_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [registry, setRegistry] = useState<Record<string, UserInfo>>(loadRegistry)

  const userId = user?.userId || getOrCreateVisitorId()

  useEffect(() => {
    const saved = localStorage.getItem('vibecoding_user')
    if (saved) {
      try {
        let parsed = JSON.parse(saved) as User
        // Migrate old data: previous userId was 'WU928-spec', now it's email
        if (parsed.userId === 'WU928-spec') {
          parsed = { ...parsed, userId: DEFAULT_USER.userId }
        }
        // Migrate old data without userId
        if (!parsed.userId) {
          parsed = { ...parsed, userId: DEFAULT_USER.userId }
        }
        setUser(parsed)
        setRegistry((prev) => {
          const next = { ...prev, [parsed.userId]: { username: parsed.username, avatar: parsed.avatar } }
          saveRegistry(next)
          return next
        })
      } catch {
        localStorage.removeItem('vibecoding_user')
      }
    }
    setIsLoggedIn(localStorage.getItem('vibecoding_logged_in') === 'true')
  }, [])

  const login = (email: string, password: string): boolean => {
    if (email === DEFAULT_USER.userId && password === LOGIN_PASSWORD) {
      const savedAvatar = localStorage.getItem('vibecoding_avatar') || DEFAULT_USER.avatar
      // Preserve existing nickname if user has one
      const savedRaw = localStorage.getItem('vibecoding_user')
      let currentUsername = DEFAULT_USER.username
      if (savedRaw) {
        try { currentUsername = JSON.parse(savedRaw).username || DEFAULT_USER.username } catch {}
      }
      const newUser: User = { userId: DEFAULT_USER.userId, username: currentUsername, avatar: savedAvatar }
      setUser(newUser)
      setIsLoggedIn(true)
      setRegistry((prev) => {
        const next = { ...prev, [DEFAULT_USER.userId]: { username: currentUsername, avatar: savedAvatar } }
        saveRegistry(next)
        return next
      })
      localStorage.setItem('vibecoding_user', JSON.stringify(newUser))
      localStorage.setItem('vibecoding_logged_in', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    setEditMode(false)
    localStorage.removeItem('vibecoding_logged_in')
  }

  const updateAvatar = (avatar: string) => {
    const currentUser = user || { userId: getOrCreateVisitorId(), username: '访客', avatar: '/avatar.jpg' }
    const updated = { ...currentUser, avatar }
    setUser(updated)
    setRegistry((prev) => {
      const next = { ...prev, [updated.userId]: { username: updated.username, avatar } }
      saveRegistry(next)
      return next
    })
    localStorage.setItem('vibecoding_user', JSON.stringify(updated))
    localStorage.setItem('vibecoding_avatar', avatar)
  }

  const updateUsername = (username: string) => {
    const currentUser = user || { userId: getOrCreateVisitorId(), username: '访客', avatar: '/avatar.jpg' }
    const updated = { ...currentUser, username }
    setUser(updated)
    setRegistry((prev) => {
      const next = { ...prev, [updated.userId]: { username, avatar: updated.avatar } }
      saveRegistry(next)
      return next
    })
    localStorage.setItem('vibecoding_user', JSON.stringify(updated))
  }

  const getUserDisplay = (uid: string | undefined): UserInfo => {
    if (!uid) return { username: '未知用户', avatar: '' }
    return registry[uid] || { username: uid, avatar: '' }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoggedIn,
        isEditMode,
        setEditMode,
        login,
        logout,
        updateAvatar,
        updateUsername,
        getUserDisplay,
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
