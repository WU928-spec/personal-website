import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import {
  scanVault,
  buildFileTree,
  getNoteBySlug,
  buildInboundLinkIndex,
  saveNoteToVault,
  type NoteMeta,
} from './lib/vaultReader.ts'
import { GitHubClient } from './lib/githubClient.ts'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors({ origin: config.corsOrigin }))

/* ── File uploads ── */
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}

function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/')
}

async function saveBase64Image(dataUrl: string): Promise<string> {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) return dataUrl
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
  const base64Data = matches[2]
  const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)
  await fs.writeFile(filepath, Buffer.from(base64Data, 'base64'))
  return `/api/uploads/${filename}`
}

async function processImages(images: string[]): Promise<string[]> {
  const results: string[] = []
  for (const img of images) {
    if (isBase64Image(img)) {
      results.push(await saveBase64Image(img))
    } else {
      results.push(img)
    }
  }
  return results
}

app.get('/api/uploads/:filename', async (req, res) => {
  const filename = req.params.filename
  if (filename.includes('..') || filename.includes('/')) {
    res.status(400).json({ error: 'Invalid filename' })
    return
  }
  const filepath = path.join(UPLOADS_DIR, filename)
  try {
    const data = await fs.readFile(filepath)
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
    res.send(data)
  } catch {
    res.status(404).json({ error: 'File not found' })
  }
})

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
   PUT /api/notes/:slug — Save note back to vault
   ─────────────────────────────────────────────── */
app.put('/api/notes/:slug', async (req, res) => {
  try {
    const { content } = req.body as { content?: string }
    if (!content && content !== '') {
      res.status(400).json({ error: 'content is required' })
      return
    }

    const success = await saveNoteToVault(config.vaultPath, req.params.slug, content)
    if (!success) {
      res.status(404).json({ error: 'Note not found' })
      return
    }

    // Invalidate cache
    notesCache = []
    cacheTime = 0

    res.json({ status: 'saved', slug: req.params.slug })
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
   GET /api/file/:path — Serve vault files (audio, images, etc.)
   ─────────────────────────────────────────────── */
app.get('/api/file/*', async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.path.replace('/api/file/', ''))
    const fullPath = path.join(config.vaultPath, filePath)

    // Security: ensure the resolved path is inside vault
    const resolved = await fs.realpath(fullPath).catch(() => fullPath)
    if (!resolved.startsWith(config.vaultPath)) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    const stat = await fs.stat(resolved)
    if (!stat.isFile()) {
      res.status(404).json({ error: 'Not a file' })
      return
    }

    // Set content type based on extension
    const ext = path.extname(resolved).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)

    const data = await fs.readFile(resolved)
    res.send(data)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(404).json({ error: msg })
  }
})

/* ───────────────────────────────────────────────
   Moments API (动态墙)
   ─────────────────────────────────────────────── */

interface Comment {
  id: string
  userId: string
  name: string
  text: string
  time: string
}

interface MomentAttachment {
  name: string
  type: string
  data: string
}

interface Moment {
  id: string
  authorId: string
  content: string
  images: string[]
  attachments?: MomentAttachment[]
  createdAt: string
  location?: string
  likes: string[]
  comments: Comment[]
}

const MOMENTS_FILE = path.join(process.cwd(), 'moments.json')

async function loadMoments(): Promise<Moment[]> {
  try {
    const raw = await fs.readFile(MOMENTS_FILE, 'utf-8')
    return JSON.parse(raw) as Moment[]
  } catch {
    return []
  }
}

async function saveMoments(list: Moment[]) {
  await fs.writeFile(MOMENTS_FILE, JSON.stringify(list, null, 2))
}

let momentsCache: Moment[] | null = null

async function getMoments(): Promise<Moment[]> {
  if (!momentsCache) {
    momentsCache = await loadMoments()
  }
  return momentsCache
}

// GET /api/moments
app.get('/api/moments', async (_req, res) => {
  const list = await getMoments()
  res.json(list)
})

// POST /api/moments
app.post('/api/moments', async (req, res) => {
  const body = req.body as Moment
  if (!body.content && (!body.images || body.images.length === 0)) {
    res.status(400).json({ error: 'Content or images required' })
    return
  }
  // Process base64 images → save as files
  body.images = await processImages(body.images)
  const list = await getMoments()
  list.unshift(body)
  momentsCache = list
  await saveMoments(list)
  res.json(body)
})

// POST /api/moments/:id/like
app.post('/api/moments/:id/like', async (req, res) => {
  const { id } = req.params
  const { userId } = req.body as { userId: string }
  const list = await getMoments()
  const idx = list.findIndex((m) => m.id === id)
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const has = list[idx].likes.includes(userId)
  if (has) {
    list[idx].likes = list[idx].likes.filter((uid) => uid !== userId)
  } else {
    list[idx].likes.push(userId)
  }
  momentsCache = list
  await saveMoments(list)
  res.json(list[idx])
})

// POST /api/moments/:id/comment
app.post('/api/moments/:id/comment', async (req, res) => {
  const { id } = req.params
  const comment = req.body as Comment
  const list = await getMoments()
  const idx = list.findIndex((m) => m.id === id)
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  list[idx].comments.push(comment)
  momentsCache = list
  await saveMoments(list)
  res.json(list[idx])
})

// DELETE /api/moments/:id
app.delete('/api/moments/:id', async (req, res) => {
  const { id } = req.params
  const list = await getMoments()
  const filtered = list.filter((m) => m.id !== id)
  momentsCache = filtered
  await saveMoments(filtered)
  res.json({ success: true })
})

/* ───────────────────────────────────────────────
   Health check
   ─────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', vaultPath: config.vaultPath })
})

ensureUploadsDir().then(() => {
  app.listen(config.port, () => {
    console.log(`🚀 Obsidian Sync Server running on http://localhost:${config.port}`)
    console.log(`📁 Vault path: ${config.vaultPath}`)
    console.log(`🔗 CORS origin: ${config.corsOrigin}`)
    console.log(`📂 Uploads dir: ${UPLOADS_DIR}`)
  })
})
