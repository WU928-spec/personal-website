import { useState, useEffect, useCallback } from 'react'
import type { Moment, Comment } from '@/types/moment'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isSupabaseReady, dbToMoment, momentToDb } from '@/lib/supabase'
import { createStorageKey } from '@/utils/storage'

const STORAGE_KEY = 'moments_v1'
const legacyUploadBaseUrl = (import.meta.env.VITE_LEGACY_UPLOAD_BASE_URL || '').replace(/\/$/, '')
const momentStorage = createStorageKey<Moment[]>(STORAGE_KEY, [])

/* ── Helpers ── */
function migrateMoment(m: Moment): Moment {
  if (!m.authorId) {
    m = { ...m, authorId: '15258743752@163.com' }
  }
  if (m.authorId === 'WU928-spec') {
    m = { ...m, authorId: '15258743752@163.com' }
  }
  if (m.likes) {
    m.likes = m.likes.map((uid) => (uid === 'WU928-spec' ? '15258743752@163.com' : uid))
  }
  if (m.comments) {
    m.comments = m.comments.map((c) => ({
      ...c,
      userId: c.userId || c.name || 'unknown',
    }))
  }
  return m
}

function resolveImageUrls(images: string[]): string[] {
  return images.map((img) => {
    if (img.startsWith('/api/uploads/')) {
      return `${legacyUploadBaseUrl}${img}`
    }
    return img
  })
}

function loadLocal(): Moment[] {
  const list = momentStorage.load()
  return list.map(migrateMoment).map((m) => ({
    ...m,
    images: resolveImageUrls(m.images),
  }))
}

function saveLocal(list: Moment[]) {
  momentStorage.save(list)
}

function sortDesc(list: Moment[]): Moment[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/* ── Supabase helpers ── */
async function fetchFromSupabase(): Promise<Moment[]> {
  if (!isSupabaseReady()) throw new Error('Supabase not configured')

  // 5s timeout — longer for potentially large data
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Supabase timeout')), 5000)
  )

  const query = supabase!
    .from('moments')
    .select('*')
    .order('created_at', { ascending: false })

  const { data, error } = await Promise.race([query, timeout])

  if (error) throw error
  if (!data) return []

  return (data as Record<string, unknown>[]).map(dbToMoment).map((m) => ({
    ...m,
    images: resolveImageUrls(m.images),
  }))
}

/* ── Hook ── */
export function useMoments() {
  const { userId, user, getUserDisplay } = useAuth()
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle')
  const [usingLocal, setUsingLocal] = useState(false)

  const fetchMoments = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSyncError(null)
    setUsingLocal(false)

    // Try Supabase first
    if (isSupabaseReady()) {
      setSyncStatus('syncing')
      try {
        const list = await fetchFromSupabase()
        // Supabase is source of truth — use it directly
        setMoments(list)
        saveLocal(list)
        setSyncStatus('synced')
        setLoading(false)
        console.log('[Moments] Synced from Supabase:', list.length, 'moments')
        return
      } catch (err) {
        setUsingLocal(true)
        setSyncStatus('failed')
        const msg = err instanceof Error ? err.message : '同步失败'
        setSyncError(msg)
        console.warn('[Moments] Supabase failed:', msg)
      }
    }

    // Fallback: use local data if Supabase unavailable
    const local = loadLocal()
    setMoments(sortDesc(local))
    setLoading(false)
    console.log('[Moments] Using local data:', local.length, 'moments')
  }, [])

  useEffect(() => {
    fetchMoments()
  }, [fetchMoments])

  const retrySync = useCallback(async () => {
    await fetchMoments()
  }, [fetchMoments])

  const addMoment = useCallback(
    async (
      moment: Omit<Moment, 'id' | 'createdAt' | 'likes' | 'comments' | 'authorId'>
    ) => {
      const newMoment: Moment = {
        ...moment,
        authorId: userId,
        id: 'moment-' + Date.now().toString(36),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
      }

      // 乐观更新本地状态，确保立即显示
      const next = [newMoment, ...moments]
      setMoments(sortDesc(next))
      saveLocal(next)
      setSyncError(null)

      // 同步到 Supabase（后台，不阻塞 UI）
      if (isSupabaseReady()) {
        try {
          const { error } = await supabase!
            .from('moments')
            .insert(momentToDb(newMoment))
          if (error) throw error
          console.log('[Moments] Inserted to Supabase:', newMoment.id)
        } catch (err) {
          const msg = err instanceof Error ? err.message : '同步失败'
          setSyncError(`发布同步失败: ${msg}`)
          console.error('[Moments] Sync insert failed:', err)
        }
      }
    },
    [moments, userId]
  )

  const toggleLike = useCallback(
    async (id: string) => {
      const list = moments.map((m) => {
        if (m.id !== id) return m
        const has = m.likes.includes(userId)
        return {
          ...m,
          likes: has ? m.likes.filter((uid) => uid !== userId) : [...m.likes, userId],
        }
      })
      setMoments(list)
      saveLocal(list)

      if (isSupabaseReady()) {
        try {
          const target = list.find((m) => m.id === id)
          if (target) {
            await supabase!
              .from('moments')
              .update({ likes: target.likes })
              .eq('id', id)
          }
        } catch (err) {
          console.error('[Moments] Like sync failed:', err)
        }
      }
    },
    [moments, userId]
  )

  const addComment = useCallback(
    async (id: string, text: string) => {
      const displayName = user?.username || getUserDisplay(userId).username
      const comment: Comment = {
        id: 'c-' + Date.now().toString(36),
        userId,
        name: displayName,
        text,
        time: new Date().toISOString(),
      }
      const list = moments.map((m) =>
        m.id === id ? { ...m, comments: [...m.comments, comment] } : m
      )
      setMoments(list)
      saveLocal(list)

      if (isSupabaseReady()) {
        try {
          const target = list.find((m) => m.id === id)
          if (target) {
            await supabase!
              .from('moments')
              .update({ comments: target.comments })
              .eq('id', id)
          }
        } catch (err) {
          console.error('[Moments] Comment sync failed:', err)
        }
      }
    },
    [moments, userId, user, getUserDisplay]
  )

  const deleteMoment = useCallback(
    async (id: string) => {
      // Try Supabase first
      if (isSupabaseReady()) {
        try {
          const { error } = await supabase!.from('moments').delete().eq('id', id)
          if (error) throw error
          // Supabase delete succeeded — update local
          const list = moments.filter((m) => m.id !== id)
          setMoments(list)
          saveLocal(list)
          return
        } catch (err) {
          console.error('[Moments] Delete sync failed:', err)
          // Fall through to local-only delete
        }
      }

      // Local-only fallback (Supabase unavailable or failed)
      const list = moments.filter((m) => m.id !== id)
      setMoments(list)
      saveLocal(list)
    },
    [moments]
  )

  return {
    moments,
    loading,
    error,
    syncError,
    syncStatus,
    usingLocal,
    fetchMoments,
    retrySync,
    addMoment,
    toggleLike,
    addComment,
    deleteMoment,
  }
}

/* Re-export for backward compatibility */
export { formatRelativeTime } from '@/utils/time'
