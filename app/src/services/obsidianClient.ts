import type { ObsidianNoteMeta, ObsidianNote, VaultFile, InboundLinkIndex } from '@/types'

const INDEX_URL = '/notes/index.json'

let indexCache: {
  notes: ObsidianNoteMeta[]
  tree: VaultFile[]
  inboundLinks: InboundLinkIndex
} | null = null

async function loadIndex(): Promise<typeof indexCache> {
  if (indexCache) return indexCache
  try {
    const res = await fetch(INDEX_URL)
    if (!res.ok) return null
    const data = await res.json()
    indexCache = {
      notes: data.notes || [],
      tree: data.tree || [],
      inboundLinks: data.inboundLinks || {},
    }
    return indexCache
  } catch {
    return null
  }
}

/* ───────────────────────────────────────────────
   Static files — always available
   ─────────────────────────────────────────────── */
export async function isObsidianServerAvailable(): Promise<boolean> {
  const idx = await loadIndex()
  return idx !== null && idx.notes.length > 0
}

export async function fetchObsidianNotes(): Promise<ObsidianNoteMeta[]> {
  const idx = await loadIndex()
  return idx?.notes || []
}

export async function fetchObsidianNote(slug: string): Promise<ObsidianNote | null> {
  const idx = await loadIndex()
  if (!idx) return null

  const meta = idx.notes.find((n) => n.slug === slug)
  if (!meta) return null

  try {
    // Encode each path segment separately, preserve '/' as directory separator
    const encodedPath = meta.filePath
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/')
    const res = await fetch(`/notes/${encodedPath}`)
    if (!res.ok) return null
    const raw = await res.text()

    // Simple frontmatter parser (avoids bundling gray-matter)
    const frontmatter: Record<string, unknown> = {}
    let content = raw

    if (raw.startsWith('---')) {
      const end = raw.indexOf('---', 3)
      if (end !== -1) {
        const yaml = raw.slice(3, end).trim()
        content = raw.slice(end + 3).trim()
        for (const line of yaml.split('\n')) {
          const colonIdx = line.indexOf(':')
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim()
            const val = line.slice(colonIdx + 1).trim()
            if (val.startsWith('[') && val.endsWith(']')) {
              frontmatter[key] = val
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim().replace(/^["']|["']$/g, ''))
            } else {
              frontmatter[key] = val.replace(/^["']|["']$/g, '')
            }
          }
        }
      }
    }

    return {
      ...meta,
      content,
      frontmatter,
    }
  } catch {
    return null
  }
}

export async function fetchVaultTree(): Promise<VaultFile[]> {
  const idx = await loadIndex()
  return idx?.tree || []
}

export async function fetchInboundLinks(): Promise<InboundLinkIndex> {
  const idx = await loadIndex()
  return idx?.inboundLinks || {}
}

/* ───────────────────────────────────────────────
   Read-only — static files can't be saved back
   ─────────────────────────────────────────────── */
export async function saveObsidianNote(_slug: string, _content: string): Promise<boolean> {
  console.warn('Static notes are read-only. Edit source files and redeploy.')
  return false
}

export async function deployNotes(_slugs: string[]): Promise<{ status: string }> {
  console.warn('Static notes are auto-deployed with the site. No manual deploy needed.')
  return { status: 'noop' }
}
