import express from 'express'
import cors from 'cors'
import config from './config.ts'
import {
  scanVault,
  buildFileTree,
  getNoteBySlug,
  buildInboundLinkIndex,
  type NoteMeta,
} from './lib/vaultReader.ts'
import { GitHubClient } from './lib/githubClient.ts'

const app = express()
app.use(express.json())
app.use(cors({ origin: config.corsOrigin }))

// In-memory cache
let notesCache: NoteMeta[] = []
let cacheTime = 0
const CACHE_TTL = 5000 // 5 seconds

async function getNotes(): Promise<NoteMeta[]> {
  const now = Date.now()
  if (now - cacheTime > CACHE_TTL) {
    notesCache = await scanVault(config.vaultPath)
    cacheTime = now
  }
  return notesCache
}

/* ───────────────────────────────────────────────
   GET /api/notes — List all notes metadata
   ─────────────────────────────────────────────── */
app.get('/api/notes', async (_req, res) => {
  try {
    const notes = await getNotes()
    res.json({ notes })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   GET /api/notes/:slug — Get single note content
   ─────────────────────────────────────────────── */
app.get('/api/notes/:slug', async (req, res) => {
  try {
    const note = await getNoteBySlug(config.vaultPath, req.params.slug)
    if (!note) {
      res.status(404).json({ error: 'Note not found' })
      return
    }
    res.json({
      content: note.content,
      frontmatter: note.frontmatter,
      meta: {
        slug: note.slug,
        title: note.title,
        date: note.date,
        category: note.category,
        tags: note.tags,
        excerpt: note.excerpt,
        modified: note.modified,
        outboundLinks: note.outboundLinks,
        filePath: note.filePath,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   GET /api/tree — Get vault file tree
   ─────────────────────────────────────────────── */
app.get('/api/tree', async (_req, res) => {
  try {
    const tree = await buildFileTree(config.vaultPath)
    res.json({ tree })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   GET /api/links — Get inbound link index
   ─────────────────────────────────────────────── */
app.get('/api/links', async (_req, res) => {
  try {
    const notes = await getNotes()
    const index = buildInboundLinkIndex(notes)
    const obj: Record<string, string[]> = {}
    for (const [key, value] of index.entries()) {
      obj[key] = value
    }
    res.json({ inboundLinks: obj })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   POST /api/deploy — Trigger GitHub Actions deploy
   ─────────────────────────────────────────────── */
app.post('/api/deploy', async (req, res) => {
  try {
    if (!config.githubToken) {
      res.status(400).json({ error: 'GITHUB_TOKEN not configured' })
      return
    }

    const { slugs } = req.body as { slugs?: string[] }
    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      res.status(400).json({ error: 'slugs array is required' })
      return
    }

    const client = new GitHubClient({
      token: config.githubToken,
      owner: config.githubRepo.owner,
      repo: config.githubRepo.repo,
    })

    const result = await client.triggerDeploy(slugs)
    res.json({ status: result.status })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   Health check
   ─────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', vaultPath: config.vaultPath })
})

app.listen(config.port, () => {
  console.log(`🚀 Obsidian Sync Server running on http://localhost:${config.port}`)
  console.log(`📁 Vault path: ${config.vaultPath}`)
  console.log(`🔗 CORS origin: ${config.corsOrigin}`)
})
