const fs = require('fs')
const path = require('path')

const NOTES_DIR = path.join(__dirname, '../public/notes')
const INDEX_PATH = path.join(NOTES_DIR, 'index.json')

function walk(dir, base = '') {
  const results = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${item.name}` : item.name
    if (item.name === 'index.json' || item.name === 'images') continue
    if (item.name.startsWith('.')) continue
    if (item.isDirectory()) {
      const children = walk(path.join(dir, item.name), rel)
      results.push({ name: item.name, path: rel, type: 'folder', children })
    } else if (item.name.endsWith('.md')) {
      results.push({ name: item.name.replace(/\.md$/, ''), path: rel, type: 'file' })
    }
  }
  return results
}

function slugFromPath(filePath) {
  return filePath.replace(/\.md$/, '').replace(/\//g, '-')
}

function parseNote(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n')

  let frontmatter = {}
  let contentStart = 0
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
    if (end !== -1) {
      contentStart = end + 1
      for (let i = 1; i < end; i++) {
        const line = lines[i]
        const colon = line.indexOf(':')
        if (colon > 0) {
          const key = line.slice(0, colon).trim()
          const val = line.slice(colon + 1).trim()
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

  let title = frontmatter.title || ''
  if (!title) {
    const h1 = lines.slice(contentStart).find((l) => l.startsWith('# '))
    if (h1) title = h1.slice(2).trim()
  }
  if (!title) {
    title = path.basename(filePath, '.md')
  }

  let excerpt = ''
  for (const line of lines.slice(contentStart)) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('![')) {
      excerpt = trimmed.replace(/\[.*?\]\(.*?\)/g, '').trim()
      break
    }
  }
  if (excerpt.length > 200) excerpt = excerpt.slice(0, 200) + '...'

  const relPath = path.relative(NOTES_DIR, filePath)
  const folder = relPath.includes('/') ? relPath.split('/')[0] : '笔记'

  const outbound = [...raw.matchAll(/\[\[([^\]|]+)\]\]/g)].map((m) => m[1].trim())

  const date = frontmatter.date || new Date().toISOString().slice(0, 10)
  const tags = frontmatter.tags || []

  return {
    slug: slugFromPath(relPath),
    title,
    date,
    category: folder,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    excerpt,
    modified: date,
    outboundLinks: [...new Set(outbound)],
    filePath: relPath,
  }
}

function findMdFiles(dir, base = '') {
  const results = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${item.name}` : item.name
    if (item.name === 'index.json' || item.name === 'images' || item.name.startsWith('.')) continue
    if (item.isDirectory()) {
      results.push(...findMdFiles(path.join(dir, item.name), rel))
    } else if (item.name.endsWith('.md')) {
      results.push(path.join(dir, item.name))
    }
  }
  return results
}

const mdFiles = findMdFiles(NOTES_DIR)
console.log(`Found ${mdFiles.length} markdown files`)

const notes = mdFiles.map((f) => parseNote(f))
const tree = walk(NOTES_DIR)

const inbound = {}
for (const note of notes) {
  for (const target of note.outboundLinks) {
    const targetSlug = target.replace(/\//g, '-')
    if (!inbound[targetSlug]) inbound[targetSlug] = []
    if (!inbound[targetSlug].includes(note.slug)) {
      inbound[targetSlug].push(note.slug)
    }
  }
}

const index = { notes, tree, inboundLinks: inbound }
fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')
console.log(`Index written to ${INDEX_PATH}`)
console.log(`  Notes: ${notes.length}`)
console.log(`  Tree items: ${tree.length}`)
console.log(`  Inbound links: ${Object.keys(inbound).length}`)
