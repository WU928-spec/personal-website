import { createClient } from '@supabase/supabase-js'
import type { Moment } from '@/types/moment'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://flteigliukzlqnbpzwqj.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_errDvrdYLJ_0GweJiCtI3Q_WJkPtox1'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function isSupabaseReady(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}

/* ── DB → App type mapping ── */
export function dbToMoment(row: Record<string, unknown>): Moment {
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    content: String(row.content ?? ''),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    attachments: Array.isArray(row.attachments)
      ? (row.attachments as Moment['attachments'])
      : undefined,
    createdAt: String(row.created_at),
    location: row.location ? String(row.location) : undefined,
    likes: Array.isArray(row.likes) ? (row.likes as string[]) : [],
    comments: Array.isArray(row.comments) ? (row.comments as Moment['comments']) : [],
  }
}

export function momentToDb(m: Moment): Record<string, unknown> {
  return {
    id: m.id,
    author_id: m.authorId,
    content: m.content,
    images: m.images,
    attachments: m.attachments ?? null,
    created_at: m.createdAt,
    location: m.location ?? null,
    likes: m.likes,
    comments: m.comments,
  }
}
