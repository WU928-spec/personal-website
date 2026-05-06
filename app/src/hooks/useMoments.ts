import { useState, useEffect, useCallback } from 'react'
import type { Moment, Comment } from '@/types/moment'
import { useAuth } from '@/contexts/AuthContext'

const STORAGE_KEY = 'moments_v1'
const API_BASE = 'http://localhost:2667'

/* ── Mock data ── */
const MOCK_MOMENTS: Moment[] = [
  {
    id: 'mock-1',
    authorId: 'alice',
    content:
      '今天去了西湖，风景真的很美。湖面波光粼粼，柳树依依。\n\n拍了几张照片，分享给你们～',
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    location: '杭州·西湖',
    likes: ['alice', 'bob', 'carol'],
    comments: [
      {
        id: 'c1',
        userId: 'alice',
        name: 'Alice',
        text: '好漂亮！下次一起去',
        time: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
      {
        id: 'c2',
        userId: 'bob',
        name: 'Bob',
        text: '西湖的柳树确实很有意境',
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    id: 'mock-2',
    authorId: 'bob',
    content: '终于把项目重构完了，用了 React 19 + Tailwind，体验很棒。',
    images: [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    likes: ['dave'],
    comments: [
      {
        id: 'c3',
        userId: 'dave',
        name: 'Dave',
        text: 'congrats! 期待上线',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  },
]

/* ── Helpers ── */
function migrateMoment(m: Moment): Moment {
  // Migrate old data without authorId (old default was 'WU928-spec', now email)
  if (!m.authorId) {
    m = { ...m, authorId: '15258743752@163.com' }
  }
  // Migrate old authorId from previous username to email
  if (m.authorId === 'WU928-spec') {
    m = { ...m, authorId: '15258743752@163.com' }
  }
  // Migrate old likes from previous username to email
  if (m.likes) {
    m.likes = m.likes.map((uid) => (uid === 'WU928-spec' ? '15258743752@163.com' : uid))
  }
  // Migrate old comments without userId
  if (m.comments) {
    m.comments = m.comments.map((c) => ({
      ...c,
      userId: c.userId || c.name || 'unknown',
    }))
  }
  return m
}

function loadLocal(): Moment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const list = JSON.parse(raw) as Moment[]
      return list.map(migrateMoment)
    }
  } catch {
    // ignore
  }
  return []
}

function saveLocal(list: Moment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function sortDesc(list: Moment[]): Moment[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/* ── Hook ── */
export function useMoments() {
  const { userId, user, getUserDisplay } = useAuth()
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMoments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/moments`)
      if (res.ok) {
        const data = (await res.json()) as Moment[]
        setMoments(sortDesc(data))
        saveLocal(data)
        setLoading(false)
        return
      }
    } catch {
      // backend unavailable → fallback to localStorage
    }
    // fallback
    const local = loadLocal()
    if (local.length > 0) {
      setMoments(sortDesc(local))
    } else {
      setMoments(sortDesc(MOCK_MOMENTS))
      saveLocal(MOCK_MOMENTS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMoments()
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

      try {
        const res = await fetch(`${API_BASE}/api/moments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMoment),
        })
        if (res.ok) {
          await fetchMoments()
          return
        }
      } catch {
        // backend unavailable
      }

      // local fallback
      const next = [newMoment, ...moments]
      setMoments(sortDesc(next))
      saveLocal(next)
    },
    [moments, fetchMoments, userId]
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

      try {
        await fetch(`${API_BASE}/api/moments/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
      } catch {
        // ignore
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

      try {
        await fetch(`${API_BASE}/api/moments/${id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comment),
        })
      } catch {
        // ignore
      }
    },
    [moments, userId, user, getUserDisplay]
  )

  const deleteMoment = useCallback(
    async (id: string) => {
      const list = moments.filter((m) => m.id !== id)
      setMoments(list)
      saveLocal(list)

      try {
        await fetch(`${API_BASE}/api/moments/${id}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
    },
    [moments]
  )

  return {
    moments,
    loading,
    error,
    fetchMoments,
    addMoment,
    toggleLike,
    addComment,
    deleteMoment,
  }
}

/* ── Relative time ── */
export function formatRelativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days === 2) return '前天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return new Date(iso).toLocaleDateString('zh-CN')
}
