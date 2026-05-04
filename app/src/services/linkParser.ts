import type { ObsidianNoteMeta, LinkGraph } from '@/types'

/* ───────────────────────────────────────────────
   Extract wikilinks from raw markdown content
   ─────────────────────────────────────────────── */
export function extractWikilinks(content: string): string[] {
  const links: string[] = []
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    links.push(slugify(match[1].trim()))
  }
  return [...new Set(links)]
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

/* ───────────────────────────────────────────────
   Build inbound link index from notes metadata
   ─────────────────────────────────────────────── */
export function buildInboundLinkIndex(
  notes: ObsidianNoteMeta[]
): Map<string, ObsidianNoteMeta[]> {
  const index = new Map<string, ObsidianNoteMeta[]>()

  for (const note of notes) {
    for (const targetSlug of note.outboundLinks) {
      if (!index.has(targetSlug)) {
        index.set(targetSlug, [])
      }
      const list = index.get(targetSlug)!
      if (!list.find((n) => n.slug === note.slug)) {
        list.push(note)
      }
    }
  }

  return index
}

/* ───────────────────────────────────────────────
   Build D3.js compatible link graph
   ─────────────────────────────────────────────── */
export function buildLinkGraph(notes: ObsidianNoteMeta[]): LinkGraph {
  const nodes = notes.map((note, i) => ({
    id: note.slug,
    group: i % 5,
    title: note.title,
  }))

  const links: LinkGraph['links'] = []
  const seen = new Set<string>()

  for (const note of notes) {
    for (const target of note.outboundLinks) {
      // Only add if target exists in notes
      if (notes.find((n) => n.slug === target)) {
        const key = [note.slug, target].sort().join('→')
        if (!seen.has(key)) {
          seen.add(key)
          links.push({ source: note.slug, target })
        }
      }
    }
  }

  return { nodes, links }
}

/* ───────────────────────────────────────────────
   Find notes that link TO a given slug (inbound)
   ─────────────────────────────────────────────── */
export function findBacklinks(
  targetSlug: string,
  notes: ObsidianNoteMeta[]
): ObsidianNoteMeta[] {
  return notes.filter((note) => note.outboundLinks.includes(targetSlug))
}
