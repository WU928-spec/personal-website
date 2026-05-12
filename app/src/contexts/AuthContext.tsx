import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { fetchSetting, saveSetting } from '@/data/site'

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
  owner: User
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

const AUTH_KEY = 'vibecoding_auth'

interface AuthStorage {
  currentUser: User | null
  visitorId: string
  registry: Record<string, UserInfo>
}

function loadAuth(): AuthStorage {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const data = JSON.parse(raw) as AuthStorage
      // 迁移旧数据
      if (data.currentUser?.userId === 'WU928-spec') {
        data.currentUser.userId = DEFAULT_USER.userId
      }
      return data
    }
  } catch {
    // 尝试迁移旧格式数据
    try {
      const oldUser = localStorage.getItem('vibecoding_user')
      const oldRegistry = localStorage.getItem('vibecoding_user_registry')
      const oldVisitor = localStorage.getItem('vibecoding_visitor_id')

      if (oldUser || oldRegistry || oldVisitor) {
        const migrated: AuthStorage = {
          currentUser: oldUser ? JSON.parse(oldUser) : null,
          visitorId: oldVisitor || 'visitor_' + Math.random().toString(36).slice(2, 10),
          registry: oldRegistry ? JSON.parse(oldRegistry) : {}
        }

        // 清理旧数据
        localStorage.removeItem('vibecoding_user')
        localStorage.removeItem('vibecoding_logged_in')
        localStorage.removeItem('vibecoding_avatar')
        localStorage.removeItem('vibecoding_user_registry')
        localStorage.removeItem('vibecoding_visitor_id')

        saveAuth(migrated)
        return migrated
      }
    } catch {}
  }

  return {
    currentUser: null,
    visitorId: 'visitor_' + Math.random().toString(36).slice(2, 10),
    registry: {}
  }
}

function saveAuth(data: AuthStorage) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save auth data:', err)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthStorage>(loadAuth)
  const [isEditMode, setEditMode] = useState(false)

  const user = authData.currentUser
  const isLoggedIn = user !== null
  const userId = user?.userId || authData.visitorId

  // Owner is always the default user — visible to visitors too
  const ownerInfo = authData.registry[DEFAULT_USER.userId]
  const owner: User = {
    userId: DEFAULT_USER.userId,
    username: ownerInfo?.username || DEFAULT_USER.username,
    avatar: ownerInfo?.avatar || DEFAULT_USER.avatar,
  }

  // Sync owner profile from Supabase on mount (so visitors see the same avatar)
  useEffect(() => {
    fetchSetting<{ username: string; avatar: string }>('owner_profile')
      .then((profile) => {
        if (!profile) return
        setAuthData(prev => {
          const next: AuthStorage = {
            ...prev,
            registry: {
              ...prev.registry,
              [DEFAULT_USER.userId]: profile,
            },
          }
          saveAuth(next)
          return next
        })
      })
      .catch((err) => console.warn('Failed to fetch owner profile:', err))
  }, [])

  const updateAuth = (updater: (prev: AuthStorage) => AuthStorage) => {
    setAuthData(prev => {
      const next = updater(prev)
      saveAuth(next)
      return next
    })
  }

  const login = (email: string, password: string): boolean => {
    if (email === DEFAULT_USER.userId && password === LOGIN_PASSWORD) {
      updateAuth(prev => {
        const existingUser = prev.registry[DEFAULT_USER.userId]
        const newUser: User = {
          userId: DEFAULT_USER.userId,
          username: existingUser?.username || DEFAULT_USER.username,
          avatar: existingUser?.avatar || DEFAULT_USER.avatar
        }
        return {
          ...prev,
          currentUser: newUser,
          registry: {
            ...prev.registry,
            [newUser.userId]: { username: newUser.username, avatar: newUser.avatar }
          }
        }
      })
      return true
    }
    return false
  }

  const logout = () => {
    updateAuth(prev => ({ ...prev, currentUser: null }))
    setEditMode(false)
  }

  const updateAvatar = (avatar: string) => {
    updateAuth(prev => {
      const currentUser = prev.currentUser || {
        userId: prev.visitorId,
        username: '访客',
        avatar: '/avatar.jpg'
      }
      const updated = { ...currentUser, avatar }
      const registryEntry = { username: updated.username, avatar }
      // Also sync to Supabase so visitors can see it
      saveSetting('owner_profile', registryEntry).catch((e) =>
        console.warn('Sync owner profile failed:', e)
      )
      return {
        ...prev,
        currentUser: updated,
        registry: {
          ...prev.registry,
          [updated.userId]: registryEntry
        }
      }
    })
  }

  const updateUsername = (username: string) => {
    updateAuth(prev => {
      const currentUser = prev.currentUser || {
        userId: prev.visitorId,
        username: '访客',
        avatar: '/avatar.jpg'
      }
      const updated = { ...currentUser, username }
      const registryEntry = { username, avatar: updated.avatar }
      // Also sync to Supabase so visitors can see it
      saveSetting('owner_profile', registryEntry).catch((e) =>
        console.warn('Sync owner profile failed:', e)
      )
      return {
        ...prev,
        currentUser: updated,
        registry: {
          ...prev.registry,
          [updated.userId]: registryEntry
        }
      }
    })
  }

  const getUserDisplay = (uid: string | undefined): UserInfo => {
    if (!uid) return { username: '未知用户', avatar: '' }
    return authData.registry[uid] || { username: uid, avatar: '' }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        owner,
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
