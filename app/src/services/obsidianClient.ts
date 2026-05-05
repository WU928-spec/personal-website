import type { ObsidianNoteMeta, ObsidianNote, VaultFile, InboundLinkIndex } from '@/types'

const API_BASE = 'http://localhost:2667/api'

let serverAvailable: boolean | null = null

async function checkServer(): Promise<boolean> {
  if (serverAvailable !== null) return serverAvailable
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) })
    serverAvailable = res.ok
    return serverAvailable
  } catch {
    serverAvailable = false
    return false
  }
}

export async function isObsidianServerAvailable(): Promise<boolean> {
  return checkServer()
}

/* ───────────────────────────────────────────────
   GET /api/notes
   ─────────────────────────────────────────────── */
export async function fetchObsidianNotes(): Promise<ObsidianNoteMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/notes`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error('Server error')
    const data = await res.json()
    return data.notes as ObsidianNoteMeta[]
  } catch {
    return []
  }
}

/* ───────────────────────────────────────────────
   GET /api/notes/:slug
   ─────────────────────────────────────────────── */
export async function fetchObsidianNote(slug: string): Promise<ObsidianNote | null> {
  try {
    const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error('Not found')
    const data = await res.json()
    return {
      ...data.meta,
      content: data.content,
      frontmatter: data.frontmatter,
    } as ObsidianNote
  } catch {
    return null
  }
}

/* ───────────────────────────────────────────────
   GET /api/tree
   ─────────────────────────────────────────────── */
export async function fetchVaultTree(): Promise<VaultFile[]> {
  try {
    const res = await fetch(`${API_BASE}/tree`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error('Server error')
    const data = await res.json()
    return data.tree as VaultFile[]
  } catch {
    return []
  }
}

/* ───────────────────────────────────────────────
   GET /api/links
   ─────────────────────────────────────────────── */
export async function fetchInboundLinks(): Promise<InboundLinkIndex> {
  try {
    const res = await fetch(`${API_BASE}/links`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error('Server error')
    const data = await res.json()
    return data.inboundLinks as InboundLinkIndex
  } catch {
    return {}
  }
}

/* ───────────────────────────────────────────────
   PUT /api/notes/:slug — Save note back to vault
   ─────────────────────────────────────────────── */
export async function saveObsidianNote(slug: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(10000),
    })
    return res.ok
  } catch {
    return false
  }
}

/* ───────────────────────────────────────────────
   POST /api/deploy
   ─────────────────────────────────────────────── */
export async function deployNotes(slugs: string[]): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slugs }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Deploy failed')
  }
  return res.json()
}
